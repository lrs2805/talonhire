# TalonHire — Roteiro de Testes Completo

> URL: https://talonhire.vercel.app
> Supabase: https://supabase.com/dashboard/project/zluwxdsjtvqhguxdhsxm

---

## Preparação

Vais precisar de **3 emails diferentes** (podem ser aliases Gmail: `teu+candidato@gmail.com`, `teu+empresa@gmail.com`, `teu+admin@gmail.com`).

---

## PARTE 1 — Candidato

### 1.1 Landing Page
- [ ] Abrir https://talonhire.vercel.app
- [ ] Verificar hero com gradiente neon (TalonHire em cyan/green)
- [ ] Verificar seção "How It Works" (3 cards com animação ao scroll)
- [ ] Verificar seção Stats (40-60%, 48h, 6, 4)
- [ ] Verificar footer

### 1.2 Trocar Idioma
- [ ] Clicar nos botões de idioma no canto superior direito (PT, EN, ES, FR, IT, DE)
- [ ] Verificar que o texto da landing muda em cada idioma
- [ ] Verificar que volta para PT corretamente

### 1.3 Signup Candidato
- [ ] Clicar "I'm a Candidate" (ou "Sou Candidato" em PT)
- [ ] Na página de signup, verificar que o toggle "Candidate" está selecionado (cyan)
- [ ] Preencher:
  - Nome completo: `João Teste`
  - Cidade: `São Paulo`
  - País: `Brazil`
  - Email: `teu+candidato@gmail.com`
  - Password: `TalonHire2026` (mín. 6 caracteres)
  - Checkbox LGPD: marcar
- [ ] Clicar "Create Account"
- [ ] Verificar redirect para `/candidate/dashboard`
- [ ] Verificar que o Header mostra "Dashboard" + nome do user + "Sign Out"

### 1.4 Candidate Dashboard
- [ ] Verificar 3 cards de stats (Active Matches: 0, Pending Interviews: 0, Recorded Videos: 0)
- [ ] Verificar barra de "Profile Completion" (deve mostrar ~20% — só nome preenchido)
- [ ] Verificar que os items faltantes aparecem: LinkedIn, CV Upload, Tech Stack, Intro Video, Salary Range
- [ ] Verificar seção "Recent Matches" com mensagem "No matches yet..."

### 1.5 Sign Out + Login
- [ ] Clicar "Sign Out" no Header
- [ ] Verificar redirect para landing page
- [ ] Clicar "Sign In" no Header
- [ ] Fazer login com email + password do candidato
- [ ] Verificar redirect para `/candidate/dashboard`
- [ ] Verificar que o dashboard mantém os dados

---

## PARTE 2 — Empresa

### 2.1 Signup Empresa
- [ ] Sign Out do candidato
- [ ] Ir para `/auth/signup`
- [ ] Clicar toggle "Company" (deve ficar verde)
- [ ] Preencher:
  - Nome empresa: `Acme Tech Portugal`
  - País: `Portugal`
  - Email: `teu+empresa@gmail.com`
  - Password: `TalonHire2026`
  - Checkbox LGPD: marcar
- [ ] Clicar "Create Account"
- [ ] Verificar redirect para `/company/dashboard`

### 2.2 Company Dashboard
- [ ] Verificar 4 cards de stats (Active Jobs: 0, Candidates in Pipeline: 0, Pending Matches: 0, Closed Contracts: 0)
- [ ] Verificar que aparece o nome da empresa e "Plan: free"
- [ ] Verificar botão "+ Post New Job" (verde)
- [ ] Verificar seção "Your Jobs" com mensagem "No jobs posted yet..."

### 2.3 Criar Vaga
- [ ] Clicar "+ Post New Job" (ou link no Header)
- [ ] Verificar página `/company/jobs/new`
- [ ] Verificar link "← Dashboard" no topo
- [ ] Verificar checkbox "Run AI matching after creating job" (marcada por defeito)
- [ ] Preencher:
  - Job Title: `Senior Full-Stack Developer`
  - Description: `We are looking for an experienced full-stack developer to join our team in Lisbon. Remote-friendly. Strong React + Node.js + PostgreSQL skills required.`
  - Seniority: `Senior`
  - Remote: marcar
  - Relocation: marcar
  - Tech Stack: digitar `react` + Enter, `node.js` + Enter, `postgresql` + Enter, `typescript` + Enter
  - Min Salary: `3000`
  - Max Salary: `5500`
  - Contract Model: `Fee 15% (on hire)`
