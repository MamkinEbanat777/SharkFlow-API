-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "deviceId" VARCHAR(255),
ADD COLUMN     "lastUsedAt" TIMESTAMP(3);
