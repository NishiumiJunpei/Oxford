/*
  Warnings:

  - The primary key for the `Block` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blockId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `blockName` on the `Block` table. All the data in the column will be lost.
  - The primary key for the `Theme` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `themeId` on the `Theme` table. All the data in the column will be lost.
  - You are about to drop the column `themeName` on the `Theme` table. All the data in the column will be lost.
  - Added the required column `name` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_themeId_fkey";

-- DropForeignKey
ALTER TABLE "WordList" DROP CONSTRAINT "WordList_blockId_fkey";

-- AlterTable
ALTER TABLE "Block" DROP CONSTRAINT "Block_pkey",
DROP COLUMN "blockId",
DROP COLUMN "blockName",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "Block_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Theme" DROP CONSTRAINT "Theme_pkey",
DROP COLUMN "themeId",
DROP COLUMN "themeName",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "Theme_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_id_fkey" FOREIGN KEY ("id") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordList" ADD CONSTRAINT "WordList_id_fkey" FOREIGN KEY ("id") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