- [ ] Clicar "Publish Job"
- [ ] Verificar mensagem de sucesso "Job published. AI matching has been run."
- [ ] Verificar redirect para Company Dashboard após 2 segundos
- [ ] Verificar que a vaga aparece na lista "Your Jobs" com status "active"

### 2.4 Run Matching Manual
- [ ] Na lista de vagas, clicar botão "Run matching" ao lado da vaga
- [ ] Verificar que mostra "Running..." enquanto processa
- [ ] Verificar mensagem de resultado ("Created X new match(es)" ou "0" se não há candidatos com embedding)

### 2.5 Sign Out Empresa
- [ ] Clicar "Sign Out"
- [ ] Verificar redirect para landing

---

## PARTE 3 — Admin

### 3.1 Criar Admin (via Supabase Dashboard)

O signup não permite criar admin pela UI. Usa o Supabase:

1. Ir ao Supabase Dashboard > Authentication > Users
2. Clicar "Add User" > criar com `teu+admin@gmail.com` / `TalonHire2026`
3. Ir ao SQL Editor e executar:

```sql
-- Trocar role para admin
UPDATE profiles
SET role = 'admin_master'
WHERE email = 'teu+admin@gmail.com';
```

### 3.2 Login Admin
- [ ] Ir para `/auth/login`
- [ ] Login com email admin
- [ ] Verificar redirect para `/admin/dashboard`

### 3.3 Admin Dashboard
- [ ] Verificar título "Admin Dashboard"
- [ ] Verificar 5 links de navegação (Companies, Candidates, Jobs, Contracts, Payments)
- [ ] Verificar 6 cards de stats:
  - Total Companies (deve ser 1)
  - Total Candidates (deve ser 1)
  - Active Jobs (deve ser 1)
  - Total Matches (0 ou mais)
  - Active Contracts (0)
  - Total Revenue (€0)
- [ ] Se houver matches e contratos, verificar barra de Conversion Rate

### 3.4 Sign Out Admin
- [ ] Sign Out e verificar redirect

---

## PARTE 4 — Fluxo Completo de Matching

### 4.1 Preparar Candidato com Embedding

Para testar o matching, o candidato precisa ter um `cv_text` e embedding. Executa no SQL Editor do Supabase:

```sql
-- Encontrar o ID do candidato
SELECT c.id, p.full_name, p.email
FROM candidates c JOIN profiles p ON c.profile_id = p.id;

-- Adicionar cv_text ao candidato (substitui o UUID pelo id real)
UPDATE candidates
SET cv_text = 'Senior full-stack developer with 5 years of experience in React, Node.js, TypeScript, and PostgreSQL. Worked at startups in São Paulo building SaaS products. Fluent in Portuguese and English. Available for relocation to Europe.',
    tech_stack = ARRAY['react', 'node.js', 'typescript', 'postgresql', 'aws', 'docker'],
    primary_role = 'full-stack',
    seniority = 'senior',
    years_experience = 5,
    salary_expectation_min = 3000,
    salary_expectation_max = 5000
WHERE id = 'SUBSTITUIR_PELO_UUID';
```

### 4.2 Gerar Embedding do Candidato
- [ ] Login como candidato
- [ ] No dashboard, verificar que aparece o bloco "Update your AI profile so you appear in job matches"
- [ ] Clicar "Update AI profile"
- [ ] Verificar mensagem "AI profile updated. You will appear in more matches."

### 4.3 Gerar Match
- [ ] Login como empresa
- [ ] Na vaga criada, clicar "Run matching"
- [ ] Verificar "Created 1 new match(es)" (o candidato deve ter match)
- [ ] Verificar que o pipeline count sobe

### 4.4 Verificar Match no Candidato
- [ ] Login como candidato
- [ ] Verificar que "Active Matches" subiu para 1
- [ ] Verificar que a vaga aparece em "Recent Matches" com score %

---

## PARTE 5 — Share Link 48h

### 5.1 Gerar Share Link (via SQL)

