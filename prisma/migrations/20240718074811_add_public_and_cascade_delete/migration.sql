/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Streak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "url" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Streak" ("description", "emoji", "id", "name", "startDate", "updatedAt", "url", "userId") SELECT "description", "emoji", "id", "name", "startDate", "updatedAt", "url", "userId" FROM "Streak";
DROP TABLE "Streak";
ALTER TABLE "new_Streak" RENAME TO "Streak";
CREATE INDEX "Streak_userId_idx" ON "Streak"("userId");
CREATE TABLE "new_StreakCompletion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "streakId" INTEGER NOT NULL,
    CONSTRAINT "StreakCompletion_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "Streak" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StreakCompletion" ("createdAt", "id", "streakId", "updatedAt") SELECT "createdAt", "id", "streakId", "updatedAt" FROM "StreakCompletion";
DROP TABLE "StreakCompletion";
ALTER TABLE "new_StreakCompletion" RENAME TO "StreakCompletion";
CREATE INDEX "StreakCompletion_streakId_idx" ON "StreakCompletion"("streakId");
DROP TABLE "new_User"
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME 
);
INSERT INTO "new_User" ("email", "firstName", "id", "lastName", "userName") SELECT "email", "firstName", "id", "lastName", "userName" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE INDEX "User_id_idx" ON "User"("id");
CREATE INDEX "User_userName_idx" ON "User"("userName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
