/*
  Warnings:

  - You are about to drop the column `modifications` on the `LessonException` table. All the data in the column will be lost.
  - You are about to drop the column `newDate` on the `LessonException` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LessonException" DROP COLUMN "modifications",
DROP COLUMN "newDate";
