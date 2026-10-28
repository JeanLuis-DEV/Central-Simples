# Estabilização e preparação local — cinco aplicativos

Data: 23/10/2026. Complemento do relatório consolidado anterior, preservado como histórico. Esta etapa não publicou nenhum aplicativo.

**PUBLICAÇÃO BLOQUEADA.** APP-01 continua parcialmente corrigida em Ajudante Elétrico, Finorya e Meu Negócio. O usuário decidiu manter a publicação bloqueada e definir a política de cadastro posteriormente. As demais correções técnicas foram executadas e validadas localmente; isso não autoriza nem comprova a segurança de uma versão publicada.

## A. Resultado por aplicativo

| Aplicativo | Correções e validações desta etapa | Testes automatizados | Pendências | Status |
|---|---|---|---|---|
| Ajudante Elétrico | Regressão APP-01 ampliada; migração 0014 com dados antigos; resolução reproduzível do Miniflare no verificador de autenticação | 54 testes; typecheck, lint, Vinext, Worker de autenticação/pagamentos/operações/notificações, navegador e RSC | APP-01; migração e verificações de produção futuras | Validado localmente; publicação bloqueada |
| Finorya | Testes históricos atualizados; sincronização de formulários corrigida sem descartar rascunhos; migração 0014 | 188 testes; typecheck, lint, Next/Vinext, navegador histórico e segurança, Worker/API e navegador com bundle Worker | APP-01; migração e verificações de produção futuras | Validado localmente; publicação bloqueada |
| Lingua Memory | Migração 0010 validada com contas/sessões/aprendizado/áudio legados em SQLite e D1; regressão das quatro correções LM | 137 testes; typecheck, lint com um aviso preexistente, Next/Vinext, 25 verificações históricas no navegador e Worker real | Aplicação coordenada da migração; validação publicada futura | Validado localmente; publicação bloqueada para revisão conjunta |
| Meu Negócio | Suíte histórica atualizada; sincronização comercial e proteção de rascunhos; monitor de backup com identidade própria; migração 0014 | 336 testes; typecheck, lint, Next/Vinext, suíte histórica, segurança e 36 cenários comerciais, Worker/API e navegador com bundle Worker | APP-01; migração e verificações de produção futuras | Validado localmente; publicação bloqueada |
| Central Simples | Regressão de autenticação e proteção dos assets; execução local segura da suíte pública de navegador | 21 testes de Worker + 1 teste de assets/iframe; typecheck, lint, Next/export Cloudflare, navegador público e administrativo | Publicação autorizada e verificação posterior dos cabeçalhos | Validado localmente; publicação bloqueada para revisão conjunta |

Total: **737 testes Vitest/node:test aprovados**, incluindo o teste de assets. Os cenários de navegador, protocolo RSC e verificadores de Worker são adicionais e não foram somados novamente. Nenhum teste relevante permaneceu reprovado na execução final. Este documento registra também as falhas intermediárias e seus motivos.

## B. Resultado por problema

### APP-01 — exposição residual de identificadores

**PARCIALMENTE CORRIGIDA; risco confirmado com dados fictícios.** A mitigação anterior foi preservada. Antes da confirmação do e-mail, solicitações de cadastro com CPF, telefone, login ou e-mail já existentes continuam recebendo desafio e respostas uniformes. A criação do cadastro pendente não reserva esses identificadores para um solicitante não verificado.

Após comprovar somente o próprio e-mail, o solicitante ainda pode comparar uma conclusão aceita com um conflito de unicidade. Mensagem genérica, atraso artificial ou HTTP idêntico não eliminam a inferência se o resultado final continuar distinguível. E-mail confirmado não comprova titularidade do CPF nem do telefone informado.

Não foi alterada a política de cadastro, removida a unicidade, simulada uma criação bem-sucedida ou introduzido serviço de identidade. Os testes agora explicitam o risco residual para CPF, telefone, login e e-mail. Também cobrem identificador livre/existente, solicitações pendentes, confirmação, conclusão concorrente e checkout: nenhuma conta, ordem ou chamada ao provedor nasce no cenário bloqueado antes da prova exigida ou diante do conflito verificado.

Arquivos: `tests/registration-security.test.ts` e `tests/registration-migration.test.ts` nos três apps; no Ajudante ficam em `app/tests/`. São 16 testes de privacidade/cadastro e 2 de migração por aplicativo. A concorrência termina com uma conta e um workspace, sem duplicidade.

Alternativas para decisão posterior:

| Alternativa | Vantagem | Limitação e experiência do usuário | Aprovação |
|---|---|---|---|
| Manter a publicação bloqueada | Evita distribuir o risco conhecido enquanto a política é definida | Adia a publicação; não elimina o defeito no código atual | **Escolhida pelo usuário** |
| Comprovar titularidade dos identificadores antes de revelar a aceitação | Permite manter unicidade com autorização adequada para consultar conflitos | CPF válido ou prova apenas de e-mail/telefone não bastam para todos os campos; exige desenho de identidade, privacidade, custo e fricção | Pendente; não implementada |
| Tratar os novos cadastros por processo assistido uniforme | Retira a decisão imediata de conflito do fluxo público | Atraso de acesso, trabalho operacional e política de atendimento; só revisar conflitos ainda pode criar diferença observável | Pendente; não implementada |

