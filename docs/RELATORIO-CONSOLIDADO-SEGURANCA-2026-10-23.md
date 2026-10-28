# Relatório consolidado — correções de segurança dos cinco aplicativos

Data: 23/10/2026. Correções locais, sem autorização de publicação utilizada.

## A. Resumo por aplicativo

| Aplicativo | Corrigidas localmente | Pendências | Validação |
|---|---|---|---|
| Ajudante Elétrico | DEP-01 preservada | APP-01 parcialmente mitigada | 45 testes, typecheck, Vinext, Worker/auth/pagamentos e navegador passaram |
| Finorya | DEP-01 | APP-01 parcial; suíte histórica do navegador | 179 testes, typecheck, Next/Vinext, Worker, cadastro/isolamento/financeiro e pagamentos simulados passaram |
| Lingua Memory | DEP-01; LM-01; LM-02; LM-03; LM-04 | Migração e validação publicada futuras | 135 testes, typecheck, Next/Vinext, 25 checks no navegador e Worker real passaram |
| Meu Negócio | DEP-01 | APP-01 parcial; suíte histórica; monitor de backup anterior | 314 testes, typecheck, Next/Vinext, cadastro/isolamento/financeiro/comercial e pagamentos simulados passaram |
| Central Simples | CS-01 | Verificação após publicação autorizada | 21 testes Worker + 1 assets/iframe, typecheck, export e navegador administrativo passaram |

Total: 695 testes nas suítes Vitest/node:test passaram, além das verificações de protocolo RSC, integração e navegador descritas. Esse total não significa que todas as suítes históricas passaram. Os impedimentos estão declarados; nenhum dos aplicativos foi declarado integralmente livre de vulnerabilidades.

## B. Relatório por vulnerabilidade

### DEP-01 — CORRIGIDA no caminho de execução validado

Causa: codecs RSC desatualizados, incluindo o pacote direto, cópias internas do framework e a cópia distribuída pelo plugin.

Solução: versões aprovadas, lockfile coerente, Vinext mantido e Next 16.4.1 nos três aplicativos com esse runtime. No Ajudante, preservação da correção já validada. A Central não recebeu atualização de RSC por usar exportação estática.

Arquivos: package.json e pnpm-lock.yaml de Finorya/Lingua/Meu Negócio; scripts/verify-rsc-provenance.mjs e tests/rsc-transport.mjs nos quatro apps React com servidor. Nenhum package-lock novo foi criado em projetos que usam somente pnpm.

Validação: arquivos oficiais npm baixados somente pelos seus nomes públicos; SHA-512 do arquivo comparado ao registro e ao lockfile; SHA-256 dos codecs instalados comparado ao conteúdo do arquivo oficial. Verificados 6 codecs de produção do RSC direto, 6 do plugin e 12 de Next webpack/turbopack nos apps atualizados. O plugin 0.5.38 traz RSC 19.3.1; a resolução efetiva do plugin redireciona suas importações para react-server-dom-webpack 19.2.9 quando esse pacote está instalado. Conferida essa resolução a partir de Vinext e inspecionadas as proteções do codec nos chunks gerados. Testado roundtrip de texto inerte com três arrays tipados separados nos codecs direto, do plugin e de Next (este último somente nos três apps com Next atualizado). Builds e testes de navegador/Worker exercitaram os artefatos gerados. Não foi usado payload de exploração.

Resultado: nenhuma cópia vulnerável identificada nos caminhos RSC efetivamente validados. Essa conclusão combina proveniência, resolução, código dos artefatos e regressão funcional; não deriva apenas de números de versão ou de build bem-sucedido. Não foram verificados universalmente todos os advisories das demais dependências.

Fontes oficiais consultadas:

- [React: GHSA-xqc2-xf4c-x3h3](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3).
- [Vite plugin-rsc 0.5.38](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-rsc@0.5.38).
- [Next: GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr).

Repetição segura: node scripts/verify-rsc-provenance.mjs --next e node --conditions=react-server tests/rsc-transport.mjs --next. Omitir --next no Ajudante. A primeira verificação faz somente leituras locais e downloads públicos npm; não transmite código ou dados do projeto.

### LM-01 — CORRIGIDA localmente

Causa: Central, administração e troca interna aplicavam invalidação de credenciais de formas diferentes e em operações separadas.

