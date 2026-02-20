-- CreateTable
CREATE TABLE "LessonException" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "originalDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "newDate" TIMESTAMP(3),
    "modifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonException_originalDate_idx" ON "LessonException"("originalDate");

-- CreateIndex
CREATE INDEX "LessonException_lessonId_idx" ON "LessonException"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonException_lessonId_originalDate_key" ON "LessonException"("lessonId", "originalDate");

-- AddForeignKey
ALTER TABLE "LessonException" ADD CONSTRAINT "LessonException_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
