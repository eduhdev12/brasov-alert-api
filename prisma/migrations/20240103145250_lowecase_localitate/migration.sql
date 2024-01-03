/*
  Warnings:

  - You are about to drop the column `Localitate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Localitate",
ADD COLUMN     "localitate" "Localitate";
