-- FIX RLS Policies for Resources Table
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 1. Allow everyone to view resources (Select)
DROP POLICY IF EXISTS "Public can view resources" ON public.resources;
CREATE POLICY "Public can view resources"
ON public.resources FOR SELECT
USING (true);

-- 2. Allow Admins to Insert
DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
CREATE POLICY "Admins can insert resources"
ON public.resources FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 3. Allow Admins to Update
DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
CREATE POLICY "Admins can update resources"
ON public.resources FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- 4. Allow Admins to Delete
DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;
CREATE POLICY "Admins can delete resources"
ON public.resources FOR DELETE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- FIX RLS Policies for Storage (eng-docs)
-- Note: Storage policies are often on the 'storage.objects' table

-- 1. Allow Public to View/Download
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'eng-docs' );

-- 2. Allow Admins to Upload (Insert)
DROP POLICY IF EXISTS "Admins Upload" ON storage.objects;
CREATE POLICY "Admins Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'eng-docs' AND
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    )
);

-- 3. Allow Admins to Delete Files
DROP POLICY IF EXISTS "Admins Delete" ON storage.objects;
CREATE POLICY "Admins Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'eng-docs' AND
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    )
);
