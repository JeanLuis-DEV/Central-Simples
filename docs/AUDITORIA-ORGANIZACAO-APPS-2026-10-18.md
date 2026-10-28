# Auditoria de organização dos aplicativos — 18/10/2026

## Escopo e referência

Referência revisada no código e na sessão online do Meu Negócio: navegação em coluna, configurações no mesmo menu, ação Sair textual no cabeçalho, saída também no menu mobile, conteúdo sem slogans de interface. O workspace e os estilos do Meu Negócio não foram alterados. A Central Simples é catálogo/administração e ficou fora da padronização de workspaces; suas alterações anteriores foram preservadas.

## Matriz de achados e correções

| App | Evidência anterior | Ajuste | Validação local |
| --- | --- | --- | --- |
| Finorya | Configurações separado no rodapé; Sair apenas na lateral; nome/avatar, versão, slogan e aviso estático ocupavam menu/cabeçalho | Configurações é o último item da navegação; Sair textual no cabeçalho e drawer; marca compacta; retirados perfis decorativos e textos repetidos | 6 seções navegadas; configurações, sincronização visível, drawer, Escape e logout com falha/sucesso |
| Ajudante Elétrico | Configurações no SidebarFooter; nome da empresa/licença repetidos no cabeçalho; drawer sem fechamento textual acessível próprio; seletor antigo data-slot=menu-button não correspondia ao componente sidebar-menu-button | Configurações no mesmo menu; marca compacta com nome completo; botão Sair permanece textual no mobile; fechar menu acessível; estilos associados ao componente real | 8 seções navegadas; Configurações ativa; fechamento automático ao navegar; botão e Escape; logout com falha/sucesso |
| Lingua Memory | Configurações isolado; perfil/avatar e texto repetidos no topo; saída apenas por ícone; saudação e frases de apresentação em todas as telas | Configurações na navegação; Sair com texto no cabeçalho e drawer; títulos objetivos; marca compacta só no workspace | 5 seções navegadas; preferências e segurança mantidas; contadores de revisão; drawer e logout com falha/sucesso |

## Limpeza de texto e preservação funcional

- Finorya: retirados rodapé de marketing, slogans de menu e cartões apenas institucionais das configurações. Mantidos Nome do espaço, perfis, importação da versão pessoal, exportação e restauração, confirmação de sobrescrita e orientações de backup.
- Ajudante: retirados rodapé de marketing e subtítulos que repetiam títulos dos painéis. Licença/contagem de dias foi movida para Configurações; a expiração e os controles de acesso não foram alterados. Mantidos todos os cadastros, orçamentos, ordens, financeiro, documentos, fotos, impressão, importação/exportação e confirmações de exclusão.
- Lingua: retirados subtítulos motivacionais dos cabeçalhos e badge decorativo do estudo. Mantidos frases, áudio, revisão, progresso, metas, preferências, senha, exportação, suporte e reset com suas orientações e proteções. Brand compacta é opcional; autenticação/landing continuam com sua apresentação própria.
- Nenhum endpoint, schema, migração, contrato de dados, cálculo ou implementação de autenticação/logout foi alterado. Foram reposicionados os controles existentes e reutilizados seus handlers.

## Verificações

- TypeScript e ESLint aprovados nos três projetos; builds de produção Cloudflare aprovados.
- Harness de regressão visual/operacional: 19 seções, viewport desktop 1440 px e mobile 320/390 px; drawer curto com 500 px de altura; configuração dentro do menu; fechar por botão/Escape; navegação fecha o drawer; Sair no cabeçalho e menu mobile; falha de logout mantém o workspace; sucesso fecha a sessão. APIs simuladas em localhost, sem tocar contas ou dados reais.
- Finorya: 125 testes existentes aprovados (9 arquivos).
- Lingua Memory: 53 testes existentes aprovados (5 arquivos); expectativas do teste de browser ajustadas aos títulos objetivos e ao rótulo Sair.
- Ajudante: verificação de transporte/sincronização aprovada com node --experimental-transform-types scripts/verify-workspace-client.mjs. O flag apenas habilita o runner local para a sintaxe TypeScript já existente.
- APIs de produção e banco não são alvos dos testes locais; publicação não executa migrações e preserva variáveis/secrets com --keep-vars.

