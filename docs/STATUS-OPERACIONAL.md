# Estado operacional e pendências — 09/10/2026

Registro consolidado das últimas evidências documentadas até 09/10/2026. Esta revisão não executou novos testes, pagamentos, backups nem consultas aos provedores. Relatórios de 02 a 07/10 preservam resultados históricos e não definem a configuração vigente.

## Estado vigente

| Área | Estado registrado |
| --- | --- |
| Publicação | Central Simples, Finorya, Ajudante Elétrico e Lingua Memory publicados na Cloudflare, com HTTPS |
| Administração | Área Restrita somente na Central, com seleção do aplicativo; integração assinada dos três apps publicada e validada |
| Códigos | Finorya e Ajudante usam somente Gmail; cadastro, recuperação e etapa de e-mail da compra tiveram recebimento real, expiração e reenvio validados em 08/10 |
| WhatsApp de autenticação | Feature, adaptadores e segredos removidos dos apps em 08/10; não configurar Twilio/Meta nem renovar a credencial antiga |
| Google OAuth | Marca aprovada e publicada; solicitação de aprovação do escopo gmail.send enviada em 09/10 e registrada em análise |
| Mercado Pago | Finorya e Ajudante publicados em produção com credenciais reais e MERCADOPAGO_SANDBOX=false desde 08/10; checkouts sem pagamento e entrega assinada do simulador validados |
| Backups | Snapshots produtivos dos três apps cifrados e chaves protegidas guardados no Drive privado em 09/10; downloads conferidos por tamanho e SHA-256 |
| Recuperação | Finorya/Ajudante restaurados em D1 isolado; Lingua Memory restaurado em D1/R2 isolados, incluindo fixture preenchida e fluxo da aplicação; recursos temporários removidos |
| Áudio Lingua Memory | Gravação com microfone físico e reprodução audível confirmadas pelo titular em 09/10; testes automatizados usam dispositivo simulado |

O telefone de Finorya/Ajudante continua como contato e dado de identificação; não recebe código. Lingua Memory permite cadastro direto com nome, e-mail, senha e idioma, sem CPF, telefone ou códigos; recuperação pelo suporte. Gmail é opcional para esse suporte. O uso de WhatsApp para compartilhar orçamentos ou atender contatos é independente da confirmação removida.

## Hospedagem e integração

| Projeto | Endereço | Recursos produtivos |
| --- | --- | --- |
| Central Simples | https://centralsimples.com.br | Assets do catálogo e Worker da API administrativa; sem banco central |
| Finorya | https://finorya.centralsimples.com.br | Worker e D1 próprio |
| Ajudante Elétrico | https://ajudante.centralsimples.com.br | Worker e D1 próprio |
| Lingua Memory | https://lingua-memory.centralsimples.com.br | Worker padrão, D1 e R2 privado; sem Containers |

CENTRAL_INTEGRATION_SECRET está configurado nos quatro Workers. A Central usa chamadas HMAC; os bancos continuam separados, vinculados aos respectivos aplicativos. A correção da assinatura da Central foi publicada em 08/10. Nenhuma chave deve ser regenerada para aplicar instruções de uma instalação nova.

## Custódia de backups

Na [pasta privada do Google Drive](https://drive.google.com/drive/u/1/folders/1VWWb_x-JyKc9o7OdyvCI5zRY8-i8e5a4) estão backups-criptografados.zip, chaves-protegidas.cskeys, o utilitário de proteção das chaves e o registro de custódia. O pacote bruto chaves-privadas.zip permaneceu local e não foi enviado. A senha independente foi definida pelo titular, que declarou guardá-la fora do Drive; seu local físico não foi inspecionado.

Finorya/Ajudante têm backup diário e monitor horário no Windows, dependentes do computador e da sessão. O backup D1/R2 do Lingua Memory é manual. A transferência externa desses snapshots está concluída; isso não significa upload recorrente automático nem exportação dos segredos de autenticação/provedores.

## Pendências reais

1. **Google:** aguardar a decisão sobre gmail.send e responder caso o Google solicite evidências adicionais. A marca não está mais pendente.
2. **Meta:** confirmar a exclusão do cartão e dos ativos antigos no painel autenticado. A remoção do código e dos segredos dos Workers não comprova exclusão no provedor. Não há homologação WhatsApp ou renovação de token a concluir.
3. **Vendas:** validar a primeira compra real, a notificação automática de pagamento e a criação/conversão/renovação da licença. A entrega pelo simulador não comprova esse fluxo. A medição oficial de qualidade exige um pagamento produtivo elegível; o painel com data 1900/ID genérico não é resultado válido.
4. **Cenários financeiros externos:** estorno parcial, estorno de licença anterior preservando a posterior e nova renovação completa pela interface. Os relatórios sandbox são evidências históricas em bancos isolados.
5. **Operação:** concluir cenários adicionais de pedidos abandonados, falhas/limites de alertas com entrega real e medição de autenticação sob carga. Reconciliação, fila de revisão, painel e monitor já existem; não precisam ser reimplementados.
6. **Continuidade:** manter futuras cópias externas atualizadas, definir automação independente do PC se necessária, preparar autenticação estável de R2 antes de automatizar Lingua Memory e custodiar os segredos dos provedores separadamente. Exercícios de promoção e reconciliação em homologação continuam separados da restauração isolada já aprovada.

## Registros de evidências

- [Administração e integração](<CENTRAL-ADMIN.md>)
- [Assinatura publicada e revisão](<REVISAO-PRE-COMMIT-2026-10-08.md>)
- [Recebimento real por e-mail](<HOMOLOGACAO-CODIGOS-EMAIL-2026-10-08.md>)
- [Google OAuth](<VERIFICACAO-GOOGLE-OAUTH-2026-10-09.md>)
- [Custódia externa](<CUSTODIA-BACKUPS-2026-10-09.md>)
- [Encerramento da integração WhatsApp](<REMOVO-INTEGRACAO-WHATSAPP-2026-10-08.md>)
- [Vendas reais Finorya](https://github.com/JeanLuis-DEV/Finorya-Gestao-Financeira/blob/main/docs/PREPARACAO-MERCADOPAGO-PRODUCAO-2026-10-08.md)
- [Recuperação D1/R2](https://github.com/JeanLuis-DEV/Lingua-Memory/blob/main/docs/BACKUP-CLOUDFLARE-2026-10-09.md)
