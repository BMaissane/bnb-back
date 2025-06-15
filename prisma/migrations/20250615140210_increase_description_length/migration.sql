-- AlterTable
ALTER TABLE "restaurant" ALTER COLUMN "description" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "last_name" DROP NOT NULL,
ALTER COLUMN "resetToken" SET DATA TYPE VARCHAR(255);
