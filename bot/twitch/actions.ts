import prisma from "../prisma"
import { upsertUser } from "../upsertUser"

export async function onBits(username: string, amount: number) {
  if (amount <= 0) {
    throw Error("Amount of bits must be greater than zero")
  }
  await upsertUser(username)

  return await prisma.user.update({
    where: { name: username.toLowerCase() },
    data: { coin: { increment: amount * 3 } },
  })
}

// On Subs

// On Gifted Subs
