import { PrismaClient } from "@prisma/client"
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended"
import { beforeEach, vi } from "vitest"

import prisma from "../src/prisma"

vi.mock("../prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
