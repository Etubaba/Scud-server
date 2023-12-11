/*
  Warnings:

  - You are about to drop the `AccountManagement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountManagement" DROP CONSTRAINT "AccountManagement_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "AccountManagement" DROP CONSTRAINT "AccountManagement_user_id_fkey";

-- DropTable
DROP TABLE "AccountManagement";
