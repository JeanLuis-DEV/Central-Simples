# Revisão antes do envio ao GitHub — 08/10/2026

As mudanças locais de administração centralizada, inclusão do Lingua Memory, retirada do WhatsApp, autenticação por e-mail, operação/backup, reconciliação e documentação foram conferidas para envio aos quatro repositórios existentes. Credenciais, bancos, backups, artefatos e arquivos de acesso permanecem fora do Git.

## Correções encontradas nesta revisão

- `worker.ts`: a Central assinava as requisições em base64url, enquanto os três aplicativos exigem HMAC SHA-256 hexadecimal de 64 caracteres. A assinatura de integração agora usa hexadecimal. As sessões continuam no formato próprio existente.
- `tests/central-worker.test.mjs` e `pnpm test:worker`: quatro testes sem rede externa cobrem listagem e criação nos três destinos, assinatura do corpo Unicode e do corpo vazio, nonce novo e recusa de sessão ausente. Utilizam somente credenciais sintéticas.
- Exemplos de configuração do Ajudante e Finorya: comentários antigos sobre confirmação por WhatsApp substituídos pela regra de código por e-mail.
- `scripts/verify-operations.mjs` dos dois apps: requisições internas do Miniflare agora usam a origem pública configurada, compatível com a proteção CSRF do bundle. O D1 permanece efêmero e os provedores continuam simulados.
- O build do Finorya regenerou `next-env.d.ts` com os caminhos normais de tipos, eliminando a referência transitória ao diretório de testes.

## Verificações desta etapa

- Compilações Cloudflare da Central, Ajudante e Finorya aprovadas.
- TypeScript do Ajudante e Finorya aprovado; build da Central também verificou os tipos.
- ESLint dos três projetos sem erros. Avisos limitados a imagens do Ajudante e arquivos locais gerados/auxiliares ignorados.
- Finorya: 125 testes unitários aprovados.
- Central: quatro testes do Worker aprovados.
- Ajudante: regressão isolada de autenticação aprovada.
- Operação/pagamentos: 22 cenários isolados aprovados por aplicativo.
- Lingua Memory contém somente a nova nota documental de remoção do WhatsApp; seu runtime não foi alterado nesta etapa.
- Arquivos candidatos conferidos para credenciais e temporários; o único literal sinalizado foi a chave sintética explícita do novo teste.

## Publicação posterior na Cloudflare — concluída em 08/10/2026

O envio inicial ao GitHub não publicou o Worker. Após solicitação do proprietário, a correção do commit `ba4613e0acaa5707f86beed60530deefed50e263` foi publicada no Worker `central-simples`, conta Cloudflare existente de `jeanluis.dev@gmail.com`, versão `f7035b1e-f195-43fd-9880-61a886cba9b2`. A consulta posterior de deployments confirmou essa versão ativa com 100% do tráfego.

Comandos executados: `pnpm build:cloudflare`, `pnpm test:worker` e `pnpm exec wrangler deploy --keep-vars`. Compilação e quatro testes aprovados. A publicação preservou as variáveis e os quatro segredos administrativos/de integração existentes, sem recriar ou rotacionar credenciais.

Verificação HTTPS real em https://centralsimples.com.br:

- Página principal, `/area-restrita`, `/termos` e `/privacidade`: HTTP 200.
- `/api/central/apps`: HTTP 200, com os três aplicativos configurados e disponíveis.
- Consulta de contas sem sessão: HTTP 401.
- Login com a credencial administrativa local existente: HTTP 200; não foi necessário redefini-la.
- Consultas assinadas de contas do Ajudante, Finorya e Lingua Memory pela Central: HTTP 200 e listas válidas nos três destinos. Isso confirma o contrato HMAC hexadecimal entre o Worker publicado e os receptores reais.
- Logout da sessão usada na conferência: HTTP 200.

As verificações externas foram somente de leitura, login e logout. Não foram criadas, editadas ou excluídas contas, nem alterados bancos, cobranças ou configurações de outros provedores. Dados pessoais das listas e credenciais não foram exibidos nem incluídos no relatório.
