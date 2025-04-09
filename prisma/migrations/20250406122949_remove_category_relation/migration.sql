/*
  Warnings:

  - You are about to drop the column `categoryId` on the `food` table. All the data in the column will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `food` DROP FOREIGN KEY `Food_categoryId_fkey`;

-- DropIndex
DROP INDEX `Food_categoryId_fkey` ON `food`;

-- AlterTable
ALTER TABLE `food` DROP COLUMN `categoryId`,
    ADD COLUMN `category` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `category`;
