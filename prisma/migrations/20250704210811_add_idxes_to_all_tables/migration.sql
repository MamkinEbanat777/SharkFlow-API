-- CreateIndex
CREATE INDEX "boards_userId_isDeleted_idx" ON "boards"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "boards_userId_isPinned_isFavorite_updatedAt_idx" ON "boards"("userId", "isPinned", "isFavorite", "updatedAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "tasks_boardId_isDeleted_idx" ON "tasks"("boardId", "isDeleted");

-- CreateIndex
CREATE INDEX "users_uuid_isDeleted_idx" ON "users"("uuid", "isDeleted");

-- CreateIndex
CREATE INDEX "users_email_isDeleted_idx" ON "users"("email", "isDeleted");
