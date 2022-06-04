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
    state: "win",
    balance: 0,
  }

  coin -= bet

  const investReturn = invest(bet)
  coin += investReturn

  result.win = investReturn
  result.balance = coin

  await prisma.user.update({
    where: { name },
    data: { coin },
  })

  return { data: result } as GachaResult
}

function invest(investAmount: number): number {
  // Investing formula
  // 55% to return 0-1x
  // 43% to return 1x-2x
  // 2% to return 2-5x (jackpot)
  // [probMin, probMax], [returnMin, returnMax]
  const ranges = [
    [
      [0, 0.55],
      [0, 1],
    ],
    [
      [0.55, 0.98],
      [1, 2.0],
    ],
    [
      [0.98, 1],
      [2.0, 5.0],
    ],
  ]

  const probIn = Math.random()
  const [[pmin, pmax], [rmin, rmax]] = ranges.find(
    ([[pmin, pmax]]) => probIn >= pmin && probIn < pmax
  )!
  const investReturn = Math.round(
    investAmount * (((probIn - pmin) / (pmax - pmin)) * (rmax - rmin) + rmin)
  )

  if (investReturn == investAmount) {
    return investReturn + (probIn > 0.58 ? 1 : -1)
  }

  return investReturn
}
