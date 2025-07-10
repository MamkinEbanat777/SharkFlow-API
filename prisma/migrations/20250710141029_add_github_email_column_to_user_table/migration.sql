/*
  Warnings:

  - A unique constraint covering the columns `[githubEmail]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubEmail" VARCHAR(320);

-- CreateIndex
CREATE UNIQUE INDEX "users_githubEmail_key" ON "users"("githubEmail");
