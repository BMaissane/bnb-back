-- DropForeignKey
ALTER TABLE "restaurant" DROP CONSTRAINT "restaurant_owner_id_fkey";

-- DropIndex
DROP INDEX "restaurant_owner_id_key";

-- AddForeignKey
ALTER TABLE "restaurant" ADD CONSTRAINT "restaurant_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
