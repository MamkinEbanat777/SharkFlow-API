/*
  Warnings:

  - You are about to drop the column `deviceId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `referrer` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[yandexEmail]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[yandexId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "deviceId",
DROP COLUMN "referrer",
DROP COLUMN "userAgent",
ADD COLUMN     "deviceSessionId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "yandexEmail" VARCHAR(320),
ADD COLUMN     "yandexId" TEXT,
ADD COLUMN     "yandexOAuthEnabled" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "user_device_sessions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" VARCHAR(255) NOT NULL,
    "deviceType" VARCHAR(100),
    "deviceBrand" VARCHAR(100),
    "deviceModel" VARCHAR(100),
    "osName" VARCHAR(100),
    "osVersion" VARCHAR(100),
    "clientName" VARCHAR(100),
    "clientVersion" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "geoLocation" JSONB,
    "userAgent" VARCHAR(512),
    "referrer" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_device_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_device_sessions_userId_idx" ON "user_device_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_device_sessions_deviceId_idx" ON "user_device_sessions"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_yandexEmail_key" ON "users"("yandexEmail");

-- CreateIndex
CREATE UNIQUE INDEX "users_yandexId_key" ON "users"("yandexId");

-- AddForeignKey
ALTER TABLE "user_device_sessions" ADD CONSTRAINT "user_device_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_deviceSessionId_fkey" FOREIGN KEY ("deviceSessionId") REFERENCES "user_device_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
