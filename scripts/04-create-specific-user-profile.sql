-- Create profile and organization for specific user
-- User ID: 4a9eb4b9-812c-425e-a4e6-3abfa830b7ab
-- Email: drujstew@gmail.com

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
  '4a9eb4b9-812c-425e-a4e6-3abfa830b7ab',
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

-- Verify the profile was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.organization_id,
  o.name as organization_name
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.id = '4a9eb4b9-812c-425e-a4e6-3abfa830b7ab';
