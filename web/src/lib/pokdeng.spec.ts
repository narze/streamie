import { calculateResult, isStraight, type IPlayer } from "./pokdeng"

const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const valueToIndex = (value: string) => values.findIndex((v) => v == value)
const suits = ["♠", "♥", "♣", "♦"]
const suitToIndex = (suit: string) => suits.findIndex((s) => s == suit)

function playerGenerator(amount: number, cards: Array<string>): IPlayer {
  return {
    name: "Dealer",
    amount,
    cards: cards.map((c) => {
      const [suit, value] = c.split("")

      if (valueToIndex(value) == -1) {
        throw new Error(`Invalid card value ${value}`)
      }
      return {
        suit: suitToIndex(suit),
        value: valueToIndex(value),
      }
    }),
  }
}
it("works", () => {
  expect(1 + 1).toBe(2)
})

describe("calculateResult", () => {
  it("exists", () => {
    expect(calculateResult).toBeDefined()
  })

  it("receives dealer hand and player hand, and return result", () => {
    const dealer: IPlayer = playerGenerator(0, ["♦A", "♣Q"])
    const player: IPlayer = playerGenerator(10, ["♣A", "♦Q"])

    expect(calculateResult(dealer, player)).toBe(0)
  })

  it("returns player's amount if player wins", () => {
    const dealer: IPlayer = playerGenerator(0, ["♦A", "♣2"])
    const player: IPlayer = playerGenerator(10, ["♣7", "♦Q"])

    expect(calculateResult(dealer, player)).toBe(10)
  })

  it("returns negative player's amount if player loses", () => {
    const dealer: IPlayer = playerGenerator(0, ["♦7", "♣2"])
    const player: IPlayer = playerGenerator(10, ["♣7", "♦Q"])

    expect(calculateResult(dealer, player)).toBe(-10)
  })

  describe("pok vs non-pok", () => {
    it("who has Pok wins (dealer)", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦Q", "♦2"])

      expect(calculateResult(dealer, player)).toBe(-10)
    })

    it("who has Pok wins (player)", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♦Q", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(10)
    })
  })

  describe("both Pok", () => {
    it("results in a draw", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♣A"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(0)
    })
  })

  describe("Deng", () => {
    it("multiplies win with player's Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♣Q", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♦7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(20)
    })

    it("multiplies lose with dealer's Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♣Q", "♣2"]) // 3 Deng
      const player: IPlayer = playerGenerator(10, ["♦3", "♦2"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })
  })

  describe("Tong (3 of a kind)", () => {
    it("multiplies win with 5 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♣3", "♦3", "♥3"])

      expect(calculateResult(dealer, player)).toBe(50)
    })

    it("multiplies lose with 5 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣3", "♦3", "♥3"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-50)
    })
  })

  describe("3-Lueng", () => {
    it("multiplies win with 3 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♣J", "♦J", "♥Q"])

      expect(calculateResult(dealer, player)).toBe(30)
    })

    it("multiplies lose with 3 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣J", "♦J", "♥Q"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })
  })

  describe("straights", () => {
    it("multiplies win with 3 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♣2", "♦3", "♥4"])

      expect(calculateResult(dealer, player)).toBe(30)
    })

    it("multiplies lose with 3 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣2", "♦3", "♥4"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })
  })
})

describe("isStraight", () => {
  it("returns true for 2,3,4", () => {
    expect(isStraight(["2", "4", "3"])).toBe(true)
  })
  it("returns true for 5,6,7", () => {
    expect(isStraight(["7", "5", "6"])).toBe(true)
  })
  it("returns true for 10,J,Q", () => {
    expect(isStraight(["10", "Q", "J"])).toBe(true)
  })
  it("returns true for Q,K,A", () => {
    expect(isStraight(["A", "Q", "K"])).toBe(true)
  })
  it("returns false for K,A,2", () => {
    expect(isStraight(["A", "2", "K"])).toBe(false)
  })
  it("returns false for non straight pattern", () => {
    expect(isStraight(["2", "2", "3"])).toBe(false)
  })
})
