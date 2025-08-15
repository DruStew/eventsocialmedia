-- Disable Row Level Security for testing core functionality
-- This allows direct access to all tables without authentication

-- Disable RLS on all tables
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE graphics DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE graphic_folders DISABLE ROW LEVEL SECURITY;

-- Insert some sample data for testing
INSERT INTO organizations (id, name, slug) 
VALUES ('test-org-001', 'Test Organization', 'test-org') 
ON CONFLICT (slug) DO NOTHING;

-- Insert sample templates for testing
INSERT INTO templates (id, name, description, svg_content, data_fields, status, organization_id) 
VALUES (
  'sample-template-001',
  'Event Announcement',
  'A template for announcing events with customizable text fields',
  '<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="#3B82F6"/><text x="540" y="400" text-anchor="middle" fill="white" font-size="48" font-family="Arial">{{event_name}}</text><text x="540" y="500" text-anchor="middle" fill="white" font-size="32" font-family="Arial">{{date}}</text><text x="540" y="600" text-anchor="middle" fill="white" font-size="24" font-family="Arial">{{location}}</text></svg>',
  '[{"id": "event_name", "label": "Event Name", "type": "text"}, {"id": "date", "label": "Date", "type": "text"}, {"id": "location", "label": "Location", "type": "text"}]'::jsonb,
  'active',
  'test-org-001'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO templates (id, name, description, svg_content, data_fields, status, organization_id) 
VALUES (
  'sample-template-002',
  'Product Launch',
  'A template for product launches with logo and description',
  '<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="#10B981"/><text x="540" y="300" text-anchor="middle" fill="white" font-size="56" font-family="Arial">{{product_name}}</text><text x="540" y="500" text-anchor="middle" fill="white" font-size="28" font-family="Arial">{{tagline}}</text><text x="540" y="700" text-anchor="middle" fill="white" font-size="20" font-family="Arial">{{launch_date}}</text></svg>',
  '[{"id": "product_name", "label": "Product Name", "type": "text"}, {"id": "tagline", "label": "Tagline", "type": "text"}, {"id": "launch_date", "label": "Launch Date", "type": "text"}]'::jsonb,
  'active',
  'test-org-001'
) ON CONFLICT (id) DO NOTHING;
