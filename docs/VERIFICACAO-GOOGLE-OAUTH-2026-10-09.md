# Google OAuth: marca aprovada e preparação do escopo — 09/10/2026

## Resultado confirmado no painel

Conta: `jeanluis.dev@gmail.com`. Projeto: `prefab-clover-510801-h2`, Central Simples.

- Search Console: `https://centralsimples.com.br/` continua com **Você é um proprietário verificado**, na conta correta.
- Página inicial, privacidade e termos públicos retornaram HTTP 200. A metatag de propriedade permanece publicada.
- Repetida a análise automática da marca após o prazo anterior. Google exibiu **Sua marca foi verificada, mas ainda não está sendo mostrada aos usuários**; acionado Publicar branding.
- Resultado posterior: **Sua marca foi verificada e está aparecendo para os usuários.** Marca aprovada e publicada.
- O único cliente OAuth listado é **Central Simples - envio de emails**, usado pelos dois apps. Nenhum cliente, domínio, segredo ou permissão foi criado, removido ou ampliado.
- Público-alvo conferido: Externo, **Em produção**, um usuário OAuth autorizado. Não voltou ao modo de teste.
- A renovação de acesso com a credencial existente passou e retornou somente `https://www.googleapis.com/auth/gmail.send`, com validade de acesso de 3599 segundos. O refresh token foi preservado; nenhum e-mail enviado nesta conferência.

## Escopo: bloqueio restante real

`gmail.send` ainda não foi verificado. Após publicar a marca, **Prepare for verification** ficou disponível. No resumo, Google bloqueia Confirmar por dois campos obrigatórios: justificativa e vídeo de demonstração.

Justificativa preparada com 859 caracteres e preenchida na tela de Acesso a dados. O botão Save permanece desabilitado enquanto o link do vídeo está vazio; portanto **o texto está preparado, mas ainda não foi salvo no Google e o pedido de análise não foi enviado**. A aba foi mantida aberta para continuação.

O proprietário informou que ainda não tem o vídeo. Não foi inserido link fictício nem enviado material que não demonstre o funcionamento real. Aprovar a marca não equivale a aprovar o escopo.

## Justificativa pronta

> Central Simples uses Gmail API only to send transactional email from the owner-authorized account jeanluis.dev@gmail.com. Finorya and Ajudante Eletrico send registration, purchase and password-recovery verification codes, support requests and operational alerts. Customers never authorize access to their own Gmail accounts. The servers call users.messages.send; they do not read, list or delete emails or access contacts. OAuth credentials are kept in server-side secrets and are not exposed to customers. gmail.send is the minimum scope for standalone server-side email sending. Gmail Add-on scopes cannot serve this backend flow; draft, read and full-mail permissions are unnecessary. Google API data is not sold or used for advertising. The public privacy policy documents Gmail use and Limited Use compliance at https://centralsimples.com.br/privacidade.

## Roteiro do vídeo de demonstração

Gravação da tela; não é necessário aparecer na câmera. Usar explicação/legendas em inglês e mostrar o fluxo de consentimento em inglês, conforme os requisitos oficiais.

1. Abrir `https://centralsimples.com.br`, mostrar a marca e os links de Finorya, Ajudante Elétrico e privacidade. Explicar que o backend envia mensagens transacionais da conta autorizada do proprietário. Os clientes dos apps não concedem acesso às suas próprias caixas Gmail.
2. Mostrar a autorização OAuth real do cliente **Central Simples - envio de emails**: nome Central Simples, ID do cliente na barra de endereço e permissão de envio de e-mails. O projeto tem um único cliente OAuth. Não confundir a página de configuração do Google Cloud com a tela de consentimento.
3. Mostrar o uso real nos dois apps: solicitar um código de confirmação em um fluxo de teste e mostrar a mensagem recebida no destinatário de teste. Explicar que a mesma integração também atende recuperação, suporte e alertas; não lê, lista nem exclui mensagens.
4. Mostrar a seção **Gmail API e dados do Google** de `https://centralsimples.com.br/privacidade`, incluindo o uso limitado.
5. Encerrar os dados de teste e publicar no YouTube como **Não listado**. Não mostrar senha, client secret, refresh/access tokens, dados pessoais de clientes ou mensagens particulares. Códigos demonstrados devem estar expirados/invalidados antes de publicar.

A gravação deve ser do fluxo real, não uma montagem apresentada como autorização ou entrega que não ocorreu. Pode ter narração ou legendas; uma gravação curta é suficiente se cobrir os requisitos, sem duração mínima inventada.

O script de autorização existente fica em `scripts/authorize-gmail.mjs` dos dois apps e usa retorno `http://localhost:8080/oauth2/callback`. Ele preserva a credencial atual e só inicia renovação planejada com `--renew`. Não executado nesta etapa: preparar a gravação não exige trocar credenciais produtivas.

## Depois de receber o link

1. Conferir o vídeo e seu acesso não listado.
2. Preencher o link em Acesso a dados, salvar e conferir a persistência da justificativa/link.
3. Retornar à Central de verificação, completar as informações adicionais e enviar o pedido. Se aparecer aceite de termos ou outra ação que exija confirmação específica, apresentar o formulário completo ao proprietário antes desse aceite.
4. Conferir o status efetivo retornado pelo Google. **Em análise** não significa aprovado; registrar eventual exigência adicional e a aprovação somente quando exibida.
5. Manter as credenciais atuais e os apps operando com o escopo existente. Não adicionar escopos de leitura, contatos, exclusão ou Gmail completo.

## Evidências e arquivos

Screenshots locais no projeto Central Simples, fora do Git, em `artifacts/google-oauth-2026-10-09/`: marca publicada, justificativa preparada e status final da Central de verificação. Nos projetos de referência, somente documentação foi alterada; nenhum código, banco, deploy Cloudflare ou credencial foi modificado.

## Fontes oficiais

- [Verificação de escopos sensíveis e requisitos do vídeo](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification).
- [Envio do app para análise](https://support.google.com/cloud/answer/13461325?hl=en).