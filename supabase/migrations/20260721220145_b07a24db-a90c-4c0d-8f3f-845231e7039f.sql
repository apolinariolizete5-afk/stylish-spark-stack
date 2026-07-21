
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- Tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabela de vagas
CREATE TABLE public.vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  empresa TEXT NOT NULL,
  provincia TEXT NOT NULL,
  descricao TEXT NOT NULL,
  requisitos TEXT,
  tipo_contrato TEXT,
  salario TEXT,
  prazo DATE,
  como_candidatar TEXT,
  imagem_url TEXT,
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  publicada BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vagas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vagas TO authenticated;
GRANT ALL ON public.vagas TO service_role;
ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver vagas publicadas"
  ON public.vagas FOR SELECT
  TO anon, authenticated
  USING (publicada = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir vagas"
  ON public.vagas FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem actualizar vagas"
  ON public.vagas FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem eliminar vagas"
  ON public.vagas FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_vagas_created_at ON public.vagas(created_at DESC);
CREATE INDEX idx_vagas_provincia ON public.vagas(provincia);
CREATE INDEX idx_vagas_publicada ON public.vagas(publicada);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vagas_updated_at
BEFORE UPDATE ON public.vagas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de visualizações
CREATE TABLE public.vaga_visualizacoes (
  id BIGSERIAL PRIMARY KEY,
  vaga_id UUID NOT NULL REFERENCES public.vagas(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.vaga_visualizacoes TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.vaga_visualizacoes_id_seq TO anon, authenticated;
GRANT SELECT ON public.vaga_visualizacoes TO authenticated;
GRANT ALL ON public.vaga_visualizacoes TO service_role;
GRANT ALL ON SEQUENCE public.vaga_visualizacoes_id_seq TO service_role;
ALTER TABLE public.vaga_visualizacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode registar visualizacao"
  ON public.vaga_visualizacoes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins podem ver visualizacoes"
  ON public.vaga_visualizacoes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_visualizacoes_vaga ON public.vaga_visualizacoes(vaga_id);
CREATE INDEX idx_visualizacoes_viewed_at ON public.vaga_visualizacoes(viewed_at DESC);

-- Função para incrementar visualizações (bypassa RLS de UPDATE)
CREATE OR REPLACE FUNCTION public.registar_visualizacao(_vaga_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.vaga_visualizacoes (vaga_id) VALUES (_vaga_id);
  UPDATE public.vagas SET visualizacoes = visualizacoes + 1 WHERE id = _vaga_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registar_visualizacao(UUID) TO anon, authenticated;
