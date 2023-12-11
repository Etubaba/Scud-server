-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('otp', 'trip_completed', 'welcome', 'notification');

-- CreateTable
CREATE TABLE "mail_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "template_type" "TemplateType" NOT NULL,
    "path" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "mail_templates_pkey" PRIMARY KEY ("id")
);
