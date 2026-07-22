
-- Storage: admin has full access; clients read only files under their own folder (client_id/...)

CREATE POLICY "admin all buckets read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('videos','thumbnails','pdfs','avatars') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin all buckets insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('videos','thumbnails','pdfs','avatars') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin all buckets update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('videos','thumbnails','pdfs','avatars') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin all buckets delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('videos','thumbnails','pdfs','avatars') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "client reads own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('videos','thumbnails','pdfs','avatars')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
