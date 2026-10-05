# Central Simples

Primeiro protótipo do catálogo de aplicativos, com a identidade visual do Finorya e do Ajudante Elétrico.

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

Copie `.env.example` para `.env.local` e ajuste os endereços públicos. O protótipo usa Finorya na porta 5180 e Ajudante Elétrico na porta 5173. Os aplicativos precisam estar ativos para seus links de acesso funcionarem. Alterações nessas variáveis exigem uma nova compilação em produção.

## Validar

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm test:browser
```

A validação de navegador exige a Central ativa e Google Chrome instalado no caminho configurado em `tests/browser.mjs`. Capturas ficam em `artifacts/`.

Detalhes, arquivos e próximos pontos: [docs/PROTOTIPO.md](docs/PROTOTIPO.md).
