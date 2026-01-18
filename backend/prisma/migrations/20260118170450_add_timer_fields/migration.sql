-- AlterTable
ALTER TABLE "UserTask" ADD COLUMN     "timerDuration" INTEGER,
ADD COLUMN     "timerPausedAt" TIMESTAMP(3),
ADD COLUMN     "timerRemainingSeconds" INTEGER,
ADD COLUMN     "timerStartedAt" TIMESTAMP(3);
