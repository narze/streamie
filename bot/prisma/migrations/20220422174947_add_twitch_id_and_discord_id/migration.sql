-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discordId" VARCHAR;
ALTER TABLE "User" ADD COLUMN     "twitchId" VARCHAR;

-- CreateIndex
CREATE INDEX "User_twitchId_idx" ON "User"("twitchId");

-- CreateIndex
CREATE INDEX "User_discordId_idx" ON "User"("discordId");
