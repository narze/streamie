import { PrismaClient } from "@prisma/client"

let prisma = new PrismaClient()

prisma.$on("beforeExit", async () => {
  console.log("Prisma Client is disconnecting...")
})

export default prisma