Solução: lib/credential-policy.ts centraliza o incremento de auth_version, alteração de hash/identidade, revogação de sessões, consumo das recuperações antigas e exclusão de autorizações push. lib/credential-local.ts executa transação SQLite; lib/credential-d1.ts usa batch atômico D1. Compare-and-swap exige versão e hash esperados. auth_change_id individual impede que um snapshot administrativo vencido revogue autorizações criadas depois de outra alteração. Mudança de e-mail limpa as confirmações anteriores conforme a política administrativa existente. Recuperação concluída também remove inscrições de dispositivos.

Arquivos: lib/credential-*.ts, lib/d1-admin.ts, lib/d1-central.ts, app/api/internal/central/accounts/local-handler.ts, app/api/admin/users/route.ts, app/api/auth/[action]/route.ts, lib/password-recovery.ts e db/0010_session_auth_version.sql.

Testes/resultado: cenários SQLite e D1 em tests/credential-security.test.ts; alteração via Central com HMAC fictício; sessão/refresh/recuperação antiga negados; dispositivos revogados; snapshot vencido não afeta sessão nova; falha forçada na revogação provoca rollback integral. O Worker real workerd com D1/R2 descartáveis passou. Navegador confirmou troca de senha, recuperação e operações administrativas.

### LM-02 — CORRIGIDA localmente

Causa: senha era validada antes de criar sessão sem vinculá-la à versão de autenticação, permitindo concorrência com revogação.

Solução: INSERT SELECT condicional exige a versão validada, usuário ativo e prazo vigente. Sessão armazena auth_version; acesso e refresh a comparam com users. Refresh D1 usa batch com condições de hash, revogação, versão e usuário atual; SQLite mantém transação. A migração 0010 invalida sessões legadas sem vínculo de versão, exigindo novo login.

Arquivos: lib/auth.ts, lib/d1-auth.ts, lib/accounts.ts, lib/d1-accounts.ts, app/api/auth/[action]/route.ts, lib/db.ts e db/0010_session_auth_version.sql.

Testes/resultado: concorrência determinística entre verificação da senha e INSERT de sessão nos dois caminhos; retorno 401 sem sessão válida. Testados acesso e renovação após mudança de versão. Incluídos na suíte de 14 cenários de credenciais, nos 135 testes do app e no Worker real.

### LM-03 — CORRIGIDA localmente

Causa: cota compartilhada global podia ser consumida por um cliente para bloquear outros.

Solução: lib/auth-limits.ts utiliza CF-Connecting-IP apenas quando existem bindings Cloudflare; X-Forwarded-For é ignorado. Cotas por rede e ação, por conta no login/cadastro e por token de refresh. Incrementos permanecem atômicos no banco. Login: rede 60/15 min e conta 10/15 min; cadastro: rede 20/15 min e e-mail 5/15 min; refresh: rede 240/15 min e token 120/15 min. As chaves são armazenadas com hash pelo limitador existente. O contador por conta reduz tentativas distribuídas sobre a mesma conta.

Node continua restrito a localhost pelos comandos existentes e ignora cabeçalhos encaminhados; não foi inventada uma origem de rede compartilhada para substituir a cota global. Expor esse servidor Node diretamente à internet exigiria configurar uma fonte confiável de IP na camada HTTP/proxy antes da publicação.

Arquivos: lib/auth-limits.ts e app/api/auth/[action]/route.ts. Testes: tests/auth-limits.test.ts (3 cenários), limite compartilhado entre alias/e-mail já existente e Worker com duas redes fictícias. Resultado: esgotar uma rede não bloqueou a outra; cabeçalhos forjados não escolheram a chave de rede; cotas por ação/token independentes.

### LM-04 — CORRIGIDA localmente

Causa: request.text()/arrayBuffer() liam o conteúdo inteiro antes da verificação de tamanho.

Solução: lib/request-body.ts limita bytes enquanto lê o stream, cancela quando excede e não confia apenas em Content-Length. JSON mantém 40.000 bytes; Central mantém 16 KiB; gravação mantém 12 MiB. Verificações preliminares de configuração, origem, formato e tempo da assinatura precedem a leitura Central; HMAC e nonce continuam obrigatórios. O nonce é reservado com operação atômica e entradas expiradas são limpas. Gravação exige sessão/origem antes de ler o áudio.

