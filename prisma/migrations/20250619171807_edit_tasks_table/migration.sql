/*
  Warnings:

  - You are about to drop the column `color` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `tasks` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(64)`.
  - A unique constraint covering the columns `[boardId,title]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropIndex
DROP INDEX "tasks_title_key";

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "token" SET DATA TYPE VARCHAR(2048);

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "color",
DROP COLUMN "completed",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "title" SET DATA TYPE VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_boardId_title_key" ON "tasks"("boardId", "title");