Recomendação técnica: manter o bloqueio já escolhido e aprovar um desenho completo de comprovação/tratamento antes de mudar o fluxo. Nenhuma dessas hipóteses foi classificada como correção validada. Não foi demonstrada equivalência temporal perfeita em qualquer infraestrutura.

### Finorya — histórico e sincronização

Causa dos testes desatualizados: esperavam o nome do espaço em `.profile strong`, elemento que já não representa essa informação. Os seletores passaram a verificar o campo real em Configurações. Não foi acrescentado um elemento artificial apenas para o teste.

Defeito real: `hasWorkspaceDraft()` bloqueava a atualização enquanto existisse qualquer `form`, inclusive filtros, calculadora e preferências independentes do workspace. O observador também não acompanhava a mudança do estado de edição por atributo. Resultado: abas visíveis podiam permanecer com dados antigos.

Correção: formulários passivos são identificados explicitamente; o nome do espaço bloqueia atualização somente durante uma alteração não salva; diálogos e formulários não classificados continuam protegidos. O observador acompanha `data-workspace-draft` e `data-state`, retomando a leitura pendente quando a edição termina. Não foi adicionado polling nem alterada a regra financeira. Preferências de notificações continuam no provedor próprio, que preserva o estado local do formulário.

Arquivos: `lib/workspace-sync.ts`, `components/settings.tsx`, `components/{notification-settings,reports,calculator}.tsx`, `tests/browser.mjs` e `tests/run-browser.mjs`. O runner usa porta local livre e exige a prontidão do próprio processo, evitando confundir a resposta de outro aplicativo com o servidor em teste.

Validação: suíte histórica completa aprovada — dashboard/gráficos/calendário, lançamentos, recorrências, parcelas, categorias, calculadora, perfis, backup/importação fictícios, CSV/PDF, desktop/mobile e recarga. Duas abas reais atualizaram o nome; uma alteração não salva permaneceu intacta; ao desfazer o rascunho, a atualização remota foi aplicada. A suíte de segurança confirmou isolamento, CSRF, conflito de versão, logout, cadastro e pagamentos simulados. O navegador também criou um lançamento e confirmou centavos inteiros no D1 descartável usando os assets e o servidor Vinext compilados.

### Meu Negócio — testes históricos e sincronização comercial

Causa dos testes desatualizados: origem copiada do Finorya, títulos/menus/preços antigos, seletor de produto que não considerava a unidade e fluxo anterior à confirmação de venda/recebimento. Foram atualizados apenas para a interface e os valores comerciais já existentes. Identificadores internos ainda legítimos, como variáveis `FINORYA_*` usadas pela infraestrutura compartilhada, foram mantidos.

Os 36 roteiros comerciais agora recebem a origem do runner e recusam alvo fora de loopback/modo de teste. Foram removidos endereços LAN/portas fixas desses roteiros. `tests/browser-environment.mjs` centraliza essa restrição; `tests/run-browser.mjs --commercial` executa todos e falha se qualquer um reprovar. Não há testes ignorados para obter aprovação.

O mesmo bloqueio excessivo de sincronização afetava formulários comerciais sempre montados. `components/use-workspace-draft.ts` sinaliza interação e libera a atualização nos ciclos existentes de salvar/cancelar. A sinalização é síncrona no formulário, sem renderização adicional durante a digitação/seleção de campos não controlados. A primeira implementação provocou regressão em três cenários comerciais; foi substituída e os cenários foram repetidos. A regra `react-hooks/refs` também foi atendida sem desativar lint.

Arquivos de produção: `lib/workspace-sync.ts`, `components/{products-panel,contacts-panel,sales-panel,business-panel,use-workspace-draft,commercial-reports,reports,calculator,notification-settings}.tsx` (o hook tem extensão `.ts`). Os roteiros afetados estão discriminados no inventário ao final.

Validação: suíte histórica completa, segurança e **36/36 cenários comerciais** aprovados. Cobertura de produtos/custos, estoque e mínimos, clientes/fornecedores, pedidos, vendas/cancelamentos, parcelas, entrega e atraso, recibos/recebimentos, relatórios/CSV/impressão, valores monetários, teclado, persistência e layouts móveis. Duas abas autenticadas observaram produtos novos; rascunho não salvo foi preservado e a atualização pendente retomou ao sair da edição. O navegador com Worker compilado também passou no login, navegação comercial e persistência financeira em D1 descartável.

### Meu Negócio — monitor de backup

Causa raiz: o schema aceitava identificadores dos outros aplicativos e inferia uma identidade incorreta pelo hostname. A validação passou a exigir literalmente `meu-negocio`. Não existe fallback para chave/identidade de outro aplicativo. A assinatura HMAC e as restrições de horário/replay continuam obrigatórias. Um heartbeat `ok` sem `lastSuccessAt` positivo é rejeitado, em vez de criar evidência de sucesso inexistente.

Arquivos alterados: `lib/operations.ts` e `tests/backup-monitor.test.ts`. O verificador existente `scripts/verify-operations.mjs` foi preservado e executado com a origem do próprio arquivo de configuração, sem disfarçar Meu Negócio como Ajudante.

