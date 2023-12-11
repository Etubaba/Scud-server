-- CreateTable
CREATE TABLE "liscenses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "license_number" TEXT NOT NULL,
    "front_image" TEXT NOT NULL,
    "back_image" TEXT NOT NULL,
    "verification" "Verification" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "liscenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "liscenses_user_id_key" ON "liscenses"("user_id");

-- AddForeignKey
ALTER TABLE "liscenses" ADD CONSTRAINT "liscenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
