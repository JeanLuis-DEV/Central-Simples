# Administração central

A Central continua entregando o catálogo como assets estáticos, mas o Worker
`worker.ts` atende `/api/central/*`. A sessão da Central é assinada no próprio
Worker e os bancos dos produtos continuam pertencendo aos respectivos
Workers. A criação, consulta, suspensão e exclusão de contas são encaminhadas
por HTTPS a endpoints internos assinados com HMAC; senhas e hashes nunca passam
pelo navegador nem são gravados na Central.

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

## Rotas

- `POST /api/central/session/login`, `GET /api/central/session` e
  `POST /api/central/session/logout` controlam a sessão administrativa.
- `GET /api/central/apps` informa quais conexões estão configuradas.
- `GET/POST/PATCH/DELETE /api/central/accounts` exige a sessão e o `appId`;
  o Worker encaminha a operação ao aplicativo selecionado.

Os endpoints internos dos produtos nunca são públicos para o navegador. Eles
aceitam somente chamadas com HMAC válido, janela de cinco minutos e corpo JSON
limitado. A rotação do segredo deve ser feita nos três Workers em uma janela
curta para evitar indisponibilidade.
