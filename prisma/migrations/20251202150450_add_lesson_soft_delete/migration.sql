-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Lesson_deletedAt_idx" ON "Lesson"("deletedAt");
