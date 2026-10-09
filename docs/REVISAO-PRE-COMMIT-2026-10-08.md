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

## Limite de publicação

Esta etapa salva e envia o código ao GitHub. A correção de assinatura do Worker da Central ainda precisa ser publicada na Cloudflare e validada com uma sessão administrativa válida. Nenhum Worker, banco, chave, cobrança ou configuração de provedor foi alterado nesta etapa.
