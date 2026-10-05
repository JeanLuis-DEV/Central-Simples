# Implantação oficial — 05/10/2026

## Publicado

| Projeto | Endereço oficial | Hospedagem |
| --- | --- | --- |
| Central Simples | https://centralsimples.com.br | Workers Static Assets, exportação estática |
| Finorya | https://finorya.centralsimples.com.br | Workers + D1 |
| Ajudante Elétrico | https://ajudante.centralsimples.com.br | Workers + D1 |

www.centralsimples.com.br também foi vinculado e o navegador redireciona para o domínio principal. Os quatro endereços responderam HTTP 200 com HTTPS. Nenhum plano pago foi contratado.

O Cloudflare Pages retornou erro 8000000 na criação do projeto. A Central foi publicada como assets estáticos de Workers, sem servidor Next.js e sem banco. O catálogo foi compilado com os endereços oficiais dos aplicativos.

O Registro.br já apontava para chloe.ns.cloudflare.com e pete.ns.cloudflare.com, com DNSSEC ativo. Esses registros foram preservados. Os subdomínios foram vinculados como Custom Domains de Workers; não foi necessário alterar os servidores no registrador.

## Bancos e credenciais

- Finorya: `finorya-production`, D1 `0a2e0511-b91d-42ab-a6c5-cccdfc133050`; sete migrações aplicadas, incluindo `0008_payments.sql`.
- Ajudante: `ajudante-eletrico-production`, D1 `5cee12df-41f4-4b86-9600-c9093c383ca0`; nove migrações aplicadas, incluindo `0008_payments.sql`.
- São bancos novos. Os dados e bancos locais, `gastos-simples` e `gastos-simples-staging` não foram alterados nem importados.
- `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_PASSWORD_HASH` e `USER_PASSWORD_ENCRYPTION_KEY` existentes foram registrados como secrets separados de cada Worker. As chaves não foram regeneradas. Não publicar seus valores no Git, nos assets ou na documentação.
- O administrador é criado no primeiro login válido de bootstrap. A validação externa nesta entrega foi de rejeição de login inválido; o acesso administrativo válido ainda precisa ser confirmado pelo titular.

## Runtime e comandos

Nos três projetos: `pnpm build:cloudflare`, depois `pnpm deploy:cloudflare`. No Ajudante, executar dentro de `app/`.

- Central: `wrangler.json` publica `out/`; `scripts/build-cloudflare.mjs` define os URLs públicos e a exportação estática. `.wrangler/` é ignorado pelo Git.
- Finorya: `vite.config.ts` seleciona `server/cloudflare-environment.ts` no limite do módulo de ambiente. Desenvolvimento Next.js mantém SQLite; produção usa exclusivamente D1. A build verifica que SQLite não entrou no pacote do Worker e restaura as declarações de tipos do Next.js após a compilação Vinext.
- Ajudante: `wrangler.production.json` contém a configuração real, separada dos bindings locais. `scripts/build-cloudflare.mjs` seleciona essa configuração; o deploy usa `dist/server/wrangler.json` gerado.
- Migrações futuras: `pnpm db:migrate:production` no projeto Finorya ou em `Ajudante Elétrico/app`. Fazer backup antes de migrações com dados reais.
- Os URLs e IDs nos arquivos de configuração são públicos; tokens continuam em secrets.
- Publicação atual foi feita pelo CLI. Não foi configurada integração GitHub nem publicação automática a cada push.

## Verificações realizadas

- Builds de produção dos três projetos concluídas.
- Verificação de ausência das credenciais privadas existentes nos pacotes compilados dos apps.
- HTTP 200 nos sites; `/api/auth/session` retorna `user: null` sem sessão.
- POST de login inválido retorna HTTP 401 nos dois apps, usando o hash scrypt existente e os bancos D1 reais.
- Webhooks sem configuração do Mercado Pago retornam HTTP 503 e não criam contas.
- Finorya: 96 testes unitários aprovados; checagem de tipos aprovada nos dois apps.
- Visualização da Central no domínio oficial conferida em Chrome.

Esses testes não homologam login válido, entrega externa de códigos, pagamento, estorno ou fluxo completo de cadastro. Monitorar CPU e erros 1102 sob uso real: uma requisição que respondeu corretamente não garante capacidade do plano gratuito. A segurança do scrypt foi preservada.

## Pendências para liberar cadastro e compra

1. Mercado Pago exige validação adicional de identidade na conta do titular antes de criar a aplicação. A aba ficou aberta para a conclusão pelo usuário.
2. Criar e homologar aplicações e credenciais por app, Checkout Pro e webhooks:
   - https://finorya.centralsimples.com.br/api/payments/webhook
   - https://ajudante.centralsimples.com.br/api/payments/webhook
3. Registrar `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` e `MERCADOPAGO_SELLER_ID` no Worker correspondente. `MERCADOPAGO_SANDBOX=true` permanece até a homologação; mudar para produção somente com credenciais corretas e pagamento real validado.
4. Configurar Twilio Verify, canal WhatsApp e SendGrid, autenticação de remetente/DKIM, suporte a CustomCode e entrega real dos dois códigos. Não há credenciais desses provedores nos Workers.
5. O DNS existente tem MX nulo (`.`), SPF `v=spf1 -all` e DMARC `p=reject`. Eles foram preservados. O provedor de e-mail deve fornecer os registros corretos de domínio/subdomínio de envio; não remover a proteção DMARC para mascarar falta de configuração.
6. Enquanto os provedores estiverem ausentes, novos cadastros e compras permanecem bloqueados. Nenhuma conta paga foi criada e nenhum pagamento foi cobrado. O teste mantém 168 horas sem cartão após cadastro verificado.
7. Confirmar o login administrativo, homologar cadastro completo, pagamento aprovado/rejeitado, webhook duplicado, renovação de conta, expiração e estorno.
8. Estabelecer backup/restauração, observabilidade, termos e privacidade, retenção, reconciliação de pedidos abandonados e alertas de webhook perdido. As pendências operacionais detalhadas estão em `ESTRUTURA-OFICIAL.md`.

Finorya Fundador: **R$77,00 por 12 meses**, limitado aos primeiros dez usuários; preço de referência R$358,80 e economia R$281,80. Os outros planos foram preservados.

## Fontes oficiais

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/workers/platform/limits/