Validação: 13 testes de regressão com banco SQLite em memória — identidade própria, assinatura incorreta, outros apps/desconhecido, sucesso sem evidência, tempos inválidos, backup ausente/falho/atrasado, monitor sem comunicação, recuperação e replay. O verificador executado no Worker real também passou com D1 descartável e pagamentos simulados. O heartbeat só atesta o relato assinado do agente; não comprova por si só que um backup remoto é restaurável. Nenhum backup ou restore de produção foi executado.

### Ajudante — verificador de autenticação reproduzível

Em instalação pnpm física nova, o import direto de Miniflare dependia de hoisting de uma dependência transitiva. `app/scripts/verify-auth.mjs` passou a resolver o runtime pelo Wrangler já declarado, conforme o padrão dos outros verificadores. Nenhuma dependência foi acrescentada. Saídas externas não previstas são bloqueadas.

O verificador completo passou: autenticação, papéis, CSRF, teste grátis, expiração, duplicidades, isolamento, preservação legada, fotos, versões, suspensão/reativação, alterações de credenciais, revogação e logout. Os incidentes emitidos durante casos de erro forçados são esperados nos dados fictícios.

### Central — execução local da suíte pública

`tests/run-static-browser.mjs` serve somente o export local, em porta loopback livre, e fornece os links locais esperados à suíte. `tests/browser.mjs` bloqueia navegação/requisições externas. O antivírus do computador injeta um script que não existe no HTML exportado; somente esse script conhecido recebe resposta JavaScript vazia no teste, sem desabilitar o antivírus ou modificar o produto.

Passaram catálogo, links, imagens, diálogo, teclado e layouts de 275–768 px/desktop; a suíte administrativa passou em logout com falha/sucesso e limitação de login. O serviço real de assets Miniflare retornou HTML com CSP `frame-ancestors 'none'` e `X-Frame-Options: DENY`; o navegador confirmou o bloqueio de iframe. As correções anteriores em `public/_headers` e `worker.ts` foram preservadas.

## C. Migrações: evidências e aplicação futura

Nenhum arquivo SQL de migração foi alterado nesta etapa. Foram lidos os arquivos completos e executados somente em bancos descartáveis. SQLite confirmou integridade e chaves estrangeiras; as integrações workerd exercitaram o comportamento D1 real.

| Aplicativo | Arquivo | Resultado local |
|---|---|---|
| Ajudante Elétrico | `app/drizzle/0014_private_registration.sql` | Cadastro antigo, workspace/versionamento, solicitações/códigos e snapshot de compra preservados; conclusão cria só uma conta/workspace |
| Finorya | `server/migrations/0014_private_registration.sql` | Mesmas garantias, incluindo conclusão real e processamento de pagamentos simulados |
| Meu Negócio | `server/migrations/0014_private_registration.sql` | Mesmas garantias, sem perda do workspace comercial/financeiro |
| Lingua Memory | `db/0010_session_auth_version.sql` | Conta, hash, epoch 7, aprendizado e áudio preservados; sessão antiga negada; novo login válido; troca de credencial incrementa para 8 e revoga autorizações antigas |

### 0014: compatibilidade e risco de convivência

É aditiva: cria staging e índices únicos parciais para solicitações verificadas, copia pendências e desafios, conserva tabelas antigas e mantém a unicidade de `app_users`. O trigger elimina a pendência antiga somente quando o pedido correspondente é concluído/expira no fluxo normal. O teste preservou outra compra ainda pendente e seu snapshot, além dos dados/versionamento do usuário existente.

**Versões antigas e novas escrevendo simultaneamente não são seguras.** A cópia inicial não replica automaticamente uma solicitação que um servidor antigo criar depois nas tabelas antigas. O teste registra explicitamente esse caso; não foi inventada compatibilidade bidirecional.

Plano futuro, sujeito a autorização de produção:

1. Resolver APP-01 e revisar novamente código, SQL, versões e inventário da instância correta. Confirmar identificadores D1 e lista de migrações já aplicadas, sem usar um nome de outro aplicativo.
2. Produzir backup completo D1, protegido/criptografado conforme o procedimento existente; verificar integridade e restauração em alvo descartável. Definir retenção e ponto de corte. Esta etapa não executou esse backup.
3. Abrir janela de manutenção para as operações afetadas: drenar escritores antigos de cadastro/checkout e coordenar webhooks/reconciliação. Não perder eventos de pagamento; manter retenção/reentrega e conciliação idempotente. Registrar pedidos/preferências em trânsito e responsabilidades antes do corte.
4. Aplicar a 0014 pelo histórico de migrações do banco correto **antes** de aceitar solicitações no código novo. Não repetir manualmente o SQL: ele não foi desenhado para reexecução cega. Publicar a versão correspondente de forma coordenada e impedir que a versão antiga volte a escrever.
5. Verificar contagens e relações de usuários/workspaces, pendências/códigos, reservas únicas e ordens/snapshots. Exercitar conta de teste aprovada e eventos de sandbox sem cobrança real. Acompanhar conflitos/erros e reconciliar eventos retidos antes de reabrir o fluxo.

Impacto: janela de indisponibilidade do cadastro/compra durante o corte; sessões existentes não são revogadas pela 0014. A duração depende do volume e da operação real, que não foi medida com dados de produção.

