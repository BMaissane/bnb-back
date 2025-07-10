/*
  Warnings:

  - You are about to drop the `timeslot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "reservation_timeslot_id_fkey";

-- DropForeignKey
ALTER TABLE "timeslot" DROP CONSTRAINT "timeslot_restaurant_id_fkey";

-- DropTable
DROP TABLE "timeslot";

-- CreateTable
CREATE TABLE "timeslots" (
    "id" SERIAL NOT NULL,
    "restaurant_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "TimeslotStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeslots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeslots_date_start_at_idx" ON "timeslots"("date", "start_at");

-- CreateIndex
CREATE INDEX "timeslots_restaurant_id_idx" ON "timeslots"("restaurant_id");

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_timeslot_id_fkey" FOREIGN KEY ("timeslot_id") REFERENCES "timeslots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timeslots" ADD CONSTRAINT "timeslots_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
