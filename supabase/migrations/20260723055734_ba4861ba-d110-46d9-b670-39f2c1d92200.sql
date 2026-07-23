
CREATE POLICY "Qualquer um pode enviar candidatura" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'candidaturas');
CREATE POLICY "Admins podem ver candidaturas" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'candidaturas' AND public.has_role(auth.uid(), 'admin'));
