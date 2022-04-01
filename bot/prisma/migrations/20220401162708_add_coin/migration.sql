-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coin" INT4 NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "User_coin_idx" ON "User"("coin");
