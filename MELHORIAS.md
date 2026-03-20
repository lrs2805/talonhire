# TalonHire — Análise & Melhorias

> **Análise detalhada:** [ANALISE-TALONHIRE.md](./ANALISE-TALONHIRE.md).  
> **Setup Supabase e Edge Functions:** [scripts/README.md](./scripts/README.md).  
> **Quick start:** [README.md](./README.md).

---

## Checklist de estado

### ✅ Implementado (no repositório)

| Item | Descrição |
|------|-----------|
| **Credenciais** | Apenas env vars (`VITE_SUPABASE_*`), sem fallbacks; erro claro se faltarem. |
| **Slug empresa no signup** | Fallback `company-{userId.slice(0,8)}` quando o nome não gera slug válido. |
| **Landing Tailwind** | Classes fixas (cyan/green/purple) nos steps "How it works" para o build. |
| **Pipeline de embeddings** | Edge Function `generate-embedding` (OpenAI → candidates/jobs). Frontend: botão "Update AI profile" no CandidateDashboard; JobNewPage chama após criar vaga. |
| **Assinatura de contratos (DIY)** | Edge Function `contract-sign` + tabela `contract_signatures`. Click-to-sign com SHA-256 hash do contrato, IP, timestamp, user agent. Trigger `check_contract_fully_signed` marca contrato como assinado quando ambas as partes assinam. Componente `ContractSign.tsx` + página `/contract/:contractId`. eIDAS/LGPD compliant. |
| **Matching pgvector** | Edge Function `run-matching`. Frontend: botão "Run matching" por vaga no CompanyDashboard; JobNewPage opção "Run AI matching after creating job". |
| **Share 48h** | Rota `/share/:token`, validação, CTAs Contratar / Rejeitar. Botão Rejeitar abre modal (motivo opcional) e chama Edge Function **reject-match** (atualiza `status: 'rejected'`, `rejection_reason`). |
| **Rate limiting** | Todas as Edge Functions (`generate-embedding`, `run-matching`, `reject-match`) com rate limit por IP (30 req/min, `_shared/rateLimit.ts`). |
| **Seletor de idioma** | Componente `LanguageSwitcher` (PT, EN, ES, FR, IT, DE) fixo no topo direito da app (`App.tsx`). |
| **Redirect após login** | `LoginPage` redireciona por role: company → `/company/dashboard`, admin → `/admin/dashboard`, resto → `/candidate/dashboard`. `signIn` devolve perfil para decidir. |
| **Rota `/company/jobs/new`** | Página `JobNewPage` com `JobForm`, criação de vaga, chamada a `generate-embedding` (jd) e opção de `run-matching` após criar. |
| **Stats CompanyDashboard** | Uma única fonte (`load()`); botão "Run matching" por vaga com feedback inline. |
| **i18n** | Locales PT, EN, ES, FR, IT, DE + `react-i18next` na Landing, Signup, Login, Share. |
| **Testes** | Vitest: AuthContext, useJobs, useShareLink, SharePage (token válido / expirado). `npm run test:run`. |
| **Acessibilidade** | Signup/Login: `id`, `htmlFor`, `focus:ring`, `aria-required`, `autoComplete`. Erros e alertas com `role="alert"`. SharePage modal com `role="dialog"`, `aria-modal`, `aria-labelledby`. |
| **Loading e feedback** | Mensagens de sucesso/erro inline em JobNewPage, CompanyDashboard (matching), CandidateDashboard (embedding). |
| **README na raiz** | [README.md](./README.md) com quick start, scripts, layout do projeto e deploy das Edge Functions. |
| **Scripts/README** | Instruções para schema, storage e deploy (incl. **reject-match**). |
| **TypeScript, Error Boundary, Paginação** | Já existentes. |

### ⏳ Pendente (passos manuais)

| Item | O que fazer |
|------|-------------|
| **Schema no Supabase** | Executar `supabase-schema.sql` e `setup-storage-buckets.sql` no SQL Editor (ver [scripts/README.md](./scripts/README.md)). |
| **RLS** | Políticas no schema; ativas ao aplicar o schema. |
| **Edge Functions em produção** | Deploy de `generate-embedding`, `run-matching`, `reject-match`; configurar `OPENAI_API_KEY` nos secrets. |

