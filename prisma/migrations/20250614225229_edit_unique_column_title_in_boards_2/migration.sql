/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `boards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,title]` on the table `boards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "boards_title_key" ON "boards"("title");

-- CreateIndex
CREATE UNIQUE INDEX "boards_userId_title_key" ON "boards"("userId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_title_key" ON "tasks"("title");
