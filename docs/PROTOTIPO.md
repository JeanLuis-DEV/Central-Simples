# Primeiro protótipo — Central Simples

## Entrega

Blocos de funcionalidades organizados em três colunas no desktop e duas no mobile, alternando rótulos longos e curtos. Textos podem quebrar dentro do bloco para preservar a leitura. Quando a quantidade de funcionalidades não completa a última linha, o último bloco preenche a largura restante, sem retirar recursos ou deixar células vazias. Quantidades e layout conferidos no navegador.

Seleção de diferenciais apresentada em blocos: 12 no Finorya e 16 no Ajudante Elétrico. Recursos básicos, como cadastro, numeração e gravação de dados, foram retirados; recursos redundantes foram consolidados. Conteúdo conferido nos componentes e modelos dos projetos de referência (Finorya: dashboard, transactions, transaction-editor, category-picker, settings, reports e calculator; Ajudante: workspace, forms, dashboard e model). Não foram anunciadas integrações de pagamento, automação de WhatsApp ou entregas externas de verificação ainda pendentes. A lista também alimenta os detalhes de cada aplicativo. Cards ajustados para alinhar os botões e manter os blocos dentro da largura mobile.

Catálogo responsivo com Finorya e Ajudante Elétrico, duas telas mobile reais lado a lado no destaque principal, detalhes de cada aplicativo e seletor de acesso. Inclui apresentação e rodapé. A seção “Encontre. Conheça. Comece.” e seus links foram removidos no desktop e mobile. O campo de busca e o texto de apoio do catálogo foram removidos. A tarja intermediária de benefícios foi removida para uma passagem mais limpa entre o destaque principal e o catálogo. A identidade usa fundo azul escuro, destaques em âmbar e componentes arredondados.

Os diálogos permitem navegação por teclado, fechamento por Escape e devolvem o foco ao botão de origem. Imagens pertencem às telas de demonstração dos projetos de referência.

## Organização

- `app/page.tsx`: entrada do catálogo.
- `app/layout.tsx`: idioma, metadados e ícone.
- `app/globals.css`: identidade e layouts responsivos.
- `components/catalog.tsx`: catálogo, filtros, prévias e diálogos.
- `lib/catalog.ts`: cadastro de aplicativos e endereços.
- `public/apps/finorya.png`, `public/apps/ajudante.jpg`: telas de demonstração.
- `public/apps/finorya-mobile.png`, `public/apps/ajudante-orcamentos-mobile.jpg`: visão geral do Finorya e orçamentos do Ajudante no destaque principal.
- `tests/capture-ajudante.mjs`: captura reproduzível da tela real de orçamentos, com respostas de demonstração isoladas no navegador, sem gravar dados ou alterar contas no aplicativo. Requer Ajudante ativo em 5173.
- `public/favicon.svg`: símbolo da Central.
- `.env.example`: endereços públicos de referência.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`: dependências e comandos.
- `next.config.ts`, `tsconfig.json`, `next-env.d.ts`, `eslint.config.mjs`, `.gitignore`: configuração.
- `tests/browser.mjs`: verificação dos principais fluxos e capturas desktop/mobile.
- `README.md`, `docs/PROTOTIPO.md`: execução e escopo.

Novos aplicativos podem ser cadastrados em `lib/catalog.ts`, com imagem, nome, categoria, descrição, recursos e endereço. O filtro por categoria está preservado como implementação futura: estado, lógica e interface comentados em `components/catalog.tsx`, com estilos mantidos. Todos os aplicativos são exibidos no desktop e mobile.

## Validação do protótipo

Compilação de produção, TypeScript e ESLint aprovados. Navegador Chrome validou o catálogo, presença simultânea das duas telas mobile, detalhes dos dois aplicativos, seletor de acesso, fechamento e restauração de foco dos diálogos. Sem erros de execução ou console. Layouts de 1440, 390 e 360 pixels verificados, sem rolagem horizontal; capturas desktop e mobile revisadas em `artifacts/`. Os links externos foram conferidos sem testar autenticação nos aplicativos de destino.

## Ajuste mobile

Cabeçalho compacto para larguras de até 360 pixels, título com tamanho fluido e ajustes nas prévias, filtros e cards. Validado em 275, 280, 320, 360, 390, 540 e 768 pixels, sem rolagem horizontal e com os elementos principais dentro da tela. Diálogos também verificados nessas larguras. Captura da tela estreita em `artifacts/mobile-narrow.png`.

## Implantação

Teste na rede local: servidor iniciado em `0.0.0.0:5190`, com acesso atual por `http://192.168.1.6:5190`. Firewall liberado pela regra `CentralSimples-MobilePreview-5190`, apenas TCP 5190, interface Wi-Fi e origens da sub-rede local. Script reproduzível: `scripts/enable-mobile-preview.ps1`, exige administrador. Para remover após os testes, executar como administrador `Remove-NetFirewallRule -Name CentralSimples-MobilePreview-5190`. Resposta HTTP 200 confirmada pelo endereço da rede; o acesso no celular depende também de a rede permitir comunicação entre dispositivos.

Verificação adicional no Chrome do usuário em 275 e 390 pixels: capturas reais confirmaram o conteúdo dentro da área disponível, considerando a largura da barra de rolagem. Cabeçalho ajustado para manter o botão de acesso em uma linha na tela estreita. Página recarregada após a compilação. Capturas complementares com emulação mobile e toque em `artifacts/mobile-verificado-estreita.png` e `artifacts/mobile-verificado-celular.png`.

O protótipo é local, não foi publicado no domínio centralsimples.com.br. Antes de publicar, configurar os endereços reais dos aplicativos, domínio e HTTPS, revisar os textos e retirar o `noindex` dos metadados. Não há coleta de dados no catálogo.

Cada aplicativo continua responsável por sua conta, planos, teste grátis e dados. A Central não cria contas, processa pagamentos nem unifica a autenticação neste protótipo. Um acesso unificado futuro exige integração entre os sistemas e migração planejada das contas.
