/*
  Warnings:

  - You are about to alter the column `githubId` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `yandexId` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "githubId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "yandexId" SET DATA TYPE VARCHAR(255);
