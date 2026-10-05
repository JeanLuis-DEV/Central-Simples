# Estrutura oficial: hospedagem, cadastro e cobrança

Status: sites publicados no Cloudflare e domínios ativos em 05/10/2026. Cadastros com códigos e cobrança aguardam provedores. Consulte IMPLANTACAO-CLOUDFLARE.md para os recursos, comandos, validações e pendências atuais.

## Endereços oficiais
- Central: https://www.centralsimples.com.br — catálogo.
- Finorya: https://finorya.centralsimples.com.br — landing, login e aplicativo.
- Ajudante Elétrico: https://ajudante.centralsimples.com.br — landing, login e aplicativo.
- Cada app mantém banco, usuários, chave de criptografia, configuração de verificação e pedidos próprios. O catálogo não recebe senhas, pagamentos ou acesso administrativo.

## Hospedagem inicial
A Central foi publicada em Workers Static Assets no plano gratuito, com exportação estática out. A criação no Pages retornou erro 8000000. Os comandos de publicação estão em IMPLANTACAO-CLOUDFLARE.md.

O Ajudante foi publicado em Workers com banco D1 exclusivo, migrações até 0008 e secrets próprios. Os bancos locais permanecem separados.

O Finorya mantém Next.js/SQLite no desenvolvimento e foi adaptado para Vinext/Workers com D1 na produção. O limite do módulo de ambiente seleciona o adaptador e a build verifica ausência de SQLite no pacote. Nenhum banco local foi copiado para assets.

A faixa gratuita de Workers/D1 possui limites. Workers Free oferece 100 mil requisições/dia e 10 ms de CPU por execução: a autenticação atual usa scrypt e deve ser medida no ambiente real antes de prometer operação gratuita. Não diminuir a segurança da senha para caber nesse limite. Se exceder, usar infraestrutura com CPU adequada; Workers Paid começa em US$5/mês. A Central estática pode permanecer gratuita. Hospedagem gratuita não significa entrega gratuita de códigos nem pagamentos sem tarifas.

Fontes:
- https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/
- https://developers.cloudflare.com/d1/platform/pricing/

## E-mail e WhatsApp com códigos
Os dois apps já exigem confirmação dos dois contatos antes do cadastro público, incluindo o fluxo pago novo. Não há código universal nem ativação quando o provedor está ausente.
1. Criar a conta Twilio e um Verify Service com e-mail e WhatsApp habilitados.
2. Criar API Key e configurar TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET e TWILIO_VERIFY_SERVICE_SID como secrets do app.
3. No SendGrid, autenticar um domínio de envio, cadastrar remetente, configurar DNS indicado pelo provedor (SPF/DKIM) e template de código; associar essa configuração ao canal de e-mail do Verify.
4. Ativar suporte a CustomCode no Verify, pois o adaptador atual envia o código próprio. Confirmar a disponibilidade dessa configuração com o provedor.
5. Configurar o remetente WhatsApp/conta empresarial e concluir os requisitos do Twilio Verify para esse canal. Homologar destino brasileiro em formato E.164 (+55 + DDD + número). Não tratar sandbox como envio público de produção.
6. Testar entrega real de e-mail e WhatsApp, código incorreto, vencimento e reenvio. Os testes automáticos locais usam provedores simulados e não validam a entrega externa.
7. Manter USER_PASSWORD_ENCRYPTION_KEY existente. Trocar essa chave sem migração compromete senhas cifradas e consultas por CPF.

Fontes:
- https://www.twilio.com/docs/verify/email
- https://www.twilio.com/docs/verify/whatsapp
- https://www.twilio.com/docs/verify/api/verification

## Teste gratuito
Permanece com 168 horas de acesso completo, sem cartão, sem cobrança e sem assinatura automática. O servidor bloqueia o acesso após o prazo. A compra é uma ação separada. O pagamento de uma conta de teste converte a conta existente, preservando dados e senha.

