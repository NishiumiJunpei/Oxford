/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Theme` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Theme" DROP COLUMN "imageUrl",
ADD COLUMN     "imageFilename" TEXT;
