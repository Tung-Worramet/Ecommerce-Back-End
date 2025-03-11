/*
  Warnings:

  - You are about to drop the column `addresses` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `addresses`,
    ADD COLUMN `address` VARCHAR(191) NULL;
