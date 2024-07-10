/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastName" TEXT
);
INSERT INTO "new_User" ("email", "id", "userName") SELECT "email", "id", "userName" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE INDEX "User_id_idx" ON "User"("id");
CREATE INDEX "User_userName_idx" ON "User"("userName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
