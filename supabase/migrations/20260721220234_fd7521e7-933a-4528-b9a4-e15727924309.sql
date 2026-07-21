
CREATE POLICY "Leitura pública de imagens de vagas"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'vaga-imagens');

CREATE POLICY "Admins podem enviar imagens de vagas"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vaga-imagens' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem actualizar imagens de vagas"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'vaga-imagens' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem eliminar imagens de vagas"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'vaga-imagens' AND public.has_role(auth.uid(), 'admin'));
