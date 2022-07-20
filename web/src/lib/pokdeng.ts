export interface IPlayer {
  name: string
  amount: number
  cards: Array<ICard>
  resultAmount?: number
}

export interface ICard {
  suit: number
  value: number
}

export interface IPokdengCommand {
  name: string
  command: string
  amount?: number
}

export function cardsToScore(cards: Array<ICard>) {
  return (
    cards
      .map((card) => {
        const scoreValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]

        return scoreValues[card.value]
      })
      .reduce((prev, curr) => prev + curr, 0) % 10
  )
}

export function isPok(cards: Array<ICard>): boolean {
  const score = cardsToScore(cards)
  return cards.length == 2 && (score == 8 || score == 9)
}

export function isThreeOfAKind(cards: Array<ICard>): boolean {
  return cards.length == 3 && cards[0].value == cards[1].value && cards[1].value == cards[2].value
}

export function isSamLueng(cards: Array<ICard>): boolean {
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const cardValues = cards.map((card) => values[card.value])

  const lueang = ["J", "Q", "K"]

  if (
    cardValues.length == 3 &&
    lueang.includes(cardValues[0]) &&
    lueang.includes(cardValues[1]) &&
    lueang.includes(cardValues[2])
  ) {
    return true
  }
  return false
}

export function isStraight(values: Array<string>): boolean {
  if (values.length !== 3) {
    return false
  }
  const valuesSorted = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

  const indices = values
    .map((value) => valuesSorted.findIndex((v) => v == value))
    .sort((a, b) => a - b)

  if (indices[0] < 0) {
    return false
  }

  if (indices[0] == indices[1] - 1 && indices[1] == indices[2] - 1) {
    return true
  }

  return false
}

export function cardsToDeng(cards: Array<ICard>): number {
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const suits = ["♠", "♥", "♣", "♦"]
  const cardValues = cards.map((card) => values[card.value])
  const cardSuits = cards.map((card) => suits[card.suit])

  // สองเด้ง
  if (cardSuits.length == 2 && (cardSuits[0] == cardSuits[1] || cards[0].value == cards[1].value)) {
    return 2
  }

  // ตอง (ห้าเด้ง)
  if (
    cardSuits.length == 3 &&
    cards[0].value == cards[1].value &&
    cards[1].value == cards[2].value
  ) {
    return 5
  }

  // สามเด้ง
  if (cardSuits.length == 3 && cardSuits[0] == cardSuits[1] && cardSuits[1] == cardSuits[2]) {
    return 3
  }

  // สามเหลือง
  const lueang = ["J", "Q", "K"]
  if (
    cardValues.length == 3 &&
    lueang.includes(cardValues[0]) &&
    lueang.includes(cardValues[1]) &&
    lueang.includes(cardValues[2])
  ) {
    return 3
  }

  // เรียง (Straight)
  if (isStraight(cardValues)) {
    return 3
  }

  return 1
}

export function calculateResult(dealer: IPlayer, player: IPlayer): number {
  const dealerScore = cardsToScore(dealer.cards)
  const playerScore = cardsToScore(player.cards)

  console.log({ dealerScore, playerScore })

  if (isPok(dealer.cards) && !isPok(player.cards)) {
    return -player.amount * cardsToDeng(dealer.cards)
  }

  if (!isPok(dealer.cards) && isPok(player.cards)) {
    return player.amount * cardsToDeng(player.cards)
  }

  if (isPok(dealer.cards) && isPok(player.cards)) {
    if (dealerScore < playerScore) {
      return player.amount * cardsToDeng(player.cards)
    }
    if (dealerScore > playerScore) {
      return -player.amount * cardsToDeng(dealer.cards)
    }
    return 0
  }

  if (!isThreeOfAKind(dealer.cards) && isThreeOfAKind(player.cards)) {
    return player.amount * 5
  }

  if (isThreeOfAKind(dealer.cards) && !isThreeOfAKind(player.cards)) {
    return -player.amount * 5
  }

  if (!isSamLueng(dealer.cards) && isSamLueng(player.cards)) {
    return player.amount * 3
  }

  if (isSamLueng(dealer.cards) && !isSamLueng(player.cards)) {
    return -player.amount * 3
  }

  if (dealerScore == playerScore) {
    return 0
  }

  if (dealerScore < playerScore) {
    return player.amount * cardsToDeng(player.cards)
  }

  if (dealerScore > playerScore) {
    return -player.amount * cardsToDeng(dealer.cards)
  }

  return -1
}

export function cardToString(suit: number, value: number) {
  const suits = ["♠", "♥", "♣", "♦"]
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

  return `${suits[suit]}${values[value]}`
}

export function handResult(player: IPlayer) {
  const cards = player.cards

  const results: Array<string> = []

  if (isPok(cards)) {
    results.push("ป๊อก")
  }

  results.push(`${cardsToScore(cards)}`)

  if (!isPok(cards)) {
    results.push("แต้ม")
  }

  const deng = cardsToDeng(cards)

  if (deng > 1) {
    results.push(`${deng} เด้ง`)
  }

  return results.join(" ")
}
