# Estrutura oficial: hospedagem, cadastro e cobrança

> Revisão de 09/10/2026: configurações vigentes e pendências em [STATUS-OPERACIONAL.md](STATUS-OPERACIONAL.md). Os registros de implantação/testes ao final são históricos.

> Homologação de 08/10/2026: cadastro, recuperação e etapa de e-mail da compra aprovados nas APIs produtivas do Ajudante e Finorya. Oito códigos recebidos; expiração, reenvio e limpeza concluídos. Evidências e limites em [HOMOLOGACAO-CODIGOS-EMAIL-2026-10-08.md](HOMOLOGACAO-CODIGOS-EMAIL-2026-10-08.md). Esta atualização substitui as notas antigas de entrega pendente.

Status: sites publicados no Cloudflare e domínios ativos. O cadastro e a recuperação dos aplicativos usam somente código por e-mail; a confirmação por WhatsApp foi removida. Consulte IMPLANTACAO-CLOUDFLARE.md para os recursos, comandos, validações e pendências atuais.

## Endereços oficiais
- Central: https://centralsimples.com.br — catálogo e administração centralizada.
- Finorya: https://finorya.centralsimples.com.br — landing, login e aplicativo.
- Ajudante Elétrico: https://ajudante.centralsimples.com.br — landing, login e aplicativo.
- Lingua Memory: https://lingua-memory.centralsimples.com.br — Worker padrão, D1 e R2 privado; cadastro direto sem códigos.
- Cada app mantém banco, usuários e credenciais próprios; Finorya e Ajudante mantêm suas verificações e pedidos de compra. A Central recebe apenas solicitações administrativas assinadas; senhas continuam no app escolhido.

## Hospedagem inicial
A Central foi publicada em Workers Static Assets no plano gratuito, com exportação estática out e Worker para `/api/central/*`. A criação no Pages retornou erro 8000000. Os comandos de publicação estão em IMPLANTACAO-CLOUDFLARE.md.

O Ajudante foi publicado em Workers com banco D1 exclusivo, migrações até 0008 e secrets próprios. Os bancos locais permanecem separados.

O Finorya mantém Next.js/SQLite no desenvolvimento e foi adaptado para Vinext/Workers com D1 na produção. O limite do módulo de ambiente seleciona o adaptador e a build verifica ausência de SQLite no pacote. Nenhum banco local foi copiado para assets.

A faixa gratuita de Workers/D1 possui limites. Workers Free oferece 100 mil requisições/dia e 10 ms de CPU por execução: a autenticação atual usa scrypt e deve ser medida no ambiente real antes de prometer operação gratuita. Não diminuir a segurança da senha para caber nesse limite. Se exceder, usar infraestrutura com CPU adequada; Workers Paid começa em US$5/mês. A Central estática pode permanecer gratuita. Hospedagem gratuita não significa entrega gratuita de códigos nem pagamentos sem tarifas.

Fontes:
- https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/

## Códigos por e-mail
Os dois apps exigem confirmação do e-mail antes do cadastro público, inclusive no fluxo pago novo. Não há código universal nem ativação quando o Gmail está ausente.
1. Gmail configurado nos dois aplicativos com remetente autenticado.
2. Recebimento real confirmado no cadastro, recuperação e etapa de e-mail da compra em 08/10, incluindo expiração natural e reenvio, conforme relatório acima. Os testes locais com provedores simulados são evidência separada.
3. Manter USER_PASSWORD_ENCRYPTION_KEY existente. Trocar essa chave sem migração compromete consultas por CPF e a validação HMAC dos processos existentes; as senhas ativas são armazenadas somente como hash.

Fontes:
- https://developers.google.com/gmail/api/guides/sending

## Teste gratuito
Permanece com 168 horas de acesso completo, sem cartão, sem cobrança e sem assinatura automática. O servidor bloqueia o acesso após o prazo. A compra é uma ação separada. O pagamento de uma conta de teste converte a conta existente, preservando dados e senha.

