-- Create profile and organization for the new user account
-- User ID: 980542b7-f10c-4daa-bd65-ee0890528658

-- First, create a default organization if it doesn't exist
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (
  'default-org-001',
  'Default Organization',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create the user profile with admin role
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  organization_id,
  created_at,
  updated_at
) VALUES (
  '980542b7-f10c-4daa-bd65-ee0890528658',
  'drujstew@gmail.com',
  'DruStew',
  'admin',
  'default-org-001',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  organization_id = 'default-org-001',
  updated_at = NOW();
