# Revisão Google e política de privacidade — 11/10/2026

Atualização de 17/10/2026: novo vídeo, justificativa e acessos de revisão enviados
à equipe Google. Veja o [registro do complemento](REENVIO-VERIFICACAO-GOOGLE-2026-10-17.md).
As etapas abaixo preservam o histórico de 11/10; o escopo ainda aguarda aprovação.

## Situação confirmada

Conta `jeanluis.dev@gmail.com`, projeto Central Simples (`prefab-clover-510801-h2`). O painel mantém a marca verificada/publicada e o acesso aos dados em análise. O progresso mostra página inicial, funcionalidade, marca e escopos mínimos concluídos. A etapa de política de privacidade apresentou dois problemas: ausência de identificação dos destinatários dos dados Google e de mecanismos de proteção dos dados sensíveis.

A mensagem da equipe de verificação recebida em 11/10 às 16:52 também solicita novo vídeo com todas as permissões expandidas e os efeitos do envio na conta Google, credenciais de teste ativas e instruções de navegação. É necessário responder à conversa depois de resolver os itens; a publicação da política não equivale à aprovação nem ao envio dessa resposta.

## Correção publicada

- A seção Gmail identifica os dados tratados, o escopo exclusivo `gmail.send`, as finalidades e a ausência de leitura da caixa postal.
- Compartilhamento detalhado por destinatário: Google, Cloudflare, destinatário/provedor de e-mail e responsável autorizado pelo suporte, com a finalidade de cada acesso. Credenciais OAuth não são entregues aos clientes ou destinatários.
- Proteções verificadas no código: HTTPS/TLS, segredos nos Workers, controle de acesso/origem por conta, cookies protegidos, senhas scrypt, desafios HMAC com expiração/limites, ausência de conteúdo sensível nos logs públicos e backups operacionais AES-256-GCM sem secrets OAuth.
- Conservação e revogação esclarecidas: revogar OAuth bloqueia a renovação para novos envios, mas não apaga automaticamente mensagens já entregues.
- Lingua Memory incluído no escopo da política, com descrição de áudio privado, permissão de microfone, tradução MyMemory e custódia de backups no Drive privado.
- Data de privacidade atualizada para 11/10; a data dos termos continua 08/10, pois seu conteúdo não foi alterado.

URL mantida: [Política de privacidade](https://centralsimples.com.br/privacidade). Worker `central-simples` publicado na versão `4fccf62e-eea4-4833-b3c8-8a8bf4d4560e`, com a conta Cloudflare existente. Segredos, bancos, permissões OAuth e configuração dos apps preservados.

## Validação

- `pnpm lint`: sem erros; dois avisos em arquivo gerado de `.wrangler/tmp`, fora dos arquivos alterados.
- `pnpm build:cloudflare`, `pnpm typecheck` e `pnpm test:worker`: aprovados; quatro testes de assinatura/autorização passaram.
- Navegador autenticado: página pública com data e novos textos, sem exigir login; em 390 × 844 não houve rolagem horizontal.
- O acesso ao Google Cloud/Gmail voltou a funcionar depois de limpar o cache DNS do Windows. Nenhum servidor DNS, firewall ou credencial foi alterado.

## Próximos passos da verificação

1. Preparar novo vídeo real com consentimento em inglês, permissões expandidas e efeito do envio no Gmail, conforme solicitação recebida.
2. Preparar acesso de teste aos apps e roteiro, sem conceder acesso ao Gmail do proprietário ou compartilhar segredos OAuth. Não remover as proteções de usuários reais.
3. Quando os itens estiverem completos, responder à conversa da equipe Google com a política atualizada, vídeo e acesso de teste. Nenhuma resposta foi enviada nesta correção.
4. Registrar aprovação somente após confirmação do Google; o painel ainda não confirma aprovação de `gmail.send`.

## Referência oficial

[Requisitos de política de privacidade e correção dos dois problemas](https://support.google.com/cloud/answer/13806988?hl=en). A orientação oficial permite manter a URL existente e informar a equipe pela conversa da revisão.
