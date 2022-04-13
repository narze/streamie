import prisma from "../prisma"
import { upsertUser } from "../upsertUser"

export async function onBits(username: string, amount: number) {
  if (amount <= 0) {
    throw Error("Amount of bits must be greater than zero")
  }

  const coinAmount = amount * 3

  await upsertUser(username)

  await prisma.user.update({
    where: { name: username.toLowerCase() },
    data: { coin: { increment: coinAmount } },
  })

  return coinAmount
}

// On Subs

// On Gifted Subs
