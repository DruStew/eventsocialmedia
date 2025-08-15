-- Disable RLS for testing purposes
-- This allows direct access to tables without authentication

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
INSERT INTO templates (id, name, description, svg_content, data_fields, status, organization_id, created_at)
VALUES 
  (
    'template-001',
    'Event Announcement',
    'Perfect for announcing upcoming events with customizable text fields',
    '<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="#3B82F6"/><text x="540" y="400" text-anchor="middle" fill="white" font-size="48" font-family="Arial">{{event_name}}</text><text x="540" y="500" text-anchor="middle" fill="white" font-size="32" font-family="Arial">{{date}}</text><text x="540" y="600" text-anchor="middle" fill="white" font-size="24" font-family="Arial">{{location}}</text></svg>',
    '[{"id": "event_name", "label": "Event Name", "type": "text"}, {"id": "date", "label": "Date", "type": "text"}, {"id": "location", "label": "Location", "type": "text"}]'::jsonb,
    'active',
    'test-org-001',
    NOW()
  ),
  (
    'template-002', 
    'Product Launch',
    'Showcase new products with customizable product name and description',
    '<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><rect width="1080" height="1080" fill="#10B981"/><text x="540" y="400" text-anchor="middle" fill="white" font-size="52" font-family="Arial">{{product_name}}</text><text x="540" y="500" text-anchor="middle" fill="white" font-size="28" font-family="Arial">{{description}}</text><text x="540" y="650" text-anchor="middle" fill="white" font-size="36" font-family="Arial">{{price}}</text></svg>',
    '[{"id": "product_name", "label": "Product Name", "type": "text"}, {"id": "description", "label": "Description", "type": "text"}, {"id": "price", "label": "Price", "type": "text"}]'::jsonb,
    'active',
    'test-org-001',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;
