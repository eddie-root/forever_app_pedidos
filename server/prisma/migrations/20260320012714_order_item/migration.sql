/*
  Warnings:

  - You are about to drop the column `colorFabrics` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `materialName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "colorFabrics",
ADD COLUMN     "colorTelas" TEXT,
ADD COLUMN     "discount3" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discount4" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "materialName" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "structureName" TEXT NOT NULL;
