-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('templates', 'templates', true),
  ('assets', 'assets', true),
  ('renders', 'renders', true);

-- Storage policies for templates bucket (admin write, org read)
CREATE POLICY "Templates are viewable by organization members" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'templates' AND
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Admins can upload templates" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'templates' AND
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role = 'admin' AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Admins can update templates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'templates' AND
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role = 'admin' AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Admins can delete templates" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'templates' AND
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.role = 'admin' AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
  );

-- Storage policies for assets bucket (users can manage their own files)
CREATE POLICY "Users can view assets in their organization" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets' AND
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.organization_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Users can upload their own assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can update their own assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete their own assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Storage policies for renders bucket (server-side only)
CREATE POLICY "Users can view renders in their organization" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'renders' AND
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.organization_id::text = (storage.foldername(name))[1]
    )
  );

-- Only service role can write to renders bucket (server-side rendering)
CREATE POLICY "Service role can manage renders" ON storage.objects
  FOR ALL USING (bucket_id = 'renders' AND auth.role() = 'service_role');
