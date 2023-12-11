-- DropForeignKey
ALTER TABLE "account_managements" DROP CONSTRAINT "account_managements_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "account_managements" DROP CONSTRAINT "account_managements_user_id_fkey";

-- DropForeignKey
ALTER TABLE "supervisors" DROP CONSTRAINT "supervisors_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "supervisors" DROP CONSTRAINT "supervisors_supervisor_id_fkey";

-- AddForeignKey
ALTER TABLE "account_managements" ADD CONSTRAINT "account_managements_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_managements" ADD CONSTRAINT "account_managements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
