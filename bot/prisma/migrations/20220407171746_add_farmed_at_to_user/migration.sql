-- AlterTable
ALTER TABLE "User" ADD COLUMN     "farmedAt" TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "User_farmedAt_idx" ON "User"("farmedAt");
