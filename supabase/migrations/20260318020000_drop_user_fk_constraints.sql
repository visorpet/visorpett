-- Drop FK constraints that reference the empty public.User table.
-- Auth is handled by Supabase Auth (auth.users), not by public.User.
-- This allows Pet, PetShop, Groomer, and Client to store auth user IDs
-- without requiring corresponding records in the unused public.User table.

ALTER TABLE "Pet"     DROP CONSTRAINT IF EXISTS "Pet_ownerId_fkey";
ALTER TABLE "PetShop" DROP CONSTRAINT IF EXISTS "PetShop_ownerId_fkey";
ALTER TABLE "Groomer" DROP CONSTRAINT IF EXISTS "Groomer_userId_fkey";
ALTER TABLE "Client"  DROP CONSTRAINT IF EXISTS "Client_userId_fkey";