Recuperação: preferir correção adiante mantendo o schema aditivo. Reverter apenas o código deixa pendências novas invisíveis ao escritor antigo e pode romper pagamento/cadastro. Se recuperação do banco for indispensável, restaurar primeiro em instância isolada, validar e reconciliar todas as escritas/eventos posteriores ao backup. Troca da instância e tratamento das ordens exigem aprovação explícita; nunca restaurar cegamente sobre produção nem apagar tabelas novas como suposto rollback.

### 0010: compatibilidade, sessões e credenciais

Adiciona `sessions.auth_version` com default `-1`, revoga sessões legadas e adiciona `users.auth_change_id`. Não altera a senha nem redefine `users.auth_version`. A conta sintética com versão 7 permaneceu na versão 7 após a migração; novo login vinculou essa versão. Troca de senha/alteração pela Central avançou para 8 e invalidou sessão, recuperação e inscrições antigas conforme a política implementada anteriormente.

`tests/session-migration.test.ts` cobre o esquema SQLite antigo e o esquema com a coluna D1 anterior; `scripts/verify-security-runtime.mjs` faz a verificação adicional no workerd com áudio e aprendizado legados. A suíte de recuperação confirma consumo de código, nova senha, revogação e rejeição de replay. Os testes existentes de concorrência e transação continuam aprovados.

Plano futuro: backup consistente de SQLite ou export D1 completo, além de áudios locais/R2 e configurações/chaves necessárias, sem incluí-los em relatório. Validar a recuperação isolada. Parar escritores antigos de autenticação, aplicar a migração no backend correto e iniciar somente a versão com vínculo de epoch. O inicializador SQLite pode aplicar a migração ao subir; o backup deve preceder essa inicialização. D1 usa seu controle de migrações. Não expor Node diretamente à internet sem fonte confiável de IP no proxy, conforme a limitação já documentada em LM-03.

Impacto: usuários com sessões anteriores precisarão entrar novamente. Comunicar esse encerramento antes do corte. Validar login/refresh, senha/recuperação, Central com HMAC e nonce, duas redes de teste, dados de aprendizado e streaming privado. Convivência com versão antiga é insegura: ela não verifica o novo vínculo e pode criar sessões sem epoch. Reverter somente o binário restaura essa fragilidade. Preferir correção adiante; qualquer restauração exige alvo isolado, reconciliação e autorização, preservando gravações e progresso posteriores ao backup.

## D. Estado das sete vulnerabilidades originais

| ID | Estado | Evidência e limite |
|---|---|---|
| DEP-01 | CORRIGIDA LOCALMENTE nos caminhos de execução validados | Proveniência, resolução, codecs compilados e roundtrip RSC; limite do Next inativo do Ajudante descrito abaixo |
| LM-01 | CORRIGIDA LOCALMENTE | Revogação transacional/CAS em SQLite/D1, Central e recuperação; falha forçada reverte a transação |
| LM-02 | CORRIGIDA LOCALMENTE | Sessão vinculada ao epoch; concorrência, refresh e sessões legadas testados |
| LM-03 | CORRIGIDA LOCALMENTE no Worker | Separação de cotas por rede/ação/conta/token; cabeçalho forjado ignorado; publicação Node exige proxy confiável |
| APP-01 | PARCIALMENTE CORRIGIDA | Mitigação antes da confirmação preservada; inferência após confirmação continua confirmada; publicação bloqueada |
| LM-04 | CORRIGIDA LOCALMENTE | Leitura limitada em streaming, cancelamento e HTTP 413; autenticação/origem/HMAC/nonce preservados |
| CS-01 | CORRIGIDA LOCALMENTE | Proteção no serviço de assets e fallback Worker; iframe bloqueado no Chrome; versão pública não verificada nesta etapa |

### DEP-01: versões, cadeia e artefatos

Não houve alteração de `package.json`, `package-lock.json` ou `pnpm-lock.yaml` nesta etapa. Os hashes coincidem com o início da estabilização. Nenhuma nova dependência foi necessária.

| Aplicativos | React / DOM / RSC direto | Plugin RSC | Next | Vinext |
|---|---|---|---|---|
| Ajudante | 19.2.9 | 0.5.38 | 16.3.8, ferramenta inativa no caminho validado | 1.0.0-beta.5 |
| Finorya e Meu Negócio | 19.2.9 | 0.5.38 | 16.4.1 | 1.0.0-beta.5 |
| Lingua | 19.2.9 | 0.5.38 | 16.4.1 | 1.0.1 |
| Central | React/DOM 19.2.6; sem servidor RSC publicado no export | Não aplicável | 16.3.4, export estático | Não aplicável |

