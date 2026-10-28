# Primeiro bloco das landing pages — 18/10/2026

Referência: marcações vermelhas enviadas pelo usuário. Preservados cabeçalho, título principal, ações, aviso de acesso e telas desktop/mobile. Removidos apenas os parágrafos lp-lead, a chamada lp-eyebrow no hero e a legenda lp-preview-note. Nenhum conteúdo das seções inferiores foi removido; cabeçalhos e funcionalidades não foram alterados. Lingua Memory continua gratuito, sem Planos e sem teste pago. Telas demonstrativas continuam ocultas no mobile.

Arquivos em cada um dos quatro projetos: app/landing-page.tsx e app/landing-screens.tsx. Relatório replicado em docs/PRIMEIRO-BLOCO-LANDING-2026-10-18.md.

Validação: TypeScript, ESLint e builds aprovados nos quatro apps (aviso preexistente de img em seção inferior do Ajudante). Verificação local desktop e 390 px: ausência dos elementos removidos, duas ações e aviso preservados, telas visíveis no desktop e ocultas no mobile, sem overflow. Harness: output/verify-hero-content.cjs na Central Simples. Conferência real online dos quatro: zero elementos extras no hero, títulos e ações corretos. Captura output/hero-clean-online.png na Central.

Publicações com --keep-vars, sem migrações:
- C:\Dev\Projetos\Finorya : Current Version ID: 3ec35a9e-323c-409a-a4d5-22efa660d03d
- C:\Dev\Projetos\Meu Negócio : Current Version ID: ff09a518-54cb-4990-aff4-ffaf7a852556
- C:\Dev\Projetos\Ajudante Elétrico\app : Current Version ID: 471e6223-1ce7-4924-9d17-3e9ed55e095e
- C:\Dev\Projetos\Lingua Memory : Current Version ID: be752f3f-e664-40bb-a617-ecbf96f92eca