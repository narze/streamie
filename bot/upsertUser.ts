import prisma from "./prisma"

export async function upsertUser(name: string) {
  await prisma.user.upsert({
    create: {
      name,
    },
    update: {},
    where: {
      name,
    },
  })
}
