# Homologação de códigos por e-mail — 08/10/2026

Status: recebimento real de oito códigos confirmado. Cadastro gratuito, recuperação de senha e etapa de confirmação de e-mail da compra aprovados nas APIs de produção dos dois aplicativos. Expiração e reenvio reais concluídos em 08/10/2026 às 21h48 (America/Sao_Paulo).

## Ambiente e método

- Ajudante Elétrico: https://ajudante.centralsimples.com.br, Worker `ajudante-eletrico`, versão `9546fdd8-4d3b-46ad-bb36-2cf70317dba0`.
- Finorya: https://finorya.centralsimples.com.br, Worker `finorya`, versão `053282b6-95a8-4f1f-ad5e-0c1c1e656bab`.
- Requisições HTTPS às rotas publicadas, com origem correta, cookies e dados sintéticos exclusivos. Nenhum envio simulado ou leitura de códigos no banco nestes fluxos.
- Códigos recebidos em caixas temporárias externas do Guerrilla Mail e usados nas próprias rotas de confirmação. O remetente configurado é `jeanluis.dev@gmail.com`; a leitura ocorre pela API da caixa de teste, sem ampliar a permissão `gmail.send`.
- Central Simples não possui fluxo próprio de código. Lingua Memory não possui confirmação por código de e-mail; não houve alteração de seu cadastro nesta etapa.
- Nenhum segredo, senha, código ou token foi incluído neste relatório.

## Resultados externos

| Etapa | Ajudante | Finorya |
| --- | --- | --- |
| Início do cadastro gratuito | HTTP 201 | HTTP 201 |
| Recebimento e confirmação do código de cadastro | Recebido; HTTP 200 | Recebido; HTTP 200 |
| Criação da conta de teste | HTTP 201 | HTTP 201 |
| Início da recuperação com os dados da conta | HTTP 202 | HTTP 202 |
| Recebimento e confirmação do código de recuperação | Recebido; HTTP 200 | Recebido; HTTP 200 |
| Alteração de senha e login com a nova senha | HTTP 200 / 200 | HTTP 200 / 200 |
| Início da compra mensal e recebimento do código | HTTP 201; recebido | HTTP 201; recebido |
| Checkout antes da confirmação do e-mail | HTTP 403 | HTTP 403 |
| Código incorreto / código do outro aplicativo | HTTP 400 / 400 | HTTP 400 / 400 |
| Reenvio imediato | HTTP 429 | HTTP 429 |
| Código original após dez minutos reais | HTTP 410 | HTTP 410 |
| Reenvio após o intervalo e recebimento da nova mensagem | HTTP 200; recebido | HTTP 200; recebido |
| Código anterior após o reenvio | HTTP 400 | HTTP 400 |
| Confirmação do novo código e consulta do estado | HTTP 200; e-mail confirmado | HTTP 200; e-mail confirmado |
| Tentativa de transformar compra em conta gratuita | HTTP 410; bloqueada | HTTP 410; bloqueada |

Foram recebidos quatro códigos por aplicativo: cadastro, recuperação, início da compra e reenvio da compra. A expiração foi aguardada naturalmente, sem alterar horários ou hashes no D1. Apenas desafios por e-mail foram encontrados nos cadastros de compra.

## Verificação automatizada complementar

Em 08/10/2026, `pnpm exec vitest run tests/password-recovery.test.ts` no Finorya aprovou 13 testes. Inclui uso único sob concorrência, revogação de sessões, preservação do prazo da conta, expiração, limites, isolamento, CSRF e falha segura do provedor. Esses testes usam envio simulado e são evidência distinta dos recebimentos externos acima.

## Preservação e limpeza

As duas contas sintéticas de cadastro/recuperação foram removidas por ID exato nos respectivos D1, incluindo as dependências por cascata. Os dois cadastros pendentes da tentativa inicial de entrega também foram excluídos por ID exato. A consulta posterior retornou zero contas, cadastros pendentes e recuperações desses testes, antes de iniciar os testes de compra.

Identificadores removidos:

- Ajudante: conta `18a2edb6-a862-4888-b50d-b7c8029f82b0`; tentativa inicial `2769fbfa-17d2-459b-8d7e-07f1be81cae2`.
- Finorya: conta `6c90cc80-1146-4bc3-a441-57d220464e5b`; tentativa inicial `4b39b5ae-b93b-4d11-8869-44334c02c20a`.

Os cadastros de compra também foram removidos por ID exato após o teste: Ajudante `ac82b1a7-d443-49e4-b0ac-f2cd811b2a3d`; Finorya `57349747-a1e5-4831-99be-4ca121f916b5`. Cada exclusão removeu o cadastro e seu desafio por cascata. A conferência final dos identificadores retornou zero cadastros pendentes, desafios, usuários, recuperações, sessões e workspaces de teste nos dois D1.

Não foram criadas preferências de pagamento nem cobranças nesta etapa. A consulta final de `payment_orders` pelos identificadores sintéticos retornou zero pedidos nos dois bancos. Clientes existentes, chaves, provedores, migrações e versões publicadas foram preservados. Somente documentação foi alterada nos projetos; não foi necessária nova publicação.

## Limites e observações

- A primeira tentativa em caixas `maxxspace.com` do mail.tm não recebeu mensagens dentro de 120 segundos, embora as rotas tenham retornado HTTP 201. As caixas foram excluídas. O recebimento posterior em outro provedor comprova entrega externa nesse destinatário, sem garantir entrega em todos os domínios.
- A caixa Gmail pessoal do titular não foi lida nesta etapa. A automação de navegador estava indisponível; os testes foram feitos por HTTPS/API, sem homologar a navegação visual.
- O fluxo de compra foi exercitado somente até a confirmação de e-mail. Checkout pago, aprovação financeira e ativação por webhook pertencem aos testes de pagamentos e não são resultados desta etapa.
- O estado atual da revisão de marca/escopo no Google não foi conferido. A autorização de envio funcionou nos testes, o que não comprova aprovação da marca.
- A credencial administrativa do arquivo local retornou HTTP 401 na tentativa de limpeza via Central. Não foi redefinida; a limpeza das contas foi concluída diretamente no D1.
