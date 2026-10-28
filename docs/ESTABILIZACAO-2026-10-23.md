# Estabilização local — Central Simples

Data: 23/10/2026. Complementa o relatório anterior sem reescrever seu histórico.

Foi criado `tests/run-static-browser.mjs` para executar a suíte histórica contra o export local em loopback. O navegador bloqueia saída externa; somente um script conhecido injetado pelo antivírus local recebe resposta vazia no teste, sem mudar o produto ou desativar o antivírus.

Passaram 21 testes de Worker/autenticação, 1 teste de assets/iframe, typecheck, lint, Next, export Cloudflare, navegador público e administrativo. O teste de assets usa o serviço Miniflare real e confirmou CSP frame-ancestors e X-Frame-Options no HTML estático, além do bloqueio em iframe no Chrome. A instalação pnpm congelada em cópia física nova passou. As correções anteriores em `public/_headers` e `worker.ts` foram preservadas.

CS-01 está corrigida localmente; a versão publicada não foi verificada nesta etapa. A publicação permanece bloqueada para revisão conjunta. Na publicação futura autorizada, distribuir `out/_headers` junto com assets e Worker; verificar depois os cabeçalhos reais sem credenciais/dados de usuários. Nenhuma migração nova é necessária para CS-01.

Nenhum deploy, migração de produção, dado real, commit ou push foi realizado. Alterações preexistentes foram preservadas. Manifests, lockfiles e configurações de produção não foram alterados nesta etapa. Testes usaram cópias isoladas, bancos descartáveis e identidades/serviços fictícios.

Relatório completo, evidências, inventário e planos de aplicação/recuperação: [Estabilização consolidada](<C:/Dev/Projetos/Central Simples/docs/ESTABILIZACAO-SEGURANCA-2026-10-23.md>).
