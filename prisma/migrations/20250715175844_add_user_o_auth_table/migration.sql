/*
  Warnings:

  - You are about to drop the column `githubEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `githubId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `githubOAuthEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleOAuthEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `googleSub` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `telegramEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `telegramId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `yandexEmail` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `yandexId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `yandexOAuthEnabled` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_githubEmail_key";

-- DropIndex
DROP INDEX "users_githubId_key";

-- DropIndex
DROP INDEX "users_googleEmail_key";

-- DropIndex
DROP INDEX "users_googleSub_key";

-- DropIndex
DROP INDEX "users_telegramId_key";

-- DropIndex
DROP INDEX "users_yandexEmail_key";

-- DropIndex
DROP INDEX "users_yandexId_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "githubEmail",
DROP COLUMN "githubId",
DROP COLUMN "githubOAuthEnabled",
DROP COLUMN "googleEmail",
DROP COLUMN "googleOAuthEnabled",
DROP COLUMN "googleSub",
DROP COLUMN "telegramEnabled",
DROP COLUMN "telegramId",
DROP COLUMN "yandexEmail",
DROP COLUMN "yandexId",
DROP COLUMN "yandexOAuthEnabled";

-- CreateTable
CREATE TABLE "user_oauth" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" VARCHAR(320),
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_oauth_userId_idx" ON "user_oauth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_provider_providerId_key" ON "user_oauth"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
