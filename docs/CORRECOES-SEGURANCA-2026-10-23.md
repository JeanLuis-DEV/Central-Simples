# Correções locais de segurança — Central Simples

Data: 23/10/2026. Escopo: CS-01.

[Relatório consolidado](C:/Dev/Projetos/Central Simples/docs/RELATORIO-CONSOLIDADO-SEGURANCA-2026-10-23.md)

## Estado e integridade

27 entradas Git modificadas/não rastreadas já existiam no inventário inicial. Validação realizada em 22–23/10/2026, Windows, Node 24.19.0 e pnpm 11.25.0. Bancos descartáveis, contas fictícias e provedores simulados. Builds executados em cópias sem .env/.dev.vars e com ambiente de processo filtrado. Nenhum banco local de usuário ou banco remoto foi aberto pelos testes.

Nenhum deploy, migração de produção, alteração de dados reais, commit, push, revogação de credencial real ou mudança de configuração de provedor foi realizado. As mudanças de código anteriores foram mantidas; não houve reset/checkout/clean. Nenhum arquivo fonte existente desapareceu na comparação de hashes com o inventário inicial. Arquivos modificados conjuntamente receberam alterações pontuais, sem substituição pelo HEAD.

Os artefatos locais foram reconstruídos. Os diretórios anteriores de build foram movidos integralmente para a pasta de evidências antes da cópia dos novos; não foram excluídos. Isso não publica o aplicativo. A pasta de evidências contém resultados locais e dados sintéticos e não deve ser distribuída como parte do produto.

Evidências temporárias: `C:/Users/Jean_DEV/AppData/Local/Temp/security-all-20261022`. O código dos testes novos e a lista de arquivos abaixo permanecem no projeto. Sucesso local não comprova segurança absoluta nem valida os serviços publicados.

## Implementação e status

### CS-01 — CORRIGIDA localmente

Causa: a configuração cobria a API, mas o HTML estático era entregue diretamente pelos assets Cloudflare. A leitura pública inicial de /area-restrita retornou 200 sem CSP ou X-Frame-Options; nenhuma autenticação real foi utilizada.

Solução: public/_headers define Content-Security-Policy: frame-ancestors 'none' e X-Frame-Options: DENY para /*. O export copia o arquivo para out/_headers, que é consumido pelo mecanismo de assets da configuração existente. worker.ts também aplica os dois cabeçalhos às respostas que passam pelo Worker.

Arquivos: public/_headers, worker.ts, tests/central-worker.test.mjs, tests/static-security.test.mjs; tests/central-admin-browser.mjs teve somente o seletor do título atualizado para a tela atual.

Testes/resultado: 21 testes de Worker/autenticação passaram; typecheck e export Next passaram. O teste estático executa o serviço real de assets Miniflare sem depender da API, exige HTML 200 com ambos os cabeçalhos e confirma no Chrome que um iframe de outra origem é bloqueado. O navegador administrativo passou em falha de logout, logout bem-sucedido e login limitado. A versão publicada permanece sem correção confirmada até publicação autorizada e verificação posterior.

## Dependências

| Dependência | Finorya / Meu Negócio: anterior → atual | Lingua Memory: anterior → atual |
|---|---|---|
| react | 19.2.6 → 19.2.9 | 19.2.6 → 19.2.9 |
| react-dom | 19.2.6 → 19.2.9 | 19.2.6 → 19.2.9 |
| react-server-dom-webpack | 19.2.6 → 19.2.9 | 19.2.6 → 19.2.9 |
| @vitejs/plugin-rsc | 0.5.26 → 0.5.38 | 0.5.36 → 0.5.38 |
| next | 16.3.8 → 16.4.1 | 16.3.8 → 16.4.1 |

Vinext preservado: 1.0.0-beta.5 no Ajudante/Finorya/Meu Negócio; 1.0.1 no Lingua. @vinext/cloudflare preservado. As únicas alterações diretas de dependências desta execução são as cinco versões da tabela. Os lockfiles pnpm incluem os transitivos exigidos por esses pacotes, como @next/env/SWC 16.4.1 e a árvore atualizada do plugin (srvx, strip-literal, js-tokens, es-module-lexer, magic-string e obug quando aplicável). Não houve atualização geral das dependências de negócio.

Ajudante: React/React DOM/RSC 19.2.9 e plugin 0.5.38 já estavam corrigidos no início desta execução. package.json, package-lock.json e pnpm-lock.yaml foram preservados sem mudanças. O Next 16.3.8 continua instalado como ferramenta sem uso no caminho Vinext validado; seu RSC não foi classificado como corrigido para uma execução futura via Next. Central: dependências preservadas; Next 16.3.4 é usado para exportação estática e não há servidor RSC no ambiente estático validado. Isso não constitui auditoria geral de todas as dependências desses dois projetos.

## Validação deste aplicativo

21 testes node:test de Worker/autenticação, 1 teste node:test de assets/iframe, typecheck, instalação pnpm congelada, export Next estático e navegador administrativo: PASSARAM. Não foi publicado o out gerado. Não houve atualização de dependências.

Comandos relevantes executados, conforme o runtime: node node_modules/typescript/bin/tsc --noEmit; node node_modules/vitest/vitest.mjs run (apps 0–3); node --test tests/central-worker.test.mjs tests/central-auth-state.test.mjs (Central); builds pelo CLI Next/Vinext existentes; testes novos listados abaixo. Execuções de navegador/Worker foram feitas nas cópias isoladas com ambiente filtrado. Não executar verificadores de provedores reais como parte desta rotina.

## Antes de distribuição

Antes de publicar: garantir que out/_headers seja incluído no pacote estático e manter o mecanismo Cloudflare assets já configurado. Após publicação autorizada, verificar cabeçalhos do HTML real e bloqueio de iframe. Não há migração de banco nova para CS-01. As alterações de autenticação/DO que já estavam pendentes antes desta tarefa não foram publicadas automaticamente.

Somente após revisão final e autorização humana: preparar backup e plano de reversão, aplicar schema/configuração apropriados, publicar e verificar a versão distribuída. Voltar apenas o binário/código após uma migração sem avaliar a compatibilidade do schema não é um plano de reversão validado.

## Arquivos alterados nesta execução

Lista calculada por hash contra o inventário inicial, excluindo artefatos/cache. Não corresponde à lista completa de mudanças anteriores do Git.

- `public/_headers`
- `tests/central-admin-browser.mjs`
- `tests/central-worker.test.mjs`
- `tests/static-security.test.mjs`
- `worker.ts`
- `docs/CORRECOES-SEGURANCA-2026-10-23.md` (este relatório)

Artefatos preparados: out/ e .next/. Diretórios antigos preservados em C:/Users/Jean_DEV/AppData/Local/Temp/security-all-20261022/4/previous-*.

## Continuidade — estabilização de 23/10/2026

Esta etapa histórica foi complementada por [ESTABILIZACAO-2026-10-23.md](ESTABILIZACAO-2026-10-23.md) e pelo [relatório consolidado de estabilização](<C:/Dev/Projetos/Central Simples/docs/ESTABILIZACAO-SEGURANCA-2026-10-23.md>). Os novos resultados e planos estão nesses documentos. APP-01 permanece parcialmente corrigida e a publicação continua bloqueada por decisão do usuário. Nenhum deploy foi realizado.
