# Padronização das telas de teste grátis — 18/10/2026

Escopo: Finorya, Meu Negócio e Ajudante Elétrico. TrialRegistration reutiliza o contrato de login em app/login-layout.css por meio de app/trial-layout.css (idêntico nos três repositórios). Cartão de largura máxima 630 px, altura mínima 661 px, fonte/título/ícone/espaçamento dos logins, campos e botões de 53 px. As três telas iniciais têm sete campos e mesma altura computada (~1199 px); a altura cresce naturalmente e a página rola para acomodá-los, sem esconder campos ou criar uma rolagem interna. Verificação e conclusão reutilizam o cartão mínimo do login.

Mantidos os campos pessoais e de acesso, máscaras/validações, prazo de sete dias, confirmação de e-mail, reenvio com limite, retomada por sessionStorage, erros e conclusão. Removido apenas o rótulo redundante 7 DIAS GRÁTIS acima do título; o parágrafo de condições continua presente. Marcas agora em uma linha e ícone M correto no Meu Negócio. Nenhum endpoint, contrato de API, envio de e-mail ou regra de acesso alterado.

Defeito relacionado encontrado no Ajudante durante o teste: onChange do código lia event.currentTarget dentro do updater de estado, quando currentTarget podia já ser null. O valor passou a ser capturado antes de setCodes, como já ocorria nos outros dois apps. Antes, digitar o código derrubava a tela no harness; depois a mesma sequência passou, sem alterar a regra de validação.

Arquivos por app: app/trial-registration.tsx e app/trial-layout.css. app/login-layout.css foi reutilizado sem alterações. TypeScript, ESLint, build Cloudflare e diff-check aprovados nos três. Harness output/verify-unified-trial.cjs na Central: largura 630, campos 53, título 30; mobile 390/320 sem overflow; cadastro inicial, verificação, reload/retomada, reenvio, código inválido, confirmação e conclusão simulada, zero erros JS. Dados fictícios e APIs simuladas exclusivamente em localhost; nenhum e-mail real enviado e nenhuma conta de produção criada. Relatório output/unified-trial-report.json.

Produção: três formulários conferidos sem preenchimento/submissão, sete campos mantidos, medidas iguais. Capturas output/{finorya,meunegocio,ajudante}-unified-trial-online.png na Central. Etapas que enviariam e-mail foram verificadas apenas localmente, sem atribuir a simulação a entrega real.

Publicação --keep-vars, sem migrações. Logs output/unified-trial-build.log e output/unified-trial-deploy.log de cada app. Versões:
- C:\Dev\Projetos\Finorya : Current Version ID: 8cf5268f-96cd-4e3f-811a-e9ba822cfd2d
- C:\Dev\Projetos\Meu Negócio : Current Version ID: 7d03d7ae-15c3-45a6-9822-c8d5b347cb13
- C:\Dev\Projetos\Ajudante Elétrico\app : Current Version ID: 65c19e1c-2f9b-4e33-b242-0ef6a036c3f6