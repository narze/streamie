import prisma from "./prisma"

export async function upsertUser(name: string, twitchId?: string) {
  if (twitchId) {
    return await prisma.user.upsert({
      create: {
        name,
        twitchId,
      },
      update: { twitchId },
      where: {
        name,
      },
    })
  }

  return await prisma.user.upsert({
    create: {
      name,
    },
    update: {},
    where: {
      name,
    },
  })
}
