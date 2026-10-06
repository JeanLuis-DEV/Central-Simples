# Documentos públicos e OAuth Gmail

Atualização: 05/10/2026.

## Preparado localmente

- Rotas estáticas `/privacidade` e `/termos`, com identidade visual da Central Simples.
- Links para os documentos no rodapé do catálogo e navegação entre os documentos.
- Política contempla dados dos dois aplicativos, sincronização, recuperação, prestadores e a integração Gmail de envio, sem autorização de leitura de e-mails.
- Termos contemplam contas separadas, teste de sete dias sem cartão, confirmação de pagamento no servidor, registros e recuperação de acesso.
- Compilação estática, TypeScript e lint aprovados. As duas páginas foram abertas e revisadas no navegador.
- **Publicação aprovada e concluída.** Versão Cloudflare `7220529d-7ad9-45d4-ad58-df0ac4893b45`. As duas páginas foram confirmadas no domínio público após a propagação da implantação.

## Integração Google

O cliente OAuth do projeto Google Cloud `prefab-clover-510801-h2` foi criado e autorizado pela conta remetente. Renovação de acesso e recebimento de um e-mail real de teste foram confirmados. A configuração foi confirmada como Em produção após autorização explícita do proprietário. Novo consentimento de envio foi concluído pelo titular em 05/10/2026 às 22:50 e o token de produção renovou o acesso com sucesso, com somente gmail.send. A página inicial e o domínio autorizado foram salvos; os links públicos de privacidade e termos foram salvos no branding.

A análise de marca retornou: página inicial não registrada para a conta remetente. A propriedade https://centralsimples.com.br/ foi preparada no Search Console e sua metatag foi adicionada localmente em app/page.tsx; a compilação passou. Essa comprovação ainda não foi publicada nem confirmada e aguarda autorização do proprietário. Depois da confirmação, o Google pede aguardar 24 horas antes de repetir a análise. A verificação do escopo sensível continua sinalizada como pendente. Não adicionar links fictícios nem considerar o token de testes permanente.

O envio ainda não está integrado aos fluxos dos aplicativos. Os segredos estão restritos ao computador do proprietário, fora dos repositórios; não devem ser documentados ou publicados.

Referências: [requisitos de branding do Google](https://support.google.com/cloud/answer/15549049?hl=en) e [expiração OAuth](https://developers.google.com/identity/protocols/oauth2#expiration).
