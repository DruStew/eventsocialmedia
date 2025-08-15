-- Fix the trigger function to copy role from raw_user_meta_data
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'producer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a default organization for testing
INSERT INTO organizations (id, name, slug, brand_colors)
VALUES (
  gen_random_uuid(),
  'Default Organization',
  'default-org',
  '["#3B82F6", "#1E40AF", "#F3F4F6"]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Create/update profile for existing user and assign to organization
WITH default_org AS (
  SELECT id FROM organizations WHERE slug = 'default-org' LIMIT 1
)
INSERT INTO profiles (id, email, full_name, role, organization_id)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name',
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'admin'),
  default_org.id
FROM auth.users u, default_org
WHERE u.email = 'drujstew@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = COALESCE((auth.users.raw_user_meta_data->>'role')::user_role, 'admin'),
  organization_id = EXCLUDED.organization_id,
  updated_at = NOW();
