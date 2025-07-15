/*
  Warnings:

  - You are about to drop the `user_oauth_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_oauth_accounts" DROP CONSTRAINT "user_oauth_accounts_userId_fkey";

-- DropTable
DROP TABLE "user_oauth_accounts";
