-- Add businessHours column to PetShop table
ALTER TABLE "PetShop" ADD COLUMN IF NOT EXISTS "businessHours" JSONB;
