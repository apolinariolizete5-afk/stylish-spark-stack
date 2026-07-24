# Portal de Vagas

Portal de vagas de emprego em Moçambique construído com Lovable.

## Stack

- TanStack Start (React 19 + Vite 7)
- TypeScript + Tailwind CSS v4 + Shadcn UI
- Lovable Cloud (Supabase) para auth, base de dados e storage

## Desenvolvimento local

Requisitos: Node.js 20+ e bun (ou npm).

```sh
bun install
bun run dev
```

Aceda a `http://localhost:8080`. O primeiro utilizador que se registar em `/admin` torna-se automaticamente administrador.

## Deploy via GitHub

O projeto pode ser sincronizado com um repositório GitHub e depois publicado a partir do Lovable ou de qualquer plataforma que suporte TanStack Start (Cloudflare Workers, Vercel, Netlify).

1. No editor Lovable, abra o menu **+** → **GitHub** → **Connect project**.
2. Autorize a Lovable GitHub App e escolha a conta ou organização de destino.
3. Clique em **Create Repository** — o código é enviado e a sincronização bidirecional fica ativa.
4. Para publicar, clique em **Publish** no editor Lovable (topo direito). Alterações no GitHub sincronizam automaticamente para o Lovable e vice-versa.

### Publicar em serviço externo

O projeto está configurado com `nitro` a apontar para Cloudflare por defeito. Após clonar o repositório:

```sh
bun install
bun run build
```

O output SSR fica em `.output/`. Faça deploy conforme o alvo escolhido (Cloudflare Workers, Vercel, Netlify).

### Variáveis de ambiente

Necessárias em produção (definidas no serviço de hosting):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Estas são chaves publicáveis (não secretas). Segredos privados são geridos pelo Lovable Cloud.

## Estrutura

- `src/routes/` — páginas (file-based routing)
- `src/components/` — componentes React
- `src/lib/` — utilitários e integrações
- `supabase/migrations/` — schema da base de dados
