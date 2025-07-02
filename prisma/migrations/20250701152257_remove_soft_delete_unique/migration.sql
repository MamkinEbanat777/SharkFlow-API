-- DropIndex
DROP INDEX "boards_userId_title_isDeleted_key";

-- CreateIndex
CREATE INDEX "boards_userId_title_idx" ON "boards"("userId", "title");

CREATE UNIQUE INDEX boards_unique_active_title_per_user
  ON "boards"("userId", "title")
  WHERE "isDeleted" = FALSE;