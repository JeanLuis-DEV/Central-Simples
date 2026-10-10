# Central Simples

> Estado registrado em 09/10/2026, entregas concluídas e pendências reais: [status operacional](docs/STATUS-OPERACIONAL.md).

Catálogo publicado de Finorya, Ajudante Elétrico e Lingua Memory, com administração centralizada de contas.

## Executar

Node.js 22.13 ou superior e pnpm.

```powershell
pnpm install
pnpm dev
```

Abra http://127.0.0.1:5190. Para a versão otimizada: `pnpm build` e `pnpm start`.

## Testar no celular

Com computador e celular na mesma rede Wi-Fi, execute `pnpm start:lan` após `pnpm build` e abra `http://IP-DO-COMPUTADOR:5190` no celular. Mantenha o computador e o servidor ligados. O endereço local pode mudar ao reconectar à rede. Os links para os aplicativos continuam apontando para os endereços definidos no `.env.local`; `127.0.0.1` não aponta para o computador quando aberto no celular.

## Endereços dos aplicativos

Copie `.env.example` para `.env.local` e ajuste os endereços públicos. O catálogo usa Finorya na porta 5180, Ajudante Elétrico na porta 5173 e Lingua Memory na porta 5200. Os aplicativos precisam estar ativos para seus links de acesso funcionarem. Alterações nessas variáveis exigem uma nova compilação em produção. Em produção, `NEXT_PUBLIC_LINGUA_MEMORY_URL` aponta para `https://lingua-memory.centralsimples.com.br`, já publicado.

## Validar

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm test:browser
```

A validação de navegador exige a Central ativa e Google Chrome instalado no caminho configurado em `tests/browser.mjs`. Capturas ficam em `artifacts/`.

Detalhes, arquivos e próximos pontos: [docs/PROTOTIPO.md](docs/PROTOTIPO.md).

## Estrutura oficial

Hospedagem, confirmação dos contatos, teste sem cartão e integração Mercado Pago: [docs/ESTRUTURA-OFICIAL.md](docs/ESTRUTURA-OFICIAL.md).

## Publicação oficial

Publicado em https://centralsimples.com.br. A administração fica em
`/area-restrita`; ela cria, consulta, suspende e exclui contas dos aplicativos
por endpoints internos assinados. O Lingua Memory já está conectado, com banco
D1 e áudios privados no R2; a criação e consulta de contas foram validadas.
Recursos, comandos e homologações pendentes:
[implantação Cloudflare](docs/IMPLANTACAO-CLOUDFLARE.md) e
[administração central](docs/CENTRAL-ADMIN.md).