Arquivos: lib/request-body.ts, lib/http.ts, lib/d1-http.ts, lib/central-request.ts, lib/d1-central.ts, app/api/internal/central/accounts/local-handler.ts e app/api/phrases/[id]/recording/route.ts.

Testes/resultado: tests/request-body.test.ts (5 cenários) usa streams pequenos para limite exato, tamanho ausente/mentiroso, cancelamento e recusa preliminar sem leitura. Worker confirmou JSON excessivo com 413. Navegador validou gravação, envio, reprodução, tickets, Range e isolamento. O limite protege a acumulação pela aplicação; não substitui limites de transporte/proxy ou cotas gerais de infraestrutura.

### Compatibilidade Next / Cloudflare

As 14 rotas que importam recursos Node trocaram a declaração runtime de edge para nodejs para o caminho Next 16.4.1. O build Next falhava em node:crypto com a declaração anterior; após o ajuste passou. Vinext continua gerando Worker com nodejs_compat e D1/R2, validado por workerd. Não houve mudança de bindings ou configuração de produção. tests/browser.mjs recebeu seletores atuais e esperas pela conclusão de senha/logout; nenhum componente de produto foi alterado para satisfazer testes.

### APP-01 — NÃO CORRIGIDA integralmente; mitigação local implementada

Causa: consultas públicas e restrições únicas de cadastros pendentes produziam respostas distintas para e-mail, telefone, CPF ou login já cadastrados. A compra também distinguia login existente com senha incorreta.

Solução implementada: solicitação inicial sempre percorre a mesma geração de ID, hash de senha, desafio e envio de e-mail, inclusive para identificadores existentes. HTTP 201, estrutura de resposta, status e exigência de código são uniformes; falhas de provedor também seguem o mesmo caminho. Limitação adicional por e-mail. A compra com senha incorreta segue o fluxo de confirmação; a compra com senha correta mantém o caminho autenticado. Conflitos após confirmação retornam uma única mensagem, sem nomear o campo.

Persistência: migração 0014 cria registration_requests e registration_codes sem reserva única antes da confirmação. Índices únicos parciais reservam identificadores no processamento verificado; criação de usuário/workspace e reserva ocorrem no mesmo batch. Compras reservam a identidade no batch da ordem. As restrições únicas de app_users são preservadas. A migração copia IDs, códigos e confirmações pendentes, conserva as tabelas antigas e não apaga linhas durante a migração. O trigger apenas acompanha a exclusão normal do pedido quando ele conclui ou expira.

Arquivos principais: app/api/auth/register/{route,status,verify,resend,complete}, lib/registration-privacy.ts, lib/trial-verification.ts, lib/mercado-pago.ts e a migração 0014. No Ajudante, db/schema.ts também descreve as novas tabelas. Fixtures e verificadores de pagamento foram ajustados para o novo staging; o verificador que exige credenciais de provedor não foi executado.

Testes: 9 cenários em tests/registration-security.test.ts por aplicativo. Identificadores fictícios existentes/inexistentes, pendências concorrentes, preservação do cadastro antigo na migração, reserva única, compra com senha incorreta e conclusão após confirmação. Testes de pagamento local confirmaram que nenhuma conta nasce antes da aprovação e que webhooks repetidos não duplicam a ativação. As respostas antes da confirmação foram validadas com sucesso; não se demonstrou equivalência temporal perfeita em qualquer infraestrutura.

Limitação CONFIRMADA em fixture: uma pessoa que comprova apenas seu próprio e-mail ainda pode fornecer um CPF de terceiro e observar conflito genérico na conclusão, ao contrário de um CPF disponível. A confirmação do e-mail não comprova posse do CPF. A mesma regra também cobre telefone/login, portanto há risco semelhante a avaliar para esses campos. A mensagem genérica e os limites reduzem a exposição, mas não eliminam essa inferência.

Impedimento da correção integral: ocultar completamente esse resultado mantendo unicidade e disponibilidade imediata da conta requer uma política adicional de comprovação de identidade ou tratamento de conflitos fora do fluxo público. Não foi adicionado um provedor de validação de CPF, verificação telefônica obrigatória ou sucesso fictício, pois isso alteraria requisitos e poderia impedir cadastros legítimos. A decisão precisa de revisão humana antes da distribuição. Não classificar APP-01 como eliminada.

### CS-01 — CORRIGIDA localmente