O aviso oficial do [React GHSA-xqc2-xf4c-x3h3](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3) identifica as correções 19.2.9/19.3.1. O [plugin-rsc 0.5.38](https://github.com/vitejs/vite-plugin-react/releases/tag/plugin-rsc@0.5.38) distribui codec 19.3.1; o [aviso Next](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) identifica 16.4.1 para sua cópia compilada. As fontes foram consultadas para verificar a DEP-01, sem enviar código privado.

Nos quatro apps com servidor RSC, `scripts/verify-rsc-provenance.mjs` comparou SHA-512 do arquivo oficial público com o registro/lockfile e SHA-256 dos codecs instalados com o arquivo: 6 codecs diretos e 6 do plugin por app; nos três Next atualizados, mais 12 codecs compilados webpack/turbopack. A resolução a partir de Vinext aponta para RSC 19.2.9; o alias do plugin foi inspecionado. Os bundles finais retêm `decodeReply` com os controles de buffers redimensionáveis/destacados. `tests/rsc-transport.mjs` aprovou o roundtrip de texto inerte com arrays tipados separados nas cópias aplicáveis. Não foi usado payload de exploração.

Nenhuma cópia vulnerável foi identificada nos caminhos RSC validados. O Next 16.3.8 do Ajudante **não foi corrigido para eventual ativação como servidor Next**; ativá-lo exige atualização e nova validação. A conclusão da Central vale para a arquitetura estática efetivamente validada; não comprova a segurança de uma futura execução de servidor Next. Não se realizou uma auditoria universal de advisories de todas as outras bibliotecas.

## E. Verificações, falhas intermediárias e limites

Ambiente: Windows, Node 24.19.0, pnpm 11.25.0. Foram criadas cópias físicas novas em pasta temporária, sem `.env`, `.dev.vars` ou bancos reais. O processo recebeu somente variáveis de sistema necessárias, telemetry desabilitada e caminhos de dados descartáveis. Identidades/chaves usadas pelos testes são fictícias. Saídas de integrações foram simuladas ou bloqueadas; nenhum provedor recebeu e-mail, notificação ou transação real.

| Verificação | Resultado final | Observação |
|---|---|---|
| Instalação pnpm congelada | APROVADO nos cinco | Instalação física nova, `--frozen-lockfile --ignore-scripts --offline` |
| Instalação npm congelada do Ajudante | APROVADO | `npm ci --ignore-scripts --no-audit --no-fund` em cópia separada; lock original preservado |
| Typecheck | APROVADO nos cinco | Inclusive testes de migração e componentes novos |
| Lint | APROVADO nos cinco | Lingua tem um aviso preexistente de import não usado em teste; nenhuma regra desabilitada |
| Vitest / node:test | APROVADO, 737 testes | Contagem inclui os novos testes de cadastro/migração/monitor e o teste estático da Central |
| Next de produção | APROVADO em Finorya, Lingua, Meu Negócio e Central | Ajudante usa Vinext; seu Next não foi executado |
| Vinext/Cloudflare | APROVADO nos quatro apps com esse runtime | Worker compilado validado com workerd; Central passou em export estático e assets |
| Navegador histórico | APROVADO nos cinco | Meu Negócio inclui os 36 roteiros comerciais, sem ignorar falhas |
| Segurança / operações / notificações / pagamentos | APROVADO nos verificadores locais aplicáveis | Conta/D1/R2 descartáveis e serviços simulados |
| RSC: proveniência, resolução, bundle e transporte | APROVADO nos quatro servidores | Next apenas nos três atualizados |
| Migrações com registros antigos | APROVADO nos quatro | Escritores de versões antigas/novas exigem corte coordenado |
| Serviços publicados e provedores reais | NÃO EXECUTADO / dependente de autorização externa | Não é falha do teste local; não há comprovação de entrega, configuração ou versão pública |
| Deploy e migração de produção | NÃO EXECUTADO | Expressamente fora da autorização |

Falhas intermediárias resolvidas: seletores históricos e colisão de porta entre runners; captura de interação que afetava três formulários comerciais; acesso a ref durante render apontado pelo lint; dependência transitiva Miniflare sem hoisting; fixture de navegador que esperava mudança de URL em login cujo contrato é atualizar a sessão na mesma tela; export da Central precisa do comando próprio, não apenas `next build`. A tentativa npm completamente offline não encontrou um pacote no cache; a instalação com registro público passou. Nenhuma dessas falhas foi escondida ou contada como aprovada antes de ser resolvida.

Foi usado o comando de lint próprio do Ajudante, que exclui `dist`/`.next`. Uma execução direta sem esses ignores examinou código gerado e produziu ruído; esse resultado não foi usado como diagnóstico do fonte. Avisos React de chaves em listas apareceram em telas comerciais antigas durante alguns roteiros; não houve erro de página nem falha funcional associada, e nenhuma refatoração ampla foi feita para alterar esse comportamento preexistente.

Evidências locais: `C:/Users/Jean_DEV/AppData/Local/Temp/stabilization-20261023-84853a5cef`, subpastas 0=Ajudante, 1=Finorya, 2=Lingua, 3=Meu Negócio, 4=Central. Contêm estado inicial, hashes, fontes anteriores não sensíveis, diffs desta etapa e logs. Não são backup de produção e não devem ser publicadas com o produto. Os testes e este relatório permanecem nos projetos.

Logs finais principais: `unit-final.log` nas cinco pastas; `typecheck-final.log` (Meu Negócio também `typecheck-final2.log`); `0/lint-final.log`, `3/lint-final.log` e `lint.log` nos demais; `1/browser-final2.log`; `3/browser-final4.log`, `3/security-browser-final.log` e `3/commercial-final4.log`; `2/browser.log` e `2/worker-security.log`; `4/landing-browser.log`, `4/admin-browser.log` e `4/static-security.log`. Os dois testes adicionais de navegador com Worker estão em `1/worker-browser-final3.log` e `3/worker-browser-final3.log`. O bundle final do Meu Negócio foi reconstruído e revalidado em `next-build-final2.log`, `vinext-build-final2.log` e `rsc-bundle-final.log`; as integrações finais estão em `operations-worker.log`/`verify-operations-final.log`, `payments-worker-final.log` e `verify-notification-runtime-final.log`, conforme o app. A comparação dos artefatos incorporados está em `artifacts-verified.json`.

Para repetir com segurança, preparar outra cópia sem arquivos de ambiente, bancos, áudios ou caches reais e filtrar o ambiente do processo como em `run-clean.mjs` da pasta de evidências. Instalar com os lockfiles originais e não fornecer credenciais reais. Nessa cópia, executar os comandos existentes de typecheck/test/build, `node tests/run-browser.mjs` e `node tests/run-browser.mjs --security` em Finorya/Meu Negócio; acrescentar `--commercial` no Meu Negócio. Executar `node tests/worker-browser.mjs` no Finorya e `node tests/worker-runtime.mjs` no Meu Negócio após o build Cloudflare. Na Central, usar seu build Cloudflare antes de `node tests/run-static-browser.mjs` e `node --test tests/static-security.test.mjs`; executar também as suítes Worker/administrativa existentes. Os roteiros de provedor real, backup e migração remota continuam fora desta repetição. Para RSC, usar os verificadores existentes com `--next` nos três Next atualizados, omitindo essa opção no Ajudante.

## F. Preparação para publicação futura

- [x] Estado Git inicial e arquivos não rastreados inventariados; modificações anteriores preservadas.
- [x] Testes, typecheck, lint, instalações congeladas e builds locais executados.
- [x] Migrações testadas com dados fictícios antigos, incluindo riscos de convivência e recuperação.
- [x] RSC e correções LM/CS revalidados no caminho aplicável.
- [x] Nenhuma dependência nova; manifests/lockfiles/configurações de produção preservados nesta etapa.
- [ ] Resolver e aprovar política APP-01; **impedimento conhecido para publicação**.
- [ ] Revisar diff completo, incluindo alterações que já existiam antes desta etapa, e aprovar a versão final.
- [ ] Obter autorização específica de publicação/migração e confirmar alvo, backup restaurável e janela de manutenção.
- [ ] Conferir secrets/bindings, armazenamento, monitoramento e integrações no provedor sem expor valores. Não rotacionar chaves de criptografia por rotina; preservar acesso aos dados já protegidos.
- [ ] Aplicar 0014 nos três apps e 0010 no Lingua de forma coordenada com o código, conforme a seção C.
- [ ] Publicar gradualmente somente após remover o bloqueio; validar um app antes do seguinte. Central deve distribuir `out/_headers` junto com os assets e o Worker correspondente.
- [ ] Conferir HTTPS, headers de HTML/assets, login/logout/revogação, isolamento, cadastro aprovado, pagamentos de sandbox, notificações de teste autorizadas, áudios e filas. Verificar o monitor com evidência real de backup; não interpretar heartbeat como ensaio de restore.
- [ ] Monitorar erros/conflitos e reconciliar eventos; manter plano de correção adiante e recuperação isolada.

Nenhum dos aplicativos está liberado para publicação por este relatório. Sucesso local não substitui autorização ou validação da versão publicada.

## G. Integridade

Nenhum deploy, migração de produção, alteração de dado real, commit, push ou operação destrutiva foi executado. Não houve reset, clean, descarte de arquivos ou rotação de credenciais. Os testes não abriram bancos de usuário/provedor real. Os snapshots/diffs anteriores foram preservados; todos os arquivos de fonte inventariados no início continuam presentes. Alterações conjuntas foram pontuais sobre o conteúdo existente, sem substituí-lo pelo HEAD.

Os arquivos novos/linhas acrescentadas foram revisados para credenciais e depuração insegura; só fixtures explicitamente sintéticas permanecem nos testes. Não foram copiados segredos para este relatório. A revisão por padrões de segredo é uma verificação adicional, não prova absoluta de ausência de qualquer formato possível de credencial.

A comparação das fontes executadas com o checkout confirmou correspondência; nos roteiros formatados depois da execução, a normalização pelo mesmo Prettier produziu conteúdo idêntico (`source-tested-verified.log`). O `git diff --check` contra HEAD apontou whitespace **preexistente** em `workspace.tsx` dos quatro apps e uma linha vazia final em `Meu Negócio/app/landing.css`. Os hashes desses arquivos coincidem com o início desta etapa; não foram reformados para esconder alterações anteriores. Essa observação editorial não representa teste funcional reprovado nem vulnerabilidade nova. A checagem incremental das alterações desta etapa é registrada separadamente em `stage-diff-check.log`.

Os artefatos locais validados são separados de publicação. Quando substituídos no checkout, os diretórios de build anteriores são preservados integralmente na pasta de evidências. Não foi removida funcionalidade legítima nem alterado preço/regra comercial para fazer teste passar.

## H. Arquivos desta etapa

A lista abaixo compara com o início desta estabilização, e não com HEAD. Os relatórios de segurança anteriores continuam sendo histórico da etapa precedente.

### Inventário — Ajudante Elétrico

Raiz: `C:/Dev/Projetos/Ajudante Elétrico`.

- Novo: [app/tests/registration-migration.test.ts](<C:/Dev/Projetos/Ajudante Elétrico/app/tests/registration-migration.test.ts>).
- Alterado: [app/scripts/verify-auth.mjs](<C:/Dev/Projetos/Ajudante Elétrico/app/scripts/verify-auth.mjs>).
- Alterado: [app/tests/registration-security.test.ts](<C:/Dev/Projetos/Ajudante Elétrico/app/tests/registration-security.test.ts>).
- Novo: [docs/ESTABILIZACAO-2026-10-23.md](<C:/Dev/Projetos/Ajudante Elétrico/docs/ESTABILIZACAO-2026-10-23.md>).
- Alterado: [docs/CORRECOES-SEGURANCA-2026-10-23.md](<C:/Dev/Projetos/Ajudante Elétrico/docs/CORRECOES-SEGURANCA-2026-10-23.md>).

### Inventário — Finorya

Raiz: `C:/Dev/Projetos/Finorya`.

- Alterado: [components/calculator.tsx](<C:/Dev/Projetos/Finorya/components/calculator.tsx>).
- Alterado: [components/notification-settings.tsx](<C:/Dev/Projetos/Finorya/components/notification-settings.tsx>).
- Alterado: [components/reports.tsx](<C:/Dev/Projetos/Finorya/components/reports.tsx>).
- Alterado: [components/settings.tsx](<C:/Dev/Projetos/Finorya/components/settings.tsx>).
- Novo: [docs/ESTABILIZACAO-2026-10-23.md](<C:/Dev/Projetos/Finorya/docs/ESTABILIZACAO-2026-10-23.md>).
- Alterado: [docs/CORRECOES-SEGURANCA-2026-10-23.md](<C:/Dev/Projetos/Finorya/docs/CORRECOES-SEGURANCA-2026-10-23.md>).
- Alterado: [lib/workspace-sync.ts](<C:/Dev/Projetos/Finorya/lib/workspace-sync.ts>).
- Novo: [tests/registration-migration.test.ts](<C:/Dev/Projetos/Finorya/tests/registration-migration.test.ts>).
- Novo: [tests/worker-browser.mjs](<C:/Dev/Projetos/Finorya/tests/worker-browser.mjs>).
- Alterado: [tests/browser.mjs](<C:/Dev/Projetos/Finorya/tests/browser.mjs>).
- Alterado: [tests/registration-security.test.ts](<C:/Dev/Projetos/Finorya/tests/registration-security.test.ts>).
- Alterado: [tests/run-browser.mjs](<C:/Dev/Projetos/Finorya/tests/run-browser.mjs>).

### Inventário — Lingua Memory

Raiz: `C:/Dev/Projetos/Lingua Memory`.

- Novo: [docs/ESTABILIZACAO-2026-10-23.md](<C:/Dev/Projetos/Lingua Memory/docs/ESTABILIZACAO-2026-10-23.md>).
- Alterado: [docs/CORRECOES-SEGURANCA-2026-10-23.md](<C:/Dev/Projetos/Lingua Memory/docs/CORRECOES-SEGURANCA-2026-10-23.md>).
- Alterado: [scripts/verify-security-runtime.mjs](<C:/Dev/Projetos/Lingua Memory/scripts/verify-security-runtime.mjs>).
- Novo: [tests/session-migration.test.ts](<C:/Dev/Projetos/Lingua Memory/tests/session-migration.test.ts>).

### Inventário — Meu Negócio

Raiz: `C:/Dev/Projetos/Meu Negócio`.

- Novo: [components/use-workspace-draft.ts](<C:/Dev/Projetos/Meu Negócio/components/use-workspace-draft.ts>).
- Alterado: [components/business-panel.tsx](<C:/Dev/Projetos/Meu Negócio/components/business-panel.tsx>).
- Alterado: [components/calculator.tsx](<C:/Dev/Projetos/Meu Negócio/components/calculator.tsx>).
- Alterado: [components/commercial-reports.tsx](<C:/Dev/Projetos/Meu Negócio/components/commercial-reports.tsx>).
- Alterado: [components/contacts-panel.tsx](<C:/Dev/Projetos/Meu Negócio/components/contacts-panel.tsx>).
- Alterado: [components/notification-settings.tsx](<C:/Dev/Projetos/Meu Negócio/components/notification-settings.tsx>).
- Alterado: [components/products-panel.tsx](<C:/Dev/Projetos/Meu Negócio/components/products-panel.tsx>).
- Alterado: [components/reports.tsx](<C:/Dev/Projetos/Meu Negócio/components/reports.tsx>).
- Alterado: [components/sales-panel.tsx](<C:/Dev/Projetos/Meu Negócio/components/sales-panel.tsx>).
- Novo: [docs/ESTABILIZACAO-2026-10-23.md](<C:/Dev/Projetos/Meu Negócio/docs/ESTABILIZACAO-2026-10-23.md>).
- Alterado: [docs/CORRECOES-SEGURANCA-2026-10-23.md](<C:/Dev/Projetos/Meu Negócio/docs/CORRECOES-SEGURANCA-2026-10-23.md>).
- Alterado: [lib/operations.ts](<C:/Dev/Projetos/Meu Negócio/lib/operations.ts>).
- Alterado: [lib/workspace-sync.ts](<C:/Dev/Projetos/Meu Negócio/lib/workspace-sync.ts>).
- Novo: [tests/backup-monitor.test.ts](<C:/Dev/Projetos/Meu Negócio/tests/backup-monitor.test.ts>).
- Novo: [tests/browser-environment.mjs](<C:/Dev/Projetos/Meu Negócio/tests/browser-environment.mjs>).
- Novo: [tests/registration-migration.test.ts](<C:/Dev/Projetos/Meu Negócio/tests/registration-migration.test.ts>).
- Novo: [tests/worker-runtime.mjs](<C:/Dev/Projetos/Meu Negócio/tests/worker-runtime.mjs>).
- Alterado: [tests/browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/browser.mjs>).
- Alterado: [tests/business-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/business-browser.mjs>).
- Alterado: [tests/business-controls-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/business-controls-browser.mjs>).
- Alterado: [tests/business-navigation-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/business-navigation-browser.mjs>).
- Alterado: [tests/business-orders-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/business-orders-browser.mjs>).
- Alterado: [tests/cep-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/cep-browser.mjs>).
- Alterado: [tests/commercial-activity-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/commercial-activity-browser.mjs>).
- Alterado: [tests/commercial-csv-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/commercial-csv-browser.mjs>).
- Alterado: [tests/commercial-print-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/commercial-print-browser.mjs>).
- Alterado: [tests/commercial-sale-details-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/commercial-sale-details-browser.mjs>).
- Alterado: [tests/credit-installments-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/credit-installments-browser.mjs>).
- Alterado: [tests/customer-actions-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/customer-actions-browser.mjs>).
- Alterado: [tests/customers-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/customers-browser.mjs>).
- Alterado: [tests/delivery-mobile-actions-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/delivery-mobile-actions-browser.mjs>).
- Alterado: [tests/delivery-overdue-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/delivery-overdue-browser.mjs>).
- Alterado: [tests/delivery-payment-filter-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/delivery-payment-filter-browser.mjs>).
- Alterado: [tests/missing-sale-cost-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/missing-sale-cost-browser.mjs>).
- Alterado: [tests/money-input-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/money-input-browser.mjs>).
- Alterado: [tests/out-of-stock-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/out-of-stock-browser.mjs>).
- Alterado: [tests/products-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/products-browser.mjs>).
- Alterado: [tests/public-auth.mjs](<C:/Dev/Projetos/Meu Negócio/tests/public-auth.mjs>).
- Alterado: [tests/receipts-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/receipts-browser.mjs>).
- Alterado: [tests/registration-security.test.ts](<C:/Dev/Projetos/Meu Negócio/tests/registration-security.test.ts>).
- Alterado: [tests/reset-workspace-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/reset-workspace-browser.mjs>).
- Alterado: [tests/run-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/run-browser.mjs>).
- Alterado: [tests/sale-cancellation-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sale-cancellation-browser.mjs>).
- Alterado: [tests/sale-details-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sale-details-browser.mjs>).
- Alterado: [tests/sale-registration-time-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sale-registration-time-browser.mjs>).
- Alterado: [tests/sale-success-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sale-success-browser.mjs>).
- Alterado: [tests/sales-history-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sales-history-browser.mjs>).
- Alterado: [tests/sales-status-filter-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sales-status-filter-browser.mjs>).
- Alterado: [tests/sales-terms-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/sales-terms-browser.mjs>).
- Alterado: [tests/security-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/security-browser.mjs>).
- Alterado: [tests/stock-independent-forms-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/stock-independent-forms-browser.mjs>).
- Alterado: [tests/stock-minimum-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/stock-minimum-browser.mjs>).
- Alterado: [tests/stock-overview-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/stock-overview-browser.mjs>).
- Alterado: [tests/stock-product-cost-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/stock-product-cost-browser.mjs>).
- Alterado: [tests/stock-reasons-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/stock-reasons-browser.mjs>).
- Alterado: [tests/stock-status-sort-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/stock-status-sort-browser.mjs>).
- Alterado: [tests/supplier-document-validation-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/supplier-document-validation-browser.mjs>).
- Alterado: [tests/suppliers-browser.mjs](<C:/Dev/Projetos/Meu Negócio/tests/suppliers-browser.mjs>).

### Inventário — Central Simples

Raiz: `C:/Dev/Projetos/Central Simples`.

- Novo: [docs/ESTABILIZACAO-2026-10-23.md](<C:/Dev/Projetos/Central Simples/docs/ESTABILIZACAO-2026-10-23.md>).
- Novo: [docs/ESTABILIZACAO-SEGURANCA-2026-10-23.md](<C:/Dev/Projetos/Central Simples/docs/ESTABILIZACAO-SEGURANCA-2026-10-23.md>).
- Alterado: [docs/CORRECOES-SEGURANCA-2026-10-23.md](<C:/Dev/Projetos/Central Simples/docs/CORRECOES-SEGURANCA-2026-10-23.md>).
- Novo: [tests/run-static-browser.mjs](<C:/Dev/Projetos/Central Simples/tests/run-static-browser.mjs>).
- Alterado: [tests/browser.mjs](<C:/Dev/Projetos/Central Simples/tests/browser.mjs>).

### Artefatos preparados

As cópias locais verificadas foram incorporadas ao checkout: `app/dist` no Ajudante; `dist` e `.next` em Finorya/Lingua/Meu Negócio; `out` e `.next` na Central. Os diretórios anteriores foram movidos, sem exclusão, para `previous-artifacts` de cada app na pasta temporária de evidências. Uma comparação SHA-256 por arquivo confirmou que os artefatos incorporados são idênticos aos builds testados. Isso não é deploy.
