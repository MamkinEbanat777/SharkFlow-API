/*
  Warnings:

  - A unique constraint covering the columns `[googleEmail]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_googleEmail_key" ON "users"("googleEmail");
