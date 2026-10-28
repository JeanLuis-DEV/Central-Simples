# Publicação das landing pages — 17/10/2026

URL: https://www.centralsimples.com.br

Cloudflare Worker version: `7e1d32b6-9598-4a8d-af1c-d3c2d612af8d`

Build de produção e deploy concluídos. Variáveis e secrets preservados com --keep-vars. Nenhuma migração de banco executada.

Publicação feita em cópia isolada do HEAD com components/catalog.tsx e app/globals.css atualizados. Alterações locais pendentes de autenticação e administração ficaram fora deste deploy. Catálogo sem previews e listas de funções; descrições e links diretos para as landing pages.

Verificação real concluída em navegador sem mocks: HTTP 200, desktop e mobile sem overflow ou erros JavaScript, imagens reais carregadas e ocultas no mobile. No catálogo, os quatro cards não contêm previews ou funções. Cadastro do Lingua Memory abriu corretamente. Evidências e relatório JSON: Central Simples/output/production-landing-2026-10-17/.

## Ajuste de 18/10/2026

Removido o complemento "Simplifique a sua rotina." do título do catálogo, mantendo "Escolha o seu app.". Arquivo alterado: components/catalog.tsx. Build e lint aprovados. Publicado no Worker `fa5905ee-d9e8-46e4-97e1-53d25e894401`, preservando configuração e código de produção anteriores. Verificado no domínio público em desktop e mobile, sem erros JavaScript ou overflow. Evidências em output/catalog-title-2026-10-18/.

Removidos também o aviso "Esta é só a primeira página da nossa história. Novas ferramentas virão." e o ícone associado, além dos estilos sem uso. Arquivos: components/catalog.tsx e app/globals.css. Publicado em 18/10/2026, Worker `292d4c84-6c46-484f-8b3f-8ee4c544817a`. Build/lint aprovados e domínio público verificado em desktop e mobile. Evidências: output/catalog-without-note-1440.png e output/catalog-without-note-390.png.

Removido em 18/10/2026 o bloco institucional "ESSA É A NOSSA IDEIA / Várias ferramentas. Uma mesma forma de pensar.", junto dos links #sobre no cabeçalho e rodapé e estilos sem uso. Arquivos: components/catalog.tsx e app/globals.css. Build/lint aprovados; publicado no Worker `7ab8ba70-2ffb-4132-bba4-6fe9a6f622ca`. Domínio público verificado em desktop e mobile, sem âncoras quebradas ou overflow. Evidências: output/catalog-without-about-1440.png e output/catalog-without-about-390.png.

Removido em 18/10/2026 todo o menu de navegação do cabeçalho e os estilos específicos sem uso. Marca e botão Acessar apps preservados. Arquivos: components/catalog.tsx e app/globals.css. Build/lint aprovados. Publicado no Worker `218b7f55-7967-4c64-a41b-4455948fc1d8` e verificado no domínio público em desktop e mobile, inclusive abertura do diálogo de acesso. Evidências: output/header-without-menu-1440.png e output/header-without-menu-390.png.

Removidos em 18/10/2026 a marca Central Simples e a frase "Aplicativos simples. Possibilidades de sobra." do rodapé, com limpeza dos estilos correspondentes. Arquivos: components/catalog.tsx e app/globals.css. Build/lint aprovados. Publicado no Worker `8fb46a5d-61c3-4863-86fc-80cede84aa91`. Verificado online em desktop e mobile; marca do cabeçalho e links do rodapé preservados. Evidências: output/footer-without-brand-1440.png e output/footer-without-brand-390.png.

Em 18/10/2026, copyright centralizado com o texto "© 2026 Central Simples. Todos os direitos reservados.". Arquivos: components/catalog.tsx e app/globals.css. Build/lint aprovados. Publicado no Worker `821c289d-0428-4ec5-a380-2deef33be13e` e verificado no domínio público em desktop e mobile. Evidências: output/copyright-centered-1440.png e output/copyright-centered-390.png.

Em 18/10/2026, removidos Aplicativos e Acessar do rodapé. Preservados Administração, Privacidade, Termos de uso e acesso pelo cabeçalho. Arquivos: components/catalog.tsx e app/globals.css. Build/lint aprovados. Publicado no Worker `8ef8c8b3-7171-4b8b-b1f0-bebb40f67d48` e verificado online em desktop e mobile. Evidências: output/footer-links-clean-1440.png e output/footer-links-clean-390.png.

Em 18/10/2026, centralizados os links Administração, Privacidade e Termos de uso no rodapé. Arquivo: app/globals.css. Build aprovado. Publicado no Worker `727abc76-2694-4c8a-ace9-3d265346c4d7`; alinhamento confirmado no domínio público em desktop e mobile. Evidências: output/footer-links-centered-1440.png e output/footer-links-centered-390.png.

Em 18/10/2026, removido o ícone decorativo da tela de login administrativo e reduzida a margem superior do card para 24px em desktop e mobile. Arquivos: app/area-restrita/page.tsx e app/globals.css. Preservadas as mudanças locais pendentes de logout: na cópia de publicação, aplicado somente o ajuste visual sobre a versão administrativa já publicada. Build/lint aprovados. Worker `16de03b0-cd1c-4d9a-be70-af40982b7e2a`. Verificado online sem autenticar, com card acima de 120px e sem overflow. Evidências: output/admin-login-raised-1440.png e output/admin-login-raised-390.png.

Em 18/10/2026, removidos da administração autenticada o título Gerenciar contas, a descrição e o ícone decorativo. Mantido o rótulo Área administrativa; espaçamento do cabeçalho reduzido para 24px acima e 16px abaixo, aproximando abas e painéis do topo. Arquivos: app/area-restrita/page.tsx e app/globals.css. Build/lint aprovados. Publicação isolada preservou alterações locais de logout fora do escopo. Worker `04252fa7-84ee-42e5-9afd-7275e457b509`. Conferência real na sessão administrativa já aberta no Chrome, sem editar contas. Evidência: output/admin-heading-compact-online.png.

Em 18/10/2026, rótulo Área administrativa movido para o centro da barra superior, entre o retorno à Central e Sair. Removida a seção separada do rótulo, aproximando abas e painéis do topo. No mobile, o rótulo ocupa a primeira linha da barra para evitar sobreposição. Arquivos: app/area-restrita/page.tsx e app/globals.css. Build/lint aprovados. Worker `82cdad24-c994-4eb1-bcd4-bcfe171cecb7`. Verificado na sessão administrativa real em desktop e mobile sem alterar contas; janela restaurada ao tamanho original. Evidências: output/admin-label-topbar-online.png e output/admin-label-topbar-mobile-online.png.

Em 18/10/2026, os quatro links Conhecer aplicativo passaram a usar target=_blank e rel=noopener noreferrer. Abrir aplicativo e os links do diálogo de acesso já usavam nova aba. Atualizada a expectativa em tests/browser.mjs. Arquivos: components/catalog.tsx e tests/browser.mjs. Build/lint aprovados. Worker `154ddcc7-14ec-4185-852a-344be579c949`. Verificados online os atributos dos oito links dos cards. Teste real do Conhecer Finorya abriu nova aba no domínio do app, mantendo a URL da Central na aba original.
