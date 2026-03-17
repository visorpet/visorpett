# Visorpet: Bug Fixes + Remoção Google Login + Plano SaaS

Três correções críticas + nova funcionalidade de plano SaaS para o app Visorpet.

---

## Proposed Changes

### 1. Login — Remover Google OAuth

#### [MODIFY] [page.tsx](file:///home/matheus/visorpett/app/login/page.tsx)
- Remover o botão "Entrar com Google" e o divisor "ou use seu e-mail"
- Manter apenas o formulário de email/senha e os links de acesso rápido (demo)

#### [MODIFY] [auth.ts](file:///home/matheus/visorpett/lib/auth.ts)
- Remover o `GoogleProvider` da lista de `providers`
- Remover import de `GoogleProvider`

---

### 2. Usuário Admin Padrão

#### [MODIFY] [seed.ts](file:///home/matheus/visorpett/prisma/seed.ts)
- Adicionar upsert para `admin@admin.com` com senha `admin` e role `SUPER_ADMIN`
- Criar API route `/api/auth/seed-admin` para garantir que o admin existe em banco (útil para produção sem acesso ao CLI)

---

### 3. Correção Bug "Erro Interno" em `/meus-pets`

**Causa raiz identificada:** A rota GET `/api/pets` para o role `CLIENTE` faz query com `include: { client: true, vaccines: { ... } }`. O modelo `Pet` tem `clientId` obrigatório que referencia o modelo `Client` (não `User`). O bug ocorre porque:
- Um usuário `admin@admin.com` com role `SUPER_ADMIN` não tem `petShopId`  → cai no `else` → 403 (mas aparece como "Erro interno" por causa da forma do catch)
- Mais provável: o campo `vaccines` no include tenta ordenar per `appliedAt` que pode estar com problema de schema

#### [MODIFY] [route.ts](file:///home/matheus/visorpett/app/api/pets/route.ts)
- Adicionar tratamento para `SUPER_ADMIN` (retornar todos os pets ou array vazio)
- Adicionar `try/catch` individual por query para log de erro mais detalhado
- Corrigir o include de `vaccines` que pode estar causando erro

---

### 4. Página de Plano SaaS

#### [NEW] [page.tsx](file:///home/matheus/visorpett/app/plano/page.tsx)
Nova página pública de pricing SaaS com:
- Design premium com cards de planos (FREE, PRO, PREMIUM, ENTERPRISE)
- Valores mensais/anuais com toggle
- Lista de features por plano
- CTA para upgrade
- Tabela comparativa de recursos

---

## Verification Plan

### Testes Automáticos
Não há testes automatizados no projeto. Verificação será manual via browser.

### Verificação Manual

**1. Login sem Google:**
- Acessar `visorpett.vercel.app/login`
- Verificar que o botão "Entrar com Google" NÃO aparece mais
- Verificar que o formulário email/senha ainda funciona

**2. Login admin:**
- Rodar o seed: `npx prisma db seed`
- Login com `admin@admin.com` / `admin`
- Verificar redirecionamento para `/admin/painel`

**3. Bug em meus-pets:**
- Fazer login com um usuário CLIENTE
- Navegar para `/cliente/meus-pets`
- Verificar que não aparece mais o "Erro interno"

**4. Página SaaS:**
- Acessar `/plano` 
- Verificar que a página carrega com os 4 planos