## Evidências e execução

Harness reproduzível: output/layout-audit-2026-10-18/verify-shell.cjs (na Central Simples). Relatório local: local-report.json na mesma pasta. Capturas desktop das configurações e mobile do drawer e da página ficam nessa pasta, com dados fictícios. Logs de build/deploy ficam em output/layout-audit-2026-10-18/ de cada app.

## Publicação e conferência online

As três versões foram publicadas em produção em 18/10/2026, sem migrações e com preservação das variáveis existentes.

| App | Versão Cloudflare | Conferência real |
| --- | --- | --- |
| Finorya | b33b4f58-b086-4450-87c3-30e3a90ad78e | Sessão autenticada: seis seções navegadas, Configurações no menu, Sair textual no cabeçalho, controles de backup/perfis mantidos |
| Ajudante Elétrico | bda54d8a-b612-4f0b-b0a9-a360c0bb1976 | Sessão autenticada: oito seções navegadas, Configurações no menu, Sair textual no cabeçalho, licença visível nas configurações |
| Lingua Memory | aa7de4ee-9c46-413a-b905-b60be35cb89d | Sessão autenticada: cinco seções navegadas; Configurações no menu; Sair textual no cabeçalho; preferências, senha, exportação e reset presentes. Nenhum erro de console observado |

Nenhum cadastro foi criado, salvo ou removido nas sessões reais. Logout com sucesso/falha foi exercitado somente em localhost. A verificação responsiva de 320/390 px é local; a conferência autenticada online usou o viewport desktop real. A tentativa de override pelo navegador não alterou sua dimensão efetiva e foi restaurada, sem atribuir esse teste à produção.

Capturas reais: output/layout-audit-2026-10-18/finorya-online.png, ajudante-online.png e lingua-online.png na Central Simples. A pendência de login do Lingua Memory foi resolvida e sua conferência interna online foi concluída.

## Arquivos desta padronização

- Finorya: components/workspace.tsx, components/dashboard.tsx, components/categories.tsx, components/settings.tsx, app/globals.css e docs/AUDITORIA-ORGANIZACAO-2026-10-18.md.
- Ajudante Elétrico (relativo à pasta app): app/workspace.tsx, app/dashboard.tsx, app/design.css, components/ui/sidebar.tsx e docs/AUDITORIA-ORGANIZACAO-2026-10-18.md.
- Lingua Memory: components/workspace.tsx, components/ui.tsx, components/progress-panel.tsx, app/globals.css, tests/browser.mjs e docs/AUDITORIA-ORGANIZACAO-2026-10-18.md.
- Central Simples: apenas este relatório e o harness/evidências em output/layout-audit-2026-10-18/. Alterações anteriores de landing/autenticação nos repositórios não pertencem a esta padronização.

## Correção de espaçamento do Ajudante — 18/10/2026

O SidebarInset já renderiza main. A regra global main aplicava padding tanto nele quanto no main interno, duplicando o recuo superior e lateral. O conteúdo interno passou a div.workspace-content e seus quatro seletores responsivos foram restritos à classe. Mantido um único landmark main e preservados os controles.

Arquivos: app/workspace.tsx e app/design.css. TypeScript, ESLint, build e regressão de navegação/drawer/logout aprovados. Publicado com --keep-vars, sem migrações, versão a9a252a0-1847-487a-bcdc-d18ff3fae37b. Conferência autenticada online: cabeçalho em y=0, alinhado ao fim da sidebar em x=244, padding externo 0 e sem overflow horizontal. Captura: output/layout-audit-2026-10-18/spacing-online.png no app Ajudante.
