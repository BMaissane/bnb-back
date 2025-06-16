/*
  Warnings:

  - The `opening_hours` column on the `restaurant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "restaurant" DROP COLUMN "opening_hours",
ADD COLUMN     "opening_hours" JSONB;
