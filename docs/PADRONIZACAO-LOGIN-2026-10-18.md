# Padronização dos logins — 18/10/2026

Referência: cartão de login do Meu Negócio enviado pelo usuário. Aplicado o mesmo contrato visual nos quatro apps: cartão centralizado, largura máxima 630 px e altura mínima 661 px; padding 28 px; marca em uma linha com ícone próprio; título Bem-vindo de volta; campos Login e Senha; entrar, recuperação de senha, teste grátis e Conhecer. Removidas a chamada SEU ESPAÇO DE GESTÃO e descrição de marca nos logins que ainda as exibiam. Corrigido o ícone de letra do Meu Negócio de F para M.

Lingua Memory: login deixou de usar a composição em duas colunas e passou ao mesmo cartão e medidas. Sem botão de teste grátis; cadastro gratuito mantido como link de texto, além de recuperação e Conhecer. O campo continua aceitando login ou e-mail e usa o mesmo nome email no payload; rótulo acessível Login ou e-mail preservado. Cadastro e regras de senha/consentimento foram preservados. O registro mantém sua apresentação anterior, fora dos seletores de login.

Arquivo app/login-layout.css idêntico nos quatro repositórios, com seletores exclusivos unified-login-page/unified-login-card. Demais telas de recuperação, compra, cadastro e app não recebem os overrides. Foram alterados app/auth-provider.tsx nos três apps pagos e components/auth-screen.tsx no Lingua Memory. Nenhum endpoint, cookie, sessão, prazo, verificação de contato ou regra de acesso foi modificado.

Validação: TypeScript, ESLint e builds Cloudflare aprovados. Harness output/verify-unified-login.cjs na Central: quatro apps, 1440/390/320 px, dimensões e campos iguais, sem overflow; login com falha e sucesso; zero erros JS. Fixture inicial do Meu Negócio foi ajustada ao contrato de state; após a correção do harness os quatro passaram. Relatório output/unified-login-sizes.json. O teste tests/browser-landing.mjs do Lingua Memory também passou (landing sem JS, cadastro, login, persistência e logout). Capturas locais e de produção em output/*-unified-login-{local,online}.png na Central.

Conferência real: quatro cartões medidos em 630x661, inputs e Entrar com 53 px. A sessão criada anteriormente pelo agente no navegador de verificação do Lingua foi encerrada para conferir sua tela de login, sem alterar outras contas. Os links dos três testes grátis chegam a /teste-gratis; Criar conta grátis do Lingua abre seu cadastro. Nenhuma conta foi criada e nenhum formulário de cadastro foi submetido. Não foram repetidos testes integrais de domínio/backend por se tratar da apresentação e navegação dos controles existentes.

Publicação --keep-vars, sem migrações. Versões:
- C:\Dev\Projetos\Finorya : Current Version ID: 9fb0ba84-0887-41f5-8bca-c55a27cd6e85
- C:\Dev\Projetos\Meu Negócio : Current Version ID: 6e6af451-b66b-4deb-8c9c-366563edc9bf
- C:\Dev\Projetos\Ajudante Elétrico\app : Current Version ID: e65ed454-9b06-42f2-9b80-010e96b21749
- C:\Dev\Projetos\Lingua Memory : Current Version ID: 9490b2b7-6f60-4325-9951-217c7f4e5455