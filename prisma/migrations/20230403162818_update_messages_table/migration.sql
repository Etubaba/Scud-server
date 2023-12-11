-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "time_online" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "online" TIMESTAMP(3) NOT NULL,
    "offline" TIMESTAMP(3) NOT NULL,
    "time" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "time_online_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "time_online" ADD CONSTRAINT "time_online_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
