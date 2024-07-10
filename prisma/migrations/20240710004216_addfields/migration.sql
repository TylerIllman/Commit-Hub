/*
  Warnings:

  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Streak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Streak" ("description", "emoji", "id", "name", "startDate", "updatedAt", "url", "userId") SELECT "description", "emoji", "id", "name", "startDate", "updatedAt", "url", "userId" FROM "Streak";
DROP TABLE "Streak";
ALTER TABLE "new_Streak" RENAME TO "Streak";
CREATE INDEX "Streak_userId_idx" ON "Streak"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "userName") SELECT "id", "userName" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE INDEX "User_id_idx" ON "User"("id");
CREATE INDEX "User_userName_idx" ON "User"("userName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
