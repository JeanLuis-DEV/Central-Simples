# Administração central

> Revisão de 12/10/2026: correções de autenticação implementadas e validadas localmente, ainda sem publicação. Histórico produtivo e pendências em [STATUS-OPERACIONAL.md](STATUS-OPERACIONAL.md); detalhes em [SEGURANCA-AUTENTICACAO-2026-10-12.md](SEGURANCA-AUTENTICACAO-2026-10-12.md).

A Central continua entregando o catálogo como assets estáticos, mas o Worker
`worker.ts` atende `/api/central/*`. A sessão da Central é assinada no próprio
Worker e seu hash é registrado no Durable Object SQLite `CENTRAL_AUTH`.
O registro persistente é obrigatório em cada validação e removido no logout.
Os bancos dos produtos continuam pertencendo aos respectivos
Workers. A criação, consulta, suspensão e exclusão de contas são encaminhadas
por HTTPS a endpoints internos assinados com HMAC. As senhas informadas no
formulário são encaminhadas por HTTPS ao aplicativo e não são persistidas pela
Central. Os hashes de senha dos produtos não são retornados ao navegador.

## Configuração

No desenvolvimento, crie `.dev.vars` (ignorado pelo Git):

```text
CENTRAL_ADMIN_USERNAME=admin
CENTRAL_ADMIN_PASSWORD_HASH=pbkdf2$sha256$100000$<salt-base64url>$<digest-base64url>
CENTRAL_SESSION_SECRET=<segredo aleatório com pelo menos 32 caracteres>
CENTRAL_INTEGRATION_SECRET=<mesmo segredo com pelo menos 32 caracteres nos quatro Workers>
```

Gere o hash com `node scripts/hash-central-password.mjs "sua senha"`. Em
produção, registre os mesmos valores como secrets do Worker. Configure
`CENTRAL_INTEGRATION_SECRET` nos Workers da Central Simples, Ajudante Elétrico,
Finorya e Lingua Memory; cada aplicação valida timestamp, nonce e assinatura
antes de tocar seu D1.

O Lingua Memory está conectado com D1 e R2 e participa do mesmo fluxo HMAC de
provisionamento. A Central não copia senhas nem arquivos locais para produção.

O binding `CENTRAL_AUTH` e a migração `v1-central-auth` estão declarados em
`wrangler.json`. O armazenamento guarda somente hashes de sessão, versão
criptográfica das credenciais, contadores e expirações. Não exige compartilhar
os bancos dos produtos nem regenerar secrets existentes. No primeiro deploy
desta correção, sessões antigas exigirão novo login por não estarem registradas.

O login admite até dez tentativas para a conta administrativa e vinte por IP
em uma janela de quinze minutos. Tentativas válidas e inválidas consomem a
janela; o bloqueio retorna HTTP 429 com `Retry-After`, sem prorrogar a janela.
O limite da conta independe do IP e de maiúsculas/minúsculas. O IP vem de
`CF-Connecting-IP`; `X-Forwarded-For` e `X-Real-IP` não são utilizados.
Sem o cabeçalho da borda, as requisições compartilham um limite conservador.

## Rotas

- `POST /api/central/session/login`, `GET /api/central/session` e
  `POST /api/central/session/logout` controlam a sessão administrativa.
- `GET /api/central/apps` informa quais conexões estão configuradas.
- `GET/POST/PATCH/DELETE /api/central/accounts` exige a sessão e o `appId`;
  o Worker encaminha a operação ao aplicativo selecionado.

Os endpoints internos dos produtos nunca são públicos para o navegador. Eles
aceitam somente chamadas com HMAC válido, janela de cinco minutos e corpo JSON
limitado. A rotação do segredo deve ser feita nos quatro Workers em uma janela
curta para evitar indisponibilidade.

## Validação local

- `pnpm test:worker`: testes do Worker em Miniflare/workerd com SQLite real,
  além de testes de expiração com relógio controlado.
- `pnpm build:cloudflare` e `pnpm test:admin-browser`: build estático e teste
  de interface com respostas de API simuladas e rede externa bloqueada.
- `pnpm typecheck`: validação de tipos.

As verificações usam credenciais fictícias. A validação das proteções da
Cloudflare e da versão publicada permanece para a próxima etapa.