Causa: a configuração cobria a API, mas o HTML estático era entregue diretamente pelos assets Cloudflare. A leitura pública inicial de /area-restrita retornou 200 sem CSP ou X-Frame-Options; nenhuma autenticação real foi utilizada.

Solução: public/_headers define Content-Security-Policy: frame-ancestors 'none' e X-Frame-Options: DENY para /*. O export copia o arquivo para out/_headers, que é consumido pelo mecanismo de assets da configuração existente. worker.ts também aplica os dois cabeçalhos às respostas que passam pelo Worker.

Arquivos: public/_headers, worker.ts, tests/central-worker.test.mjs, tests/static-security.test.mjs; tests/central-admin-browser.mjs teve somente o seletor do título atualizado para a tela atual.

Testes/resultado: 21 testes de Worker/autenticação passaram; typecheck e export Next passaram. O teste estático executa o serviço real de assets Miniflare sem depender da API, exige HTML 200 com ambos os cabeçalhos e confirma no Chrome que um iframe de outra origem é bloqueado. O navegador administrativo passou em falha de logout, logout bem-sucedido e login limitado. A versão publicada permanece sem correção confirmada até publicação autorizada e verificação posterior.

## C. Dependências

| Dependência | Finorya / Meu Negócio: anterior → atual | Lingua Memory: anterior → atual |
|---|---|---|
| react | 19.2.6 → 19.2.9 | 19.2.6 → 19.2.9 |
| react-dom | 19.2.6 → 19.2.9 | 19.2.6 → 19.2.9 |
| react-server-dom-webpack | 19.2.6 → 19.2.9 | 19.2.6 → 19.2.9 |
| @vitejs/plugin-rsc | 0.5.26 → 0.5.38 | 0.5.36 → 0.5.38 |
| next | 16.3.8 → 16.4.1 | 16.3.8 → 16.4.1 |

Vinext preservado: 1.0.0-beta.5 no Ajudante/Finorya/Meu Negócio; 1.0.1 no Lingua. @vinext/cloudflare preservado. As únicas alterações diretas de dependências desta execução são as cinco versões da tabela. Os lockfiles pnpm incluem os transitivos exigidos por esses pacotes, como @next/env/SWC 16.4.1 e a árvore atualizada do plugin (srvx, strip-literal, js-tokens, es-module-lexer, magic-string e obug quando aplicável). Não houve atualização geral das dependências de negócio.

Ajudante: React/React DOM/RSC 19.2.9 e plugin 0.5.38 já estavam corrigidos no início desta execução. package.json, package-lock.json e pnpm-lock.yaml foram preservados sem mudanças. O Next 16.3.8 continua instalado como ferramenta sem uso no caminho Vinext validado; seu RSC não foi classificado como corrigido para uma execução futura via Next. Central: dependências preservadas; Next 16.3.4 é usado para exportação estática e não há servidor RSC no ambiente estático validado. Isso não constitui auditoria geral de todas as dependências desses dois projetos.

Instalação reproduzível: pnpm --frozen-lockfile --ignore-scripts passou em instalações físicas novas para Finorya, Lingua, Meu Negócio e Central. As cópias de validação receberam os mesmos package.json/lockfiles dos projetos. No Ajudante, a correção e as validações congeladas npm/pnpm anteriores foram preservadas; não houve nova instalação nem modificação de dependências nesta execução.

## D. Integridade

Validação realizada em 22–23/10/2026, Windows, Node 24.19.0 e pnpm 11.25.0. Bancos descartáveis, contas fictícias e provedores simulados. Builds executados em cópias sem .env/.dev.vars e com ambiente de processo filtrado. Nenhum banco local de usuário ou banco remoto foi aberto pelos testes.

Nenhum deploy, migração de produção, alteração de dados reais, commit, push, revogação de credencial real ou mudança de configuração de provedor foi realizado. As mudanças de código anteriores foram mantidas; não houve reset/checkout/clean. Nenhum arquivo fonte existente desapareceu na comparação de hashes com o inventário inicial. Arquivos modificados conjuntamente receberam alterações pontuais, sem substituição pelo HEAD.

Os artefatos locais foram reconstruídos. Os diretórios anteriores de build foram movidos integralmente para a pasta de evidências antes da cópia dos novos; não foram excluídos. Isso não publica o aplicativo. A pasta de evidências contém resultados locais e dados sintéticos e não deve ser distribuída como parte do produto.

Evidências temporárias: `C:/Users/Jean_DEV/AppData/Local/Temp/security-all-20261022`. O código dos testes novos e a lista de arquivos abaixo permanecem no projeto. Sucesso local não comprova segurança absoluta nem valida os serviços publicados.

Inventário inicial: Ajudante 59, Finorya 98, Lingua 113, Meu Negócio 103, Central 27 entradas modificadas/não rastreadas. O inventário por hash e o estado Git inicial foram guardados antes das mudanças. Todos os arquivos anteriores inventariados continuam presentes. As versões/configurações de produção e credenciais não foram alteradas. Testes utilizaram configurações fictícias explicitamente fornecidas; arquivos .env e .dev.vars reais foram excluídos das cópias de execução. Não foram executados verificadores de provedor real, backup de produção, restore real ou comandos de migração remota.

## E. Pendências e revisão humana

1. **APP-01 não está integralmente corrigida nos três apps.** Validar uma política que impeça inferência de CPF/telefone após o usuário confirmar apenas seu e-mail. O teste novo registra o risco residual com CPF sintético existente. A mitigação pré-confirmação está implementada e testada, mas não justifica encerrar esse ID como eliminado.
2. Revisar/aplicar, somente com autorização específica de produção, a migração 0014 do cadastro no Ajudante/Finorya/Meu Negócio. Preserva dados pendentes e cria staging/índices novos; precisa acompanhar o código. Nenhuma migração de produção foi executada.
3. Revisar/aplicar db/0010_session_auth_version.sql no Lingua. Sessões legadas serão encerradas; planejar novo login. Preparar backup antes de iniciar qualquer nova versão contra SQLite real, pois o inicializador local aplica migrações automaticamente.
4. Corrigir separadamente o monitor de backup do Meu Negócio: lib/operations.ts:208 aceita apenas os identificadores dos outros apps. O cenário de heartbeat não passou; não esconder o problema usando um identificador falso no teste.
5. Atualizar/validar as suítes históricas de navegador do Finorya e Meu Negócio. No Finorya há seletor de perfil removido e a investigação da sincronização entre abas não concluiu; no Meu Negócio a suíte herdada espera marca/tela de Finorya. Os testes direcionados passaram e estão disponíveis por --security, preservando o comando padrão antigo para evidenciar a pendência.
6. Garantir inclusão de out/_headers da Central. Cabeçalhos/iframe foram verificados localmente no serviço de assets; o site publicado não foi atualizado e deve ser verificado somente após futura publicação autorizada.
7. Ajudante mantém Next 16.3.8 sem uso no caminho Vinext; não ativar um runtime Next baseado nele sem atualizar e validar sua cópia RSC. Central mantém dependências de build sem servidor RSC publicado. Outros advisories não fazem parte desta correção delimitada.
8. Integrações reais Gmail, Mercado Pago, notificações push e Cloudflare publicado continuam sem validação externa nesta etapa. Foram usados substitutos locais e D1/R2 descartáveis. Não considerar esses resultados como confirmação de entrega real ou transação financeira real.

## Relatórios e arquivos por aplicativo

- [Ajudante Elétrico](C:/Dev/Projetos/Ajudante Elétrico/docs/CORRECOES-SEGURANCA-2026-10-23.md) — inventário completo dos arquivos desta execução, testes e migração correspondente.
- [Finorya](C:/Dev/Projetos/Finorya/docs/CORRECOES-SEGURANCA-2026-10-23.md) — inventário completo dos arquivos desta execução, testes e migração correspondente.
- [Lingua Memory](C:/Dev/Projetos/Lingua Memory/docs/CORRECOES-SEGURANCA-2026-10-23.md) — inventário completo dos arquivos desta execução, testes e migração correspondente.
- [Meu Negócio](C:/Dev/Projetos/Meu Negócio/docs/CORRECOES-SEGURANCA-2026-10-23.md) — inventário completo dos arquivos desta execução, testes e migração correspondente.
- [Central Simples](C:/Dev/Projetos/Central Simples/docs/CORRECOES-SEGURANCA-2026-10-23.md) — inventário completo dos arquivos desta execução, testes e migração correspondente.

As etapas autorizadas e seguras foram concluídas localmente. APP-01 integral, cobertura histórica e publicação permanecem bloqueadas pelas pendências explícitas acima. Aguardando revisão/autorização do responsável antes de distribuir qualquer aplicativo.
