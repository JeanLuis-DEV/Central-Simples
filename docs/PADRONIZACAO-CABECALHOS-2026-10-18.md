# Padronização dos cabeçalhos das landing pages — 18/10/2026

Nos quatro apps, cabeçalho com marca em uma linha e sem subtítulo, navegação apenas Recursos e Planos, botão Entrar no app com desenho e dimensões iguais. Ícones próprios preservados; alterações limitadas à landing. O app por dentro foi removido do menu; seções existentes abaixo foram preservadas.

Arquivos por projeto: app/landing-page.tsx e app/landing.css. No Lingua Memory foram adicionados destinos Recursos e Planos: resumo dos recursos existentes e consulta das condições pelo suporte já existente. Não foram inventados preços, períodos ou checkout.

Contrato visual idêntico: desktop cabeçalho 91 px com borda, marca 19 px, ícone 40x44 px e botão 164x44 px; mobile marca 15 px (13 px até 360), ícone 30x36, botão 126x40 (116x40 até 360) e navegação na segunda linha. Fonte Arial no cabeçalho, menu 14 px e botão peso 700.

Validações: TypeScript, ESLint e builds aprovados nos quatro projetos. Ajudante possui aviso preexistente no img da seção inferior; nenhum erro de lint. Harness output/verify-landing-headers.cjs da Central Simples: 1440, 700, 390 e 320 px; mesmos valores medidos nos quatro, navegação visível, dois destinos existentes e sem overflow. Conferência real online dos quatro menus, medidas de botão e destinos de Planos; entrada do Lingua abre formulário original. Captura real output/header-online.png na Central.

Publicação via Wrangler --keep-vars, sem migrações:
- Finorya: f9b6ccff-b995-49cc-a307-bafc0970181d
- Meu Negócio: 8e2e7762-485a-4684-8470-33fe24c77aa9
- Ajudante Elétrico: d2a826a5-6ad1-402c-b907-2df500e7ee0c
- Lingua Memory: 0f24c709-e15e-4456-8570-aad2891e6712

Logs: output/header-build.log e output/header-deploy.log em cada projeto. Variáveis e secrets preservados, regras de acesso/pagamento inalteradas.
## Correção: Lingua Memory gratuito

Conforme a confirmação do usuário, o Lingua Memory é gratuito. Removidos o item Planos do cabeçalho e a seção de consulta de planos pelo suporte. Recursos e Entrar no app permanecem com o design padronizado. Arquivo: app/landing-page.tsx. Nenhuma regra de autenticação ou cadastro foi modificada.

Validação: TypeScript, ESLint e build aprovados. Publicado sem migrações, --keep-vars, versão 339821aa-fe52-4c56-8a8d-e867fe2c812b. Conferência online: menu com apenas Recursos; zero ocorrências de Planos e Consultar planos. Captura output/free-landing-online.png no Lingua Memory.

