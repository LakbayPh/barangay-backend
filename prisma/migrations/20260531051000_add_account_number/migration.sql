-- CreateSequence
CREATE SEQUENCE "users_account_number_seq";

-- AlterTable
ALTER TABLE "users" ADD COLUMN "account_number" INTEGER;

-- Backfill existing users before making the column required.
UPDATE "users"
SET "account_number" = nextval('"users_account_number_seq"'::regclass)
WHERE "account_number" IS NULL;

ALTER TABLE "users" ALTER COLUMN "account_number" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "account_number" SET DEFAULT nextval('"users_account_number_seq"'::regclass);

-- AddForeignKey
ALTER SEQUENCE "users_account_number_seq" OWNED BY "users"."account_number";

-- CreateIndex
CREATE UNIQUE INDEX "users_account_number_key" ON "users"("account_number");
