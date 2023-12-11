/*
  Warnings:

  - You are about to drop the `support_tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_tickets_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `support_titles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_city_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_user_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets_comments" DROP CONSTRAINT "support_tickets_comments_ticket_id_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets_comments" DROP CONSTRAINT "support_tickets_comments_user_id_fkey";

-- DropTable
DROP TABLE "support_tickets";

-- DropTable
DROP TABLE "support_tickets_comments";

-- DropTable
DROP TABLE "support_titles";

-- CreateTable
-- CREATE TABLE "time_online" (
--     "id" SERIAL NOT NULL,
--     "user_id" INTEGER NOT NULL,
--     "online" TIMESTAMP(3) NOT NULL,
--     "offline" TIMESTAMP(3) NOT NULL,
--     "time" INTEGER NOT NULL,
--     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3),

--     CONSTRAINT "time_online_pkey" PRIMARY KEY ("id")
-- );

-- CreateTable
CREATE TABLE "support_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "support_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_questions" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "support_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
-- ALTER TABLE "time_online" ADD CONSTRAINT "time_online_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_questions" ADD CONSTRAINT "support_questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "support_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
