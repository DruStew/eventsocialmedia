-- Remove all RLS policies and disable RLS for testing
-- This allows direct access to all functionality without authentication

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view templates in their organization" ON templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON templates;
DROP POLICY IF EXISTS "Users can view graphics in their organization" ON graphics;
DROP POLICY IF EXISTS "Users can create graphics in their organization" ON graphics;
DROP POLICY IF EXISTS "Users can update their own graphics" ON graphics;
DROP POLICY IF EXISTS "Admins can manage all graphics in their organization" ON graphics;

-- Disable RLS on all tables
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE graphics DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE graphic_folders DISABLE ROW LEVEL SECURITY;

-- Create storage buckets without RLS
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('templates', 'templates', true),
  ('graphics', 'graphics', true),
  ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view templates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload templates" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view graphics" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload graphics" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload assets" ON storage.objects;

-- Disable RLS on storage
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Add sample data for testing
INSERT INTO organizations (id, name, slug) 
VALUES ('test-org', 'Test Organization', 'test-org') 
ON CONFLICT (id) DO NOTHING;

-- Add sample templates for testing
INSERT INTO templates (id, name, description, svg_content, data_fields, organization_id, status) 
VALUES 
  (
    'sample-template-1',
    'Event Announcement',
    'Template for announcing events',
    '<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="#3B82F6"/><text x="540" y="400" text-anchor="middle" fill="white" font-size="48" font-family="Arial">{{event_name}}</text><text x="540" y="500" text-anchor="middle" fill="white" font-size="32" font-family="Arial">{{date}}</text><text x="540" y="600" text-anchor="middle" fill="white" font-size="24" font-family="Arial">{{location}}</text></svg>',
    '[{"name": "event_name", "type": "text", "label": "Event Name"}, {"name": "date", "type": "text", "label": "Date"}, {"name": "location", "type": "text", "label": "Location"}]',
    'test-org',
    'active'
  ),
  (
    'sample-template-2', 
    'Product Launch',
    'Template for product launches',
    '<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="#10B981"/><text x="540" y="400" text-anchor="middle" fill="white" font-size="52" font-family="Arial">{{product_name}}</text><text x="540" y="500" text-anchor="middle" fill="white" font-size="28" font-family="Arial">{{tagline}}</text><text x="540" y="600" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Available {{launch_date}}</text></svg>',
    '[{"name": "product_name", "type": "text", "label": "Product Name"}, {"name": "tagline", "type": "text", "label": "Tagline"}, {"name": "launch_date", "type": "text", "label": "Launch Date"}]',
    'test-org',
    'active'
  )
ON CONFLICT (id) DO NOTHING;
