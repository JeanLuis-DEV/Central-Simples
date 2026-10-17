# Meu Negócio no catálogo — 17/10/2026

## Alteração

- Quarto aplicativo no catálogo público, apresentação mobile, diálogo de detalhes e seletor Acessar apps.
- Endereço público: https://meunegocio.centralsimples.com.br; acesso em `/login`.
- Prévia local configurável por `NEXT_PUBLIC_MEU_NEGOCIO_URL`, porta 5181; build Cloudflare usa o domínio HTTPS publicado.
- Capturas reais com dados de demonstração do resumo comercial, sem contas ou dados de clientes reais.
- Identidade navy/âmbar e ícone de comércio no mesmo padrão dos outros produtos.
- Metadados, termos e privacidade incluem Meu Negócio. A política mantém as seções de compartilhamento e proteção exigidas pelo Google, acrescenta os dados comerciais e esclarece os atalhos opcionais de mapas e WhatsApp. Não há confirmação de conta por WhatsApp.

## Administração e preservação

A integração administrativa já estava publicada, com chave exclusiva; não foi recriada.
As correções locais de autenticação de 12/10 continuam fora desta publicação.
O pacote publicado deve usar a base produtiva `ae43505` com apenas os arquivos desta inclusão,
sem aplicar `CENTRAL_AUTH` nem alterar credenciais, bancos, domínio ou integrações dos produtos.

## Vídeo Google

Incluir a apresentação do Meu Negócio e os fluxos reais de código de cadastro,
recuperação e etapa de e-mail da compra, além do suporte. Mostrar os envios na
conta remetente e o recebimento no destinatário de teste. Alertas operacionais
permanecem desativados no Meu Negócio, conforme sua configuração de produção.
O mesmo consentimento do titular usa somente `gmail.send`; não criar outra
permissão, trocar tokens ou pedir autorização Gmail aos clientes.

O recebimento real do Meu Negócio ainda precisa ser demonstrado. Não reutilizar
o resultado de Finorya/Ajudante como prova desse app. A inclusão no catálogo
não significa aprovação Google nem homologação de pagamento real.

## Validação e publicação

- Build Cloudflare, TypeScript e ESLint dos arquivos alterados aprovados.
- Árvore local: 21 testes de API/armazenamento aprovados, incluindo as correções de autenticação ainda não publicadas.
- Base produtiva isolada: seis testes de integração aprovados com `node --experimental-transform-types --test tests/central-worker.test.mjs`. O parâmetro é necessário para o TypeScript da base produtiva executado no Node 24; sem ele, a execução interrompe antes dos testes.
- Navegador real: quatro cards, quatro prévias, imagens carregadas, diálogo de detalhes e seletor de acesso com destino HTTPS correto. Sem overflow em 275, 390, 768, 1024 e 1440 px; diálogo mobile contido em 390 × 844.
- Build de publicação isolada com Webpack, evitando incluir arquivos locais de autenticação. `worker.ts`, `wrangler.json` e a tela administrativa comparados com `ae43505`; sem binding ou migração de autenticação novos. Wrangler dry-run aprovado.
- Publicado na conta `jeanluis.dev@gmail.com`, Worker `central-simples`, versão **5989f685-4031-4fa1-9ed8-d88df3e62a08**. Domínios existentes e variáveis preservados com `--keep-vars`; nenhum segredo foi alterado.
- Página pública e privacidade verificadas após a publicação, com os quatro aplicativos e data de 17/10/2026. A confirmação de entrega real de e-mails do Meu Negócio permanece fora desta etapa.
