-- ============================================
-- PartyU Admin Panel - Database Migration
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Add organizer-specific columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS person_type text CHECK (person_type IN ('pf', 'pj')),
ADD COLUMN IF NOT EXISTS cpf_cnpj text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS responsible_person text,
ADD COLUMN IF NOT EXISTS event_plans text,
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_number text,
ADD COLUMN IF NOT EXISTS address_complement text,
ADD COLUMN IF NOT EXISTS address_neighborhood text,
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_zip text,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. Add tracking columns for IP and last seen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_ip inet,
ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();

-- 3. Update role enum to include 'organizer' if not already present
-- Note: This might fail if the column is already using a different approach
-- If it fails, you can skip this step as the TypeScript type already handles it
DO $$
BEGIN
  -- Check if we need to update the role column
  -- This is a safe operation that won't fail if organizer already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'organizer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    -- Add 'organizer' to the enum if it doesn't exist
    -- Note: This assumes you have a user_role enum type
    -- If you're using text instead, this step can be skipped
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'organizer';
  END IF;
END$$;

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen_at) WHERE last_seen_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 5. Create a function to update last_seen_at automatically
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Optional: Create trigger to auto-update last_seen_at
-- (You can also update this from your application code)
-- DROP TRIGGER IF EXISTS trigger_update_last_seen ON profiles;
-- CREATE TRIGGER trigger_update_last_seen
--   BEFORE UPDATE ON profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION update_last_seen();

-- ============================================
-- Verification Queries
-- ============================================

-- Check if columns were added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN (
    'person_type', 'cpf_cnpj', 'company_name', 'responsible_person',
    'event_plans', 'address_street', 'address_number', 'address_complement',
    'address_neighborhood', 'address_city', 'address_state', 'address_zip',
    'status', 'last_ip', 'last_seen_at'
  )
ORDER BY column_name;

-- Check pending organizers
SELECT 
  id,
  full_name,
  person_type,
  status,
  created_at
FROM profiles
WHERE role = 'organizer' AND status = 'pending'
ORDER BY created_at DESC;

-- ============================================
-- Success!
-- ============================================
-- If all queries ran successfully, your database is ready for the new admin panel.
