# Google OAuth: marca aprovada e escopo em análise — 09/10/2026

## Resultado confirmado no painel

Conta: `jeanluis.dev@gmail.com`. Projeto: `prefab-clover-510801-h2`, Central Simples.

- Search Console: `https://centralsimples.com.br/` continua com **Você é um proprietário verificado**, na conta correta.
- Página inicial, privacidade e termos públicos retornaram HTTP 200. A metatag de propriedade permanece publicada.
- Repetida a análise automática da marca após o prazo anterior. Google exibiu **Sua marca foi verificada, mas ainda não está sendo mostrada aos usuários**; acionado Publicar branding.
- Resultado posterior: **Sua marca foi verificada e está aparecendo para os usuários.** Marca aprovada e publicada.
- O único cliente OAuth listado é **Central Simples - envio de emails**, usado pelos dois apps. Nenhum cliente, domínio, segredo ou permissão foi criado, removido ou ampliado.
- Público-alvo conferido: Externo, **Em produção**, um usuário OAuth autorizado. Não voltou ao modo de teste.
- A renovação de acesso com a credencial existente passou e retornou somente `https://www.googleapis.com/auth/gmail.send`, com validade de acesso de 3599 segundos. O refresh token foi preservado; nenhum e-mail enviado nesta conferência.

## Escopo: solicitação enviada e em análise

O proprietário publicou o vídeo [Google Verification](https://youtu.be/KqIX2rfhkD0), conferido como **Não listado**, com 6 minutos e 6 segundos. A gravação mostra o consentimento OAuth em inglês e os fluxos de cadastro com confirmação por e-mail nos dois apps. Link e justificativa de 859 caracteres foram salvos em Acesso a dados; o Google confirmou a persistência das mudanças.

O formulário final recebeu informações adicionais sobre o remetente, cliente compartilhado, fluxos públicos e política de privacidade. O proprietário marcou as declarações do questionário e autorizou confirmar. Conferidas quatro respostas **Não**: o app não é apenas pessoal, interno, de desenvolvimento/teste nem um plug-in WordPress SMTP. A declaração CASA é condicional à solicitação de escopos restritos; esta solicitação contém somente o escopo sensível `gmail.send`.

Acionado **Enviar para verificação** em 09/10/2026. A Central de verificação exibiu **O acesso aos dados do seu app está em análise.** A marca permanece aprovada e publicada; **o escopo ainda não foi aprovado**.

Ponto de atenção informado ao proprietário antes do envio: a gravação reaproveita a autorização anterior e não abre o detalhe **See the 1 service**. Os requisitos oficiais pedem exibir as permissões exatas. O Google pode solicitar um complemento mostrando a permissão de envio Gmail em inglês; nenhuma exigência adicional foi exibida no momento do envio.

O consentimento de gravação foi concluído pelo proprietário em 09/10/2026 às 16:19:51 (America/Sao_Paulo), com `gmail.send`. O auxiliar confirmou arquivos de credenciais inalterados e descartou o acesso temporário; não salvou refresh token, não enviou mensagens e não modificou a implantação produtiva.

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

## Acompanhamento pendente

1. Aguardar a resposta da análise na conta de contato `jeanluis.dev@gmail.com` e na Central de verificação do projeto.
2. Se o Google solicitar complemento, mostrar o detalhe da permissão Gmail na tela de consentimento em inglês, preservando as credenciais existentes.
3. Registrar a aprovação somente quando confirmada pelo Google. **Em análise** não significa aprovado.
4. Manter os apps operando com as credenciais e o escopo existentes. Não adicionar leitura, contatos, exclusão ou Gmail completo.

## Evidências e arquivos

Screenshots locais no projeto Central Simples, fora do Git, em `artifacts/google-oauth-2026-10-09/`: marca publicada, `video-e-justificativa-salvos.jpg` e `escopo-gmail-em-analise.jpg`. Nos três projetos, somente documentação foi alterada nesta etapa; nenhum código, banco, deploy Cloudflare ou credencial foi modificado.

## Fontes oficiais

- [Verificação de escopos sensíveis e requisitos do vídeo](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification).
- [Envio do app para análise](https://support.google.com/cloud/answer/13461325?hl=en).
