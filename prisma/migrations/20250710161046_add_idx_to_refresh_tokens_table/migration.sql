-- CreateIndex
CREATE INDEX "refresh_tokens_userId_revoked_idx" ON "refresh_tokens"("userId", "revoked");
