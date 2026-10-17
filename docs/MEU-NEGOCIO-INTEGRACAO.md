# Meu Negócio — integração administrativa (17/10/2026)

- Aplicativo: `meu-negocio`, domínio https://meunegocio.centralsimples.com.br.
- `MEU_NEGOCIO_APP_URL` aponta para o Worker exclusivo.
- `MEU_NEGOCIO_INTEGRATION_SECRET` na Central corresponde a `CENTRAL_INTEGRATION_SECRET` no Meu Negócio. Chave exclusiva, sem fallback para a chave compartilhada dos demais produtos. Não alterar as credenciais existentes.
- Chamadas continuam com HMAC-SHA256, timestamp, nonce e proteção contra repetição no aplicativo. Sessão administrativa e proteção de origem continuam obrigatórias na Central.
- A interface adiciona a aba Meu Negócio com os formulários e ações existentes; os dados permanecem no D1 do produto. Layout flexível de abas preservado em desktop e mobile.

## Publicação e preservação

Versão Cloudflare `9622f8cb-534b-4f15-bd21-ad049ccf8cfd`, preparada a partir da base publicada `6ebcb63`, acrescida apenas desta integração. A árvore principal contém correções anteriores de autenticação ainda não publicadas; elas foram preservadas, sem migração de autenticação ou modificação de suas credenciais nesta entrega.

A compilação estática isolada usou Webpack, evitando a limitação de symlinks do Turbopack no Windows. Testes da base publicada: seis passaram, incluindo assinatura com chave própria, preservação dos outros produtos e bloqueio sem a chave exclusiva. Na árvore local com autenticação em revisão, os testes também passaram.

Em produção: conexão aparece habilitada no catálogo de aplicativos; endpoint interno assinado responde 200, chamada sem assinatura responde 401 e repetição de nonce responde 409. Nenhuma conta de cliente foi modificada para essas verificações.
