import prisma from "./prisma"

export type Result = GachaResult | ErrorResult

export function isError(result: Result): result is ErrorResult {
  return (result as ErrorResult).error !== undefined
}

export interface GachaResult {
  data: {
    state: "win" | "lose"
    bet: number
    win: number
    balance: number
  }
}

export interface ErrorResult {
  error: string
}

export async function gacha(
  name: string,
  bet: number = 1
): Promise<GachaResult | ErrorResult> {
  if (!name || bet <= 0 || Number.isNaN(bet)) {
    return { error: "input_invalid" }
  }

  const user = await prisma.user.findUnique({ where: { name } })

  if (!user) {
    return { error: "user_not_found" }
  }

  let coin = user.coin

  if (coin < bet) {
    return { error: "not_enough_coin" }
  }

  let result = {
    bet,
    win: 0,
    state: "lose",
    balance: 0,
  }

  coin -= bet

  const dice = Math.random()

  if (dice < 0.49) {
    // Win
    const winAmount = Math.round(bet * 2)
    coin += winAmount

    result.win = winAmount
    result.state = "win"
    result.balance = coin
  } else {
    // Lose
    result.balance = coin
  }

  await prisma.user.update({
    where: { name },
    data: { coin },
  })

  return { data: result } as GachaResult
}