## Mercado Pago Checkout Pro
Implantado nos dois apps:
- Botão Finalizar a compra substitui o envio de dados ao WhatsApp.
- Cadastro novo: dados → códigos dos dois contatos → checkout → webhook/API confirma approved → conta e workspace são criados atomicamente e aparecem na Área Restrita.
- Conta já cadastrada com contatos verificados: dados e senha devem corresponder à conta existente; o pagamento converte/renova essa conta, sem criar outra.
- Senha e CPF não são enviados ao Mercado Pago; a senha fica somente como hash e cifra no servidor. O pedido guarda temporariamente os dados verificados necessários à ativação e apaga o snapshot após ativar.
- Preços e validade são definidos no servidor; nenhuma informação de retorno do navegador libera acesso.
- Webhook exige HMAC válido e consulta GET /v1/payments/{id}. Confere vendedor, moeda BRL, ambiente e valor em centavos. Transações repetidas não duplicam usuário nem estendem a licença outra vez.
- Criação de usuário, workspace, prazo e confirmação do pedido ocorre em transação. Falha reverte tudo e permite nova tentativa de entrega do webhook.
- Estorno integral ou chargeback suspende o acesso quando corresponde à licença vigente e invalida sessões. Estorno de licença anterior ou parcial exige revisão administrativa.
- Fundador possui 10 reservas de vaga no banco para evitar venda simultânea acima do limite. Uma tentativa recusada não libera a reserva, pois a preferência ainda pode receber outro pagamento.
- Checkout tem validade de 30 minutos e exclui boleto. Não há renovação automática de mensalidade: cada checkout compra a validade do plano escolhido.

Configuração necessária por app:
1. Em Mercado Pago Developers, criar aplicação Checkout Pro com Preferences API e conta vendedora.
2. Configurar MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET, MERCADOPAGO_SELLER_ID, MERCADOPAGO_SANDBOX e PUBLIC_APP_URL. Tokens e segredo nunca recebem prefixo NEXT_PUBLIC.
3. PUBLIC_APP_URL deve ser somente a origem HTTPS, por exemplo https://finorya.centralsimples.com.br.
4. Registrar webhook HTTPS de pagamentos em /api/payments/webhook e copiar o segredo para o app correspondente. A preferência também informa notification_url.
5. Usar contas/credenciais de teste para homologação. A documentação informa que pagamentos com credenciais de teste não enviam notificações: usar também o simulador oficial de Webhooks. Não confundir teste local com integração externa homologada.
6. Validar approved, pending, rejected, reenvio, valor adulterado, vendedor errado, conversão de teste, estorno e chargeback.
7. Após homologação, configurar credenciais de produção e MERCADOPAGO_SANDBOX=false. Validar entrega e ativação com uma transação real controlada antes de abrir vendas.

Rotas:
- POST /api/payments/start: inicia confirmação de contatos ou checkout da conta existente.
- POST /api/payments/checkout: checkout do cadastro novo com ambos os contatos confirmados.
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

## Pendências reais antes de abrir ao público
- Finalizar contas, credenciais e homologação dos provedores de códigos e pagamentos; domínio/DNS/HTTPS e recursos de produção já foram provisionados.
- Monitorar CPU e homologar autenticação completa sob uso real; adaptação de Finorya para Workers/D1 concluída.
- Confirmar backup/restauração e login administrativo válido; migrações remotas aplicadas.
- Homologar entrega real dos dois códigos, checkout e webhook real.
- Implementar reconciliação operacional de pedidos abandonados: uma compra pendente/reserva de Fundador não é liberada automaticamente por simples vencimento local, pois um pagamento tardio pode ser confirmado. Reconciliar com a API do provedor antes de liberar identidade ou vaga. Enquanto isso, encaminhar casos pendentes ao administrador.
- Automatizar alertas/reconciliação de webhook perdido e revisar estornos parciais/licenças anteriores. Falhas do webhook retornam erro para reenvio do provedor.
- Fechar política de privacidade, termos, reembolso, suporte e retenção dos pedidos pendentes.


## Arquivos alterados nesta entrega

- `.env.example`
- `.gitignore`
- `README.md`
- `docs/ESTRUTURA-OFICIAL.md`
- `next.config.ts`

## Validação local

Finorya: 96 testes unitários, fluxos Chrome desktop/mobile e fluxo HTTP de compra com provedores simulados. Ajudante: Worker/D1 efêmero com confirmação assinada, cadastro na Área Restrita, idempotência, valor adulterado e estorno; regressão de autenticação e verificação aprovada. Builds de produção dos três projetos aprovadas. A Central gerou exportação estática out. Hospedagem e domínio foram ativados. Provedores externos de pagamento e códigos ainda não foram homologados; veja IMPLANTACAO-CLOUDFLARE.md.
