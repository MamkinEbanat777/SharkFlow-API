/*
  Warnings:

  - A unique constraint covering the columns `[userId,title,isDeleted]` on the table `boards` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "boards_userId_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "boards_userId_title_isDeleted_key" ON "boards"("userId", "title", "isDeleted");
