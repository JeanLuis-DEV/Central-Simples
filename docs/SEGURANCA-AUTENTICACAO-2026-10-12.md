# Correções de autenticação — 12/10/2026

## Escopo e resultado

Correção local das duas falhas reproduzidas na primeira revisão da Central
Simples: tentativas de login ilimitadas e reutilização do cookie após logout.
Nenhum deploy, alteração de secrets, banco de produto ou configuração remota
foi realizado. A revisão das proteções da Cloudflare e da versão publicada
permanece para a próxima etapa solicitada pelo titular.

## Controles implementados

- Limite persistente de dez tentativas por conta administrativa e vinte por IP
  em quinze minutos. Contabilização ocorre antes de verificar a senha,
  incluindo tentativas bem-sucedidas. A reserva dos contadores é transacional
  e suporta chamadas simultâneas. Respostas HTTP 429 incluem `Retry-After`.
- Conta normalizada para impedir desvio com espaços/maiúsculas; alternar IPs
  não remove o bloqueio da conta. Nomes desconhecidos compartilham o limite
  por IP sem criar contadores arbitrários por nome. Cabeçalhos de encaminhamento
  fornecidos pelo cliente não são usados como identidade.
- Sessões assinadas e registradas por hash SHA-256, válidas por até doze horas.
  Cada operação administrativa consulta o registro persistente. Logout remove
  o registro antes de confirmar sucesso e apagar o cookie.
- Versão HMAC das credenciais vinculada à sessão: mudanças de senha,
  nome administrativo ou segredo deixam de aceitar as sessões anteriores.
  Cookies antigos sem registro, adulterados ou com sufixos são rejeitados.
- Armazenamento ausente/indisponível impede autenticação e operações protegidas;
  erro no logout não é apresentado como saída bem-sucedida na interface.
- Expiração e limpeza por alarme; IPs são pseudonimizados com HMAC, sem guardar
  senhas, cookies completos, IPs em texto ou dados dos aplicativos.
- Revalidação de sessão após leitura do corpo de operações administrativas.
  Objetos JSON inválidos passam a ser rejeitados com HTTP 400.

## Armazenamento e implantação posterior

`CentralAuthState` usa um Durable Object SQLite para coordenar os contadores e
sessões entre instâncias do Worker. O binding é `CENTRAL_AUTH`; a primeira
migração é `v1-central-auth`, com `new_sqlite_classes` no Wrangler instalado.
As operações atômicas seguem a [documentação oficial de armazenamento da Cloudflare](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).

O binding e a migração serão aplicados no futuro deploy autorizado da Central.
Não é necessário criar ou vincular D1 dos produtos. Preservar os secrets
existentes. O primeiro deploy exigirá novo login administrativo, pois cookies
da versão sem registro não serão aceitos. Não remover o binding para contornar
falhas: o bloqueio com HTTP 503 é intencional. Não restaurar estado antigo de
autenticação que possa reativar sessões revogadas.

## Validações

- `pnpm test:worker`: 19 testes aprovados, com Miniflare/workerd e SQLite local;
  nenhum provedor real é acessado. Cobertura de assinatura dos três apps,
  permissões, bloqueio sequencial e concorrente, troca de IP/nome, cabeçalhos
  falsos, expiração, limpeza, revogação, sessões independentes, reinício do
  runtime, alteração de credenciais e indisponibilidade do binding.
- `pnpm typecheck`: aprovado.
- ESLint nos arquivos de implementação/testes modificados: aprovado.
- `pnpm build:cloudflare`: aprovado.
- `pnpm test:admin-browser`: aprovado no Chrome local; falha de logout mantém
  a sessão visível com mensagem de erro, nova tentativa bem-sucedida retorna
  ao login e resposta HTTP 429 permanece bloqueada na interface.
- `pnpm exec wrangler deploy --dry-run --outdir artifacts/security-worker --keep-vars`:
  aprovado, com exportação de `CentralAuthState` e binding `CENTRAL_AUTH`
  reconhecidos, sem publicação nem aplicação de migração remota.
- `git diff --check`: aprovado.

Os testes da interface usam respostas simuladas; os testes de API executam o
Worker e seu armazenamento local reais. Nenhum resultado comprova a versão
publicada ou as regras de borda da Cloudflare.

## Arquivos

- `worker.ts` e `lib/central-auth-state.ts`.
- `app/area-restrita/page.tsx`.
- `wrangler.json`, `.env.example`, `package.json` e `pnpm-lock.yaml`.
- `tests/central-worker.test.mjs`, `tests/central-auth-state.test.mjs` e
  `tests/central-admin-browser.mjs`.
- Este relatório, `docs/CENTRAL-ADMIN.md` e `docs/STATUS-OPERACIONAL.md`.
