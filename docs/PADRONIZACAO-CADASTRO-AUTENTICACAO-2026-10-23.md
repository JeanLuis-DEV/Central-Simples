# Relatório consolidado — padronização de cadastro e autenticação

Data: 23/10/2026. Escopo autorizado: cinco aplicativos. Execução local com cópias isoladas, dados sintéticos e provedores simulados.

## A. Resultado por aplicativo

| Aplicativo | Migração nova | Testes unitários | Validação final |
|---|---|---:|---|
| Ajudante Elétrico | app/drizzle/0015_account_identity.sql | 84 | PASSOU: Vinext/Cloudflare, typecheck, ESLint e validações de navegador/Worker aplicáveis |
| Finorya | server/migrations/0015_account_identity.sql | 205 | PASSOU: Next.js e Vinext/Cloudflare, typecheck, ESLint e validações de navegador/Worker aplicáveis |
| Lingua Memory | db/0011_verified_registration.sql | 161 | PASSOU: Next.js e Vinext/Cloudflare, typecheck, ESLint e validações de navegador/Worker aplicáveis |
| Meu Negócio | server/migrations/0015_account_identity.sql | 353 | PASSOU: Next.js e Vinext/Cloudflare, typecheck, ESLint e validações de navegador/Worker aplicáveis |
| Central Simples | Sem migração de conta | 22 | PASSOU: Next.js estático, typecheck, ESLint e validações de navegador/Worker aplicáveis |

Total: **825 testes unitários aprovados**. Além deles, passaram as suítes de navegador e Workers, verificações de segurança e construções listadas nos relatórios individuais:

- [Ajudante Elétrico](../../Ajudante Elétrico/app/docs/PADRONIZACAO-CADASTRO-AUTENTICACAO-2026-10-23.md)
- [Finorya](../../Finorya/docs/PADRONIZACAO-CADASTRO-AUTENTICACAO-2026-10-23.md)
- [Lingua Memory](<../../Lingua Memory/docs/PADRONIZACAO-CADASTRO-AUTENTICACAO-2026-10-23.md>)
- [Meu Negócio](<../../Meu Negócio/docs/PADRONIZACAO-CADASTRO-AUTENTICACAO-2026-10-23.md>)
- [Central Simples](./PADRONIZACAO-CADASTRO-AUTENTICACAO-2026-10-23.md)

Quatro aplicativos têm criação pública de conta; a Central continua sem cadastro público. As identidades novas usam Nome, E-mail, Login e Senha. Login e e-mail são campos separados. Novos logins não podem conter `@`, nem usar identificadores administrativos reservados. Acesso antigo por logins já válidos, inclusive aliases legados por e-mail, foi mantido.

O e-mail recebe código de confirmação antes da ativação. Códigos expiram, são de uso único, têm limite de tentativas e reenvios, controles de concorrência e rate limiting. Recuperação usa e-mail confirmado; mudança de senha continua revogando sessões antigas. No Lingua Memory, o usuário entra manualmente depois de concluir cadastro e o consentimento legal já existente permanece obrigatório.

CPF e telefone saíram somente da identidade e cadastro inicial de conta. Foram preservados nos fluxos comerciais de clientes/fornecedores e em colunas de legado. Nenhum plano, preço ou duração de licença mudou. A Central não recebeu fluxo público novo; sua interface mantém Lingua Memory como integração pendente, embora a identidade administrativa e a ponte de e-mail/login distintos tenham sido preparadas e testadas com fixtures.

## B. Segurança e APP-01

APP-01 está **PARCIALMENTE CORRIGIDA LOCALMENTE**. A solicitação inicial usa a mesma resposta e fluxo antes da prova do e-mail, sem busca por conta. CPF e telefone não participam do cadastro. Novos logins não aceitam e-mail em formato `@`. Conflitos verificados retornam mensagem genérica. Cadastros antigos pendentes também passam pela nova validação antes de criar conta.

Depois de confirmar seu próprio e-mail, ainda é possível inferir se um nome de login tentado está ocupado. A mensagem revela somente o conflito genérico. Como um proprietário poderia ter escolhido um número de telefone como login, sobra possibilidade teórica de correlacionar a disponibilidade desse nome com um telefone conhecido; nenhum dado de telefone é consultado ou devolvido, e os testes não demonstraram extração de telefone. Como a disponibilidade de login e a publicação bloqueada ainda precisam de decisão de produto, **não considerar APP-01 integralmente encerrada e manter a publicação bloqueada**.