## Mercado Pago Checkout Pro
Implantado nos dois apps:
- Botão Finalizar a compra substitui o envio de dados por mensagem externa.
- Cadastro novo: dados → código por e-mail → checkout → webhook/API confirma approved → conta e workspace são criados atomicamente e ficam disponíveis na Central Simples.
- Conta já cadastrada com e-mail verificado: dados e senha devem corresponder à conta existente; o pagamento converte/renova essa conta, sem criar outra.
- Senha e CPF não são enviados ao Mercado Pago; a senha é protegida por hash no servidor, sem cópia reversível ativa. O pedido guarda temporariamente os dados verificados necessários à ativação e apaga o snapshot após ativar.
- Preços e validade são definidos no servidor; nenhuma informação de retorno do navegador libera acesso.
- Webhook exige HMAC válido e consulta GET /v1/payments/{id}. Confere vendedor, moeda BRL, ambiente e valor em centavos. Transações repetidas não duplicam usuário nem estendem a licença outra vez.
- Criação de usuário, workspace, prazo e confirmação do pedido ocorre em transação. Falha reverte tudo e permite nova tentativa de entrega do webhook.
- Estorno integral ou chargeback suspende o acesso quando corresponde à licença vigente e invalida sessões. Estorno de licença anterior ou parcial exige revisão administrativa.
- Fundador possui 10 reservas de vaga no banco para evitar venda simultânea acima do limite. Uma tentativa recusada não libera a reserva, pois a preferência ainda pode receber outro pagamento.
- Checkout tem validade de 30 minutos e exclui boleto. Não há renovação automática de mensalidade: cada checkout compra a validade do plano escolhido.

Configuração para uma instalação nova (os dois apps publicados já usam credenciais reais e `MERCADOPAGO_SANDBOX=false`; não reaplicar credenciais de teste):
1. Em Mercado Pago Developers, criar aplicação Checkout Pro com Preferences API e conta vendedora.
2. Configurar MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET, MERCADOPAGO_SELLER_ID, MERCADOPAGO_SANDBOX e PUBLIC_APP_URL. Tokens e segredo nunca recebem prefixo NEXT_PUBLIC.
3. PUBLIC_APP_URL deve ser somente a origem HTTPS, por exemplo https://finorya.centralsimples.com.br.
4. Registrar webhook HTTPS de pagamentos em /api/payments/webhook e copiar o segredo para o app correspondente. A preferência também informa notification_url.
5. Usar contas/credenciais de teste para homologação. A documentação informa que pagamentos com credenciais de teste não enviam notificações: usar também o simulador oficial de Webhooks. Não confundir teste local com integração externa homologada.
6. Validar approved, pending, rejected, reenvio, valor adulterado, vendedor errado, conversão de teste, estorno e chargeback.
7. Após homologação, configurar credenciais de produção e MERCADOPAGO_SANDBOX=false. Validar entrega e ativação com uma transação real controlada antes de abrir vendas.

Rotas:
- POST /api/payments/start: inicia confirmação do e-mail ou checkout da conta existente.
- POST /api/payments/checkout: checkout do cadastro novo com e-mail confirmado; telefone somente como contato/identificação.
- POST /api/payments/webhook: confirmação assinada.
- POST /api/payments/status: consulta de confirmação por identificador imprevisível do pedido.
- /compra/resultado: acompanha a confirmação e oferece login; não cria conta por parâmetros de URL.

Fontes:
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/create-payment-preference
- https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications

## Preços Finorya
| Plano | Valor | Validade |
| --- | --- | --- |
| Fundador | R$77,00 | 12 meses |
| Anual | R$99,90 | 12 meses |
| Semestral | R$50,15 | 6 meses |
| Mensal | R$9,99 | 1 mês |
Referência do Fundador: R$358,80; economia R$281,80. O preço de R$77,00 foi definido explicitamente, sem alterar os demais planos. Os valores do Ajudante permanecem próprios dele.

## Pendências vigentes

Marca Google aprovada; escopo gmail.send em análise. Mercado Pago em produção: primeira compra real e homologações financeiras restantes ainda precisam de validação. Custódia externa e recuperação isolada concluídas; upload recorrente, testes operacionais e custódia própria dos secrets são etapas distintas. Lista consolidada e evidências: [STATUS-OPERACIONAL.md](STATUS-OPERACIONAL.md).

## Histórico da entrega inicial

As seções datadas abaixo e a validação local inicial registram a situação daquela entrega, anterior à homologação por e-mail, produção Mercado Pago e custódia externa.

## Arquivos alterados nesta entrega

- `.env.example`
- `.gitignore`
- `README.md`
- `docs/ESTRUTURA-OFICIAL.md`
- `next.config.ts`

## Validação local

Finorya: 96 testes unitários, fluxos Chrome desktop/mobile e fluxo HTTP de compra com provedores simulados. Ajudante: Worker/D1 efêmero com confirmação assinada, criação de conta integrada à Central, idempotência, valor adulterado e estorno; regressão de autenticação e verificação aprovada. Builds de produção dos três projetos aprovadas. A Central gerou exportação estática e Worker de administração. Hospedagem e domínio foram ativados. Provedores externos de pagamento e códigos ainda não foram homologados; veja IMPLANTACAO-CLOUDFLARE.md.
