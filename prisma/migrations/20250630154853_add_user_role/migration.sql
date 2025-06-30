-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'moderator', 'guest');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" DEFAULT 'user';
