-- AlterTable
ALTER TABLE "users" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorPendingSecret" VARCHAR(64),
ADD COLUMN     "twoFactorSecret" VARCHAR(64);
