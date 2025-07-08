-- CreateIndex
CREATE INDEX "timeslot_date_start_at_idx" ON "timeslot"("date", "start_at");

-- CreateIndex
CREATE INDEX "timeslot_restaurant_id_idx" ON "timeslot"("restaurant_id");
