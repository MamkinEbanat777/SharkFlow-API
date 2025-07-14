/*
  Warnings:

  - A unique constraint covering the columns `[userId,deviceId]` on the table `user_device_sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "two_factor_backup_codes" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "userId" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "two_factor_backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_backup_codes_uuid_key" ON "two_factor_backup_codes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_backup_codes_code_key" ON "two_factor_backup_codes"("code");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_userId_used_idx" ON "two_factor_backup_codes"("userId", "used");

-- CreateIndex
CREATE INDEX "two_factor_backup_codes_uuid_idx" ON "two_factor_backup_codes"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "user_device_sessions_userId_deviceId_key" ON "user_device_sessions"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "two_factor_backup_codes" ADD CONSTRAINT "two_factor_backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
