-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('email', 'phone');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('login', 'register', 'email', 'phone');

-- CreateEnum
CREATE TYPE "Verification" AS ENUM ('failed', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "gender" "Gender",
    "email_verified" BOOLEAN,
    "phone_verified" BOOLEAN,
    "provider" "Provider" NOT NULL DEFAULT 'phone',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
