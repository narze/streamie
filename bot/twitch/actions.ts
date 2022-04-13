import axios from "axios"
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
export async function onSub(username: string) {
  const coinAmount = 100
  const airdropAmount = 5

  await upsertUser(username)

  await prisma.user.update({
    where: { name: username.toLowerCase() },
    data: { coin: { increment: coinAmount } },
  })

  const chattersResponse = await axios.get(
    "https://tmi.twitch.tv/group/user/narzelive/chatters",
    { responseType: "json" }
  )

  const moderators = chattersResponse.data.chatters.moderators
  const staff = chattersResponse.data.chatters.staff
  const viewers = chattersResponse.data.chatters.viewers
  const vips = chattersResponse.data.chatters.vips
  const allViewers = [...moderators, ...staff, ...viewers, ...vips]

  // Upsert user
  await prisma.user.createMany({
    data: viewers.map((v) => ({ name: v })),
    skipDuplicates: true,
  })

  const updateResult = await prisma.user.updateMany({
    data: {
      coin: {
        increment: airdropAmount,
      },
    },
    where: {
      name: { in: allViewers },
    },
  })

  return updateResult.count
}

// On Gifted Subs
export async function onGiftSub(username: string, numberOfSubs: number) {
  const coinAmount = numberOfSubs * 100

  await upsertUser(username)

  await prisma.user.update({
    where: { name: username.toLowerCase() },
    data: { coin: { increment: coinAmount } },
  })

  return coinAmount
}
