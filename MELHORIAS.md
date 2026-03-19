# TalonHire — Análise & Melhorias

## Status Atual

O projeto foi gerado pelo Horizons (Replit AI) e tem uma boa base de frontend mas backend incompleto.

**Stack real (diferente do prompt):**
- Frontend: React 18 + Vite (NÃO Next.js)
- Backend: FastAPI (NÃO Next.js API routes)
- Sem migrations, sem schema SQL definido

---

## CRÍTICO — Corrigir Imediatamente

### 1. Credenciais Hardcoded
**Arquivo:** `frontend/src/lib/customSupabaseClient.js`
- Supabase URL e anon key estão como fallback no código
- **Fix:** Remover fallbacks, usar apenas env vars, falhar com erro claro se não definidas

### 2. Schema de Banco Inexistente
- Nenhum SQL de criação de tabelas no repositório
- Agentes Python inferem tabelas que podem não existir
- **Fix:** Usar o `supabase-schema.sql` que criamos aqui

### 3. Backend sem Entry Point
- Não existe `main.py` do FastAPI
- Apenas 3 arquivos de agentes soltos em `backend/src/agents/`
- **Fix:** Criar app FastAPI completa com rotas

---

## ALTO — Melhorias Arquiteturais

### 4. Migrar de Vite+React para Next.js 15
O prompt pedia Next.js. Benefícios:
- SSR/SSG para landing pages (SEO)
- API Routes embutidas (elimina FastAPI separado)
- Middleware para auth
- App Router com layouts aninhados
- Deploy direto na Vercel

### 5. RLS (Row Level Security) no Supabase
- Atualmente ZERO políticas RLS
- Qualquer usuário com a anon key pode ler/escrever qualquer tabela
- **Fix:** Aplicar as policies do `supabase-schema.sql`

### 6. pgvector para Matching Semântico
- ChromaDB está nas dependências mas é redundante com pgvector do Supabase
- **Fix:** Usar pgvector nativo (já no schema), remover ChromaDB

### 7. Embeddings Pipeline
- Não existe pipeline de geração de embeddings
- **Fix:** Criar Edge Function ou API route que:
  1. Recebe CV/JD text
  2. Chama OpenAI text-embedding-3-large
  3. Salva vector na tabela candidates/jobs

---

## MÉDIO — Melhorias de Qualidade

### 8. TypeScript
- Projeto usa JSX sem tipagem
- **Fix:** Migrar para TSX com tipos para Supabase (usar `supabase gen types typescript`)

### 9. Testes
- CI configurado mas zero testes existem
- **Fix:** Pelo menos testes para:
  - Matching algorithm
  - Auth flow
  - API routes
  - RLS policies

### 10. Error Boundaries
- Sem error boundary global no React
- **Fix:** Adicionar ErrorBoundary no App.jsx

### 11. Paginação
- Listagens carregam tudo de uma vez
- **Fix:** Usar `range()` do Supabase client

### 12. Rate Limiting
- Sem rate limit nas APIs
- **Fix:** Usar Supabase Edge Functions com rate limiting ou middleware FastAPI

---

## SUGESTÕES DE FEATURES ADICIONAIS

### 13. Webhook de Feedback Loop
Quando empresa rejeita candidato:
1. Trigger no Supabase → Edge Function
2. Edge Function pergunta motivo (via email/in-app)
3. Feedback salvo → ajusta embeddings futuros

### 14. Dashboard Analytics com Realtime
- Usar Supabase Realtime para atualizar dashboards ao vivo
- Novas matches aparecem sem refresh

### 15. Multi-tenant Subdomínios
- `{empresa}.talonhire.com` via Next.js middleware + Vercel wildcard domains
- Cada empresa tem landing personalizada

### 16. Integração WhatsApp via Supabase Edge Functions
- Edge Function recebe webhook do WhatsApp Business API
- Salva mensagens como notifications
- Envia alerts de match automaticamente

---

## Ordem de Execução Recomendada

1. **Aplicar schema SQL no Supabase** ← pronto no `supabase-schema.sql`
2. Configurar Storage Buckets
3. Remover credenciais hardcoded
4. Criar pipeline de embeddings (Edge Function)
5. Implementar matching via pgvector
6. Adicionar RLS policies
7. Construir API routes do backend
8. Migrar para Next.js (se possível)
9. Adicionar testes
10. Deploy na Vercel
