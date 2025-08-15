-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'producer', 'viewer');
CREATE TYPE template_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE graphic_status AS ENUM ('draft', 'completed', 'archived');

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role user_role DEFAULT 'viewer',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  svg_content TEXT NOT NULL,
  data_fields JSONB DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  status template_status DEFAULT 'draft',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graphics table
CREATE TABLE IF NOT EXISTS graphics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  data_values JSONB DEFAULT '{}'::jsonb,
  png_url TEXT,
  status graphic_status DEFAULT 'draft',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders table for organization
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graphics to folders relationship
CREATE TABLE IF NOT EXISTS graphic_folders (
  graphic_id UUID REFERENCES graphics(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  PRIMARY KEY (graphic_id, folder_id)
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE graphics ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE graphic_folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage organizations" ON organizations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND organization_id = organizations.id
  ));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their organization" ON profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin' AND p.organization_id = profiles.organization_id
  ));

-- RLS Policies for templates
CREATE POLICY "Users can view templates in their organization" ON templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage templates" ON templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND organization_id = templates.organization_id
  ));

-- RLS Policies for graphics
CREATE POLICY "Users can view graphics in their organization" ON graphics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create graphics in their organization" ON graphics
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own graphics" ON graphics
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all graphics in their organization" ON graphics
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND organization_id = graphics.organization_id
  ));

-- Create indexes for performance
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_templates_organization_id ON templates(organization_id);
CREATE INDEX idx_graphics_organization_id ON graphics(organization_id);
CREATE INDEX idx_graphics_template_id ON graphics(template_id);
CREATE INDEX idx_folders_organization_id ON folders(organization_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