```sql
-- Encontrar o matching
SELECT id, job_id, candidate_id, score_overall, status
FROM matchings ORDER BY created_at DESC LIMIT 5;

-- Gerar share link
SELECT * FROM generate_share_link('SUBSTITUIR_PELO_MATCHING_UUID');
```

### 5.2 Testar Share Link
- [ ] Abrir `https://talonhire.vercel.app/share/TOKEN_GERADO`
- [ ] Verificar que mostra título "TalonHire Match"
- [ ] Verificar nome do candidato e título da vaga
- [ ] Verificar botão "Hire" (verde) e "Reject" (cinza)

### 5.3 Testar Rejeição
- [ ] Clicar "Reject"
- [ ] Verificar que abre modal com campo de motivo (opcional)
- [ ] Escrever motivo: "Stack não é exatamente o que procuramos"
- [ ] Clicar "Reject" no modal
- [ ] Verificar mensagem de confirmação

### 5.4 Testar Link Expirado

```sql
-- Forçar expiração de um link
UPDATE matchings
SET share_expires_at = NOW() - INTERVAL '1 hour'
WHERE share_token IS NOT NULL
LIMIT 1;
```

- [ ] Abrir o mesmo link
- [ ] Verificar que mostra "This link has expired."

---

## PARTE 6 — Edge Functions

### 6.1 generate-embedding
- [ ] Já testado na Parte 4.2
- [ ] Verificar que `candidates.cv_embedding` não é NULL no Supabase

### 6.2 run-matching
- [ ] Já testado na Parte 4.3
- [ ] Verificar que `matchings` tem registos no Supabase

### 6.3 reject-match
- [ ] Já testado na Parte 5.3
- [ ] Verificar no Supabase: `matchings.status = 'rejected'` e `rejection_reason` preenchido

---

## PARTE 7 — Responsividade & UX

### 7.1 Mobile
- [ ] Abrir em telemóvel (ou DevTools mobile)
- [ ] Verificar landing page responsiva
- [ ] Verificar hamburger menu no Header
- [ ] Verificar que o menu abre/fecha
- [ ] Verificar dashboards em mobile (cards empilham)

### 7.2 Dark Theme
- [ ] Verificar fundo #0A0A0A em todas as páginas
- [ ] Verificar que não há flash branco ao navegar
- [ ] Verificar neon glows nos cards (hover)
- [ ] Verificar fontes Orbitron (títulos) e Rajdhani (corpo)

### 7.3 Particles
- [ ] Verificar que o AdminDashboard tem partículas de fundo
- [ ] Verificar que não causam lag em mobile

---

## PARTE 8 — Erros & Edge Cases

### 8.1 Signup com email duplicado
- [ ] Tentar signup com email já usado
- [ ] Verificar mensagem de erro clara

### 8.2 Login com password errada
- [ ] Tentar login com password incorreta
- [ ] Verificar mensagem de erro

### 8.3 Acesso não autorizado
- [ ] Como candidato, tentar acessar `/company/dashboard`
- [ ] Verificar redirect para `/candidate/dashboard`
- [ ] Como empresa, tentar acessar `/admin/dashboard`
- [ ] Verificar redirect para `/company/dashboard`

### 8.4 URL inválida
- [ ] Acessar `/share/token-invalido`
- [ ] Verificar mensagem "Invalid link."
- [ ] Acessar `/pagina-que-nao-existe`
- [ ] Verificar redirect para dashboard (se logado) ou landing (se não)

---

## Checklist Final

| Área | Status |
|------|--------|
| Landing page + i18n | ☐ |
| Signup candidato | ☐ |
| Signup empresa | ☐ |
| Login / Sign Out | ☐ |
| Candidate Dashboard | ☐ |
| Company Dashboard | ☐ |
| Admin Dashboard | ☐ |
| Criar vaga | ☐ |
| Embedding candidato | ☐ |
| Matching automático | ☐ |
| Share link 48h | ☐ |
| Rejeição com motivo | ☐ |
| Link expirado | ☐ |
| Responsividade mobile | ☐ |
| Proteção de rotas | ☐ |
| Erros e edge cases | ☐ |

---

## Resultados & Bugs

Anota aqui os bugs encontrados durante o teste:

| # | Página | Bug | Severidade | Screenshot |
|---|--------|-----|------------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

*Documento gerado em 2026-03-19. Atualizar conforme novas features forem adicionadas.*