DEP-01 e verificadores LM-01–LM-04 e CS-01 permaneceram aprovados em suas arquiteturas aplicáveis. Os quatro caminhos RSC ativos usaram React/React DOM/RSC 19.2.9 e plugin 0.5.38, com teste de proveniência e transporte dos builds; a Central é estática e não usa um servidor RSC ativo. Nenhuma credencial foi exibida. Fluxos de e-mail, Mercado Pago e outras saídas foram simulados, com zero chamadas reais.

## C. Banco de dados e migrações

Ajudante Elétrico, Finorya e Meu Negócio ganharam migração 0015, que apaga somente índices exclusivos de CPF/telefone. Colunas e dados históricos permanecem intactos; valores de contato antigos não são copiados para novas contas. O Lingua Memory ganhou migração 0011 com tabela nova de cadastros pendentes e índice de login case-insensitive, incluindo a chave legada de e-mail para contas sem username. A migração não remove usuários, registros ou tabelas.

As migrações foram verificadas em bases descartáveis; nenhuma migração foi aplicada a uma base original ou de produção. A análise de estado local foi somente leitura em cópias estáveis de bancos SQLite e WAL. Os históricos disponíveis indicavam: Finorya e Meu Negócio em 0001, 0002, 0003, 0005, 0006 e 0007; Lingua Memory em 1–4; Ajudante sem tabela de histórico nos arquivos inspecionados. A migração 0014 não aparecia nos históricos das cópias locais encontradas. Isso não comprova o estado de alvos remotos ou de qualquer banco não inspecionado. Os agregados de preflight das cópias não identificaram colisões de login nas contas presentes.

Antes de habilitar qualquer versão em base com dados, verificar o registro real das migrações, aplicar todas as etapas pendentes em sequência após backup verificável e reproduzir em banco descartável. A ordem de 0014, 0015 e 0011 precisa ser conferida por aplicativo. Colunas antigas de CPF/telefone podem ser removidas somente numa migração futura aprovada e após plano de compatibilidade.

## D. Testes e limitações

As cinco instalações offline/frozen foram verificadas. Typecheck, ESLint e builds aplicáveis passaram. Foram executadas 825 verificações unitárias, fluxos browser, Worker com D1 descartável, segurança, recuperação, isolamento, pagamentos simulados, notificações e RSC. A cobertura exata e os cenários por aplicativo estão nos relatórios acima. Um primeiro resultado de typecheck do Finorya e Meu Negócio leu arquivos gerados de rota enquanto a suíte anterior ainda usava o diretório isolado; depois os testes foram serializados, os builds foram reconstruídos e os dois typechecks finais passaram. A primeira execução de navegador Finorya antecipou um backup antes do salvamento do nome acabar; a suíte passou após esperar a resposta do salvamento.

Não foram executados testes com contas reais, Gmail/Mercado Pago reais, banco remoto, deploy, migração de produção ou credencial real. O sucesso local não comprova a configuração de provedor nem o estado remoto.

## E. Arquivos modificados e baseline

Os relatórios individuais listam cada arquivo modificado ou criado por hash a partir do estado inicial. Em resumo: Ajudante alterou 15 arquivos e criou 4; Finorya 20 e 3; Lingua Memory 26 e 8; Meu Negócio 19 e 3; Central Simples 3 e 0. Os quatro arquivos de migração e os componentes/rotas/testes da padronização estão enumerados nos relatórios por aplicativo. Os arquivos de dependência, lockfiles, configurações de produção e segredos não foram modificados.

O inventário comparou Git rastreado e não rastreado contra os hashes de início e não encontrou arquivos preexistentes ausentes. Artefatos de produção existentes não foram substituídos; os builds foram feitos nas cópias isoladas.

## F. Estado final

- Nenhum deploy, commit ou push foi feito.
- Nenhum banco original ou de produção foi modificado; nenhuma tabela, coluna ou linha foi apagada.
- Credenciais, integrações de provedor e regras comerciais foram preservadas.
- APP-01 continua com a publicação bloqueada, aguardando revisão da política de disponibilidade do login.
- Aguardando revisão humana antes de qualquer publicação.
