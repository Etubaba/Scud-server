-- CreateEnum
CREATE TYPE "TermsCategory" AS ENUM ('driver', 'rider', 'general');

-- DropEnum
DROP TYPE "CarClass";

-- DropEnum
DROP TYPE "SupportTicketStatus";

-- CreateTable
CREATE TABLE "terms_of_services" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "content" TEXT NOT NULL,
    "category" "TermsCategory" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "terms_of_services_pkey" PRIMARY KEY ("id")
);