### ❌ Não implementado (adiado ou opcional)

| Item | Nota |
|------|------|
| **Migração para Next.js 15** | Mantido Vite + Edge Functions. |
| **Scraping LinkedIn, Stripe, Resend, WhatsApp** | Integrações previstas no prompt; trabalho futuro. |
| **Contratos eletrónicos** | ✅ DIY click-to-sign implementado (SHA-256 + IP + timestamp). PandaDoc descartado (API requer plano Enterprise $65+/mês). eIDAS/LGPD compliant. |
| **Webhook feedback loop, Realtime nos dashboards, multi-tenant** | Sugestões de evolução. |

---

## CRÍTICO — Corrigir Imediatamente

### 1. ~~Credenciais~~ ✅  
### 2. Schema — ⏳ Aplicar no Supabase (ver scripts/README).  
### 3. Backend / API — ✅ Edge Functions (generate-embedding, run-matching, reject-match) + frontend ligado.

---

## ALTO — Melhorias Arquiteturais

### 4. Next.js 15 — ❌ Adiado  
### 5. RLS — ✅ No schema; ⏳ aplicar ao projecto  
### 6. pgvector — ✅  
### 7. Embeddings Pipeline — ✅  

---

## MÉDIO — Melhorias de Qualidade

### 8. TypeScript — ✅  
### 9. Testes — ✅ (AuthContext, useJobs, useShareLink, SharePage)  
### 10. Error Boundaries — ✅  
### 11. Paginação — ✅  
### 12. Rate Limiting — ✅ (Edge Functions, por IP)

---

## Sugestões de Features Adicionais (roadmap)

- **13.** Webhook de feedback quando a empresa rejeita (motivo já guardado em `rejection_reason`; usar para fine-tune/embeddings no futuro).
- **14.** Dashboards com Supabase Realtime.
- **15.** Multi-tenant por subdomínio.
- **16.** Integração WhatsApp.

---

## Ordem de Execução Recomendada

1. Aplicar schema + storage no Supabase.  
2. Configurar `.env` no frontend; testar login/signup.  
3. Configurar `OPENAI_API_KEY` e fazer deploy das 3 Edge Functions.  
4. Testar fluxo: CV texto → Update AI profile → criar vaga → Run matching → share link → Rejeitar com motivo.

---

## Sugestões de melhorias (recomendações) — Estado

| # | Sugestão | Estado |
|---|----------|--------|
| 1 | Ligar frontend às Edge Functions (embedding + run matching) | ✅ CandidateDashboard "Update AI profile"; CompanyDashboard "Run matching"; JobNewPage embedding + matching após criar. |
| 2 | Botão Rejeitar na SharePage com modal e update status | ✅ Modal com motivo opcional; Edge Function `reject-match`; feedback "rejected". |
| 3 | Seletor de idioma | ✅ `LanguageSwitcher` no topo direito (PT, EN, ES, FR, IT, DE). |
| 4 | Redirect após login por role | ✅ LoginPage usa perfil retornado por `signIn` e redireciona por role. |
| 5 | Rota `/company/jobs/new` | ✅ JobNewPage + JobForm; checkbox "Run AI matching after creating job". |
| 6 | Mais testes (useShareLink, SharePage) | ✅ useShareLink.test.ts; SharePage.test.tsx (token válido, expirado). |
| 7 | Rate limit nas Edge Functions | ✅ `_shared/rateLimit.ts` (30 req/min por IP) em generate-embedding, run-matching, reject-match. |
| 8 | Acessibilidade (labels, focus, role alert) | ✅ Signup/Login ids, htmlFor, focus:ring, role="alert"; SharePage modal acessível. |
| 9 | Loading e feedback consistentes | ✅ Mensagens inline em JobNewPage, CompanyDashboard, CandidateDashboard. |
| 10 | README na raiz | ✅ [README.md](./README.md) com quick start, stack, scripts e layout. |
