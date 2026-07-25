-- 1) Preservar visualizações ao eliminar vagas
ALTER TABLE public.vaga_visualizacoes ADD COLUMN IF NOT EXISTS vaga_titulo text;
ALTER TABLE public.vaga_visualizacoes ALTER COLUMN vaga_id DROP NOT NULL;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.vaga_visualizacoes'::regclass AND contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.vaga_visualizacoes DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.vaga_visualizacoes
  ADD CONSTRAINT vaga_visualizacoes_vaga_id_fkey
  FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE SET NULL;

UPDATE public.vaga_visualizacoes vv
SET vaga_titulo = v.titulo
FROM public.vagas v
WHERE vv.vaga_id = v.id AND vv.vaga_titulo IS NULL;

CREATE OR REPLACE FUNCTION public.registar_visualizacao(_vaga_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _titulo text;
BEGIN
  SELECT titulo INTO _titulo FROM public.vagas WHERE id = _vaga_id;
  IF _titulo IS NULL THEN
    RETURN;
  END IF;
  INSERT INTO public.vaga_visualizacoes (vaga_id, vaga_titulo) VALUES (_vaga_id, _titulo);
  UPDATE public.vagas SET visualizacoes = visualizacoes + 1 WHERE id = _vaga_id;
END;
$$;

-- 2) Slug próprio por vaga
ALTER TABLE public.vagas ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.unaccent_placeholder(_txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT translate(_txt,
    'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN');
$$;

CREATE OR REPLACE FUNCTION public.slugify(_txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(lower(public.unaccent_placeholder(_txt)), '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.vagas_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _base text; _slug text; _i int := 1;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' AND (TG_OP = 'UPDATE' AND NEW.slug <> OLD.slug) THEN
    _base := public.slugify(NEW.slug);
  ELSE
    _base := public.slugify(NEW.titulo);
  END IF;
  IF _base IS NULL OR _base = '' THEN _base := 'vaga'; END IF;
  _slug := _base;
  WHILE EXISTS (SELECT 1 FROM public.vagas WHERE slug = _slug AND id <> NEW.id) LOOP
    _i := _i + 1;
    _slug := _base || '-' || _i;
  END LOOP;
  NEW.slug := _slug;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vagas_slug_trigger ON public.vagas;
CREATE TRIGGER vagas_slug_trigger
BEFORE INSERT OR UPDATE OF titulo, slug ON public.vagas
FOR EACH ROW EXECUTE FUNCTION public.vagas_set_slug();

UPDATE public.vagas SET slug = NULL WHERE slug IS NULL;

DO $$
DECLARE r record; _base text; _slug text; _i int;
BEGIN
  FOR r IN SELECT id, titulo FROM public.vagas WHERE slug IS NULL LOOP
    _base := public.slugify(r.titulo);
    IF _base IS NULL OR _base = '' THEN _base := 'vaga'; END IF;
    _slug := _base; _i := 1;
    WHILE EXISTS (SELECT 1 FROM public.vagas WHERE slug = _slug) LOOP
      _i := _i + 1;
      _slug := _base || '-' || _i;
    END LOOP;
    UPDATE public.vagas SET slug = _slug WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS vagas_slug_key ON public.vagas (slug);