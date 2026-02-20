-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "recurringPattern" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonTeacher" (
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LessonTeacher_pkey" PRIMARY KEY ("lessonId","userId")
);

-- CreateTable
CREATE TABLE "LessonPupil" (
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LessonPupil_pkey" PRIMARY KEY ("lessonId","userId")
);

-- CreateIndex
CREATE INDEX "Lesson_startDate_endDate_idx" ON "Lesson"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "LessonTeacher" ADD CONSTRAINT "LessonTeacher_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTeacher" ADD CONSTRAINT "LessonTeacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPupil" ADD CONSTRAINT "LessonPupil_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPupil" ADD CONSTRAINT "LessonPupil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
