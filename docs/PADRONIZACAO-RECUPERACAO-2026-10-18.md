# Padronização das telas de recuperação — 18/10/2026

Aplicados aos quatro apps os mesmos elementos de apresentação dos logins: cartão com largura máxima 630 px e altura mínima 661 px, padding 28 px, marca em uma linha, título 30 px, campos/botões 53 px e visual responsivo. As etapas com mais campos crescem e usam rolagem normal, sem cortar dados. CSS app/recovery-layout.css idêntico nos quatro, reutilizando app/login-layout.css sem alterá-lo. Overrides limitados às classes unified-recovery-card/unified-login-page, sem mudar login, trial ou workspace.

Finorya, Meu Negócio e Ajudante: app/password-recovery.tsx passa a usar as classes compartilhadas em identificação, confirmação do código, nova senha, expiração, sucesso e suporte. Preservados CPF/e-mail/telefone, verificações, reenvio/limites, encerramento de sessões, regras de senha, suporte e consentimento. Corrigido ícone de letra do Meu Negócio para M. Nenhum endpoint, cookie, payload ou handler de segurança foi alterado.

Lingua Memory: components/account-recovery.tsx agora exibe a marca dentro do mesmo cartão. Mantida a recuperação manual pelo suporte e o aviso de que não altera a senha automaticamente. Cadastro, login e links institucionais preservados. Campos de suporte, checkbox e envio com consentimento continuam existentes. Inputs checkbox têm regra específica de 18x18, sem herdar a altura dos campos de texto.

Arquivos por app: app/recovery-layout.css e app/password-recovery.tsx nos três apps pagos; app/recovery-layout.css e components/account-recovery.tsx no Lingua Memory. Relatório replicado em docs/PADRONIZACAO-RECUPERACAO-2026-10-18.md.

Validações: TypeScript, ESLint e quatro builds Cloudflare aprovados; diff-check aprovado. Harness output/verify-unified-recovery.cjs na Central: 1440/390/320 px sem overflow, largura 630, campo 53, título 30, checkbox 18. Três apps pagos: identificação, reenvio, código inválido/válido, nova senha, conclusão, sessão de recuperação expirada e suporte com falha/sucesso. Lingua: tela inicial e suporte com falha/sucesso. Zero erros JS após validação completa. Todos os envios e alterações de senha foram simulados exclusivamente em localhost; nenhum e-mail real enviado e nenhuma senha de produção alterada. Relatório output/unified-recovery-report.json.

O servidor Next de desenvolvimento do Lingua retornou erro de compilação de cloudflare:workers, incompatível com aquele runner. A verificação foi concluída no Worker de produção compilado, iniciado via Wrangler --local em 127.0.0.1:5205 com APIs interceptadas no navegador, sem acesso remoto ao banco. O processo temporário foi encerrado após o teste. A configuração do projeto e o servidor existente não foram modificados.

Conferência real de produção: quatro telas iniciais e links para suporte sem preenchimento/submissão. Medidas confirmadas em 630 px, altura mínima 661 e título 30; campos 53 nos apps com recuperação por código. Capturas output/{finorya,meunegocio,ajudante,lingua}-unified-recovery-online.png na Central. Entrega de e-mail e mudança real de senha não foram executadas nem atribuídas aos testes simulados.

Publicação --keep-vars, sem migrações. Logs output/unified-recovery-build.log e output/unified-recovery-deploy.log em cada app. Versões:
- C:\Dev\Projetos\Finorya : Current Version ID: 49ad257e-9aa5-4e47-817a-c2494446e9aa
- C:\Dev\Projetos\Meu Negócio : Current Version ID: 33967e40-d148-4e10-b128-f53fbc8da818
- C:\Dev\Projetos\Ajudante Elétrico\app : Current Version ID: 223fda42-1946-43d9-b779-244250c08c07
- C:\Dev\Projetos\Lingua Memory : Current Version ID: 6ed5cec2-f19a-4897-b96d-aa22734cdc0d