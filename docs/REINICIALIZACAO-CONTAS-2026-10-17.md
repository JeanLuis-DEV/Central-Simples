# Reinicialização das contas — 17/10/2026

Operação executada em produção mediante solicitação explícita do proprietário
para liberar novos cadastros durante a gravação de demonstração.

## Resultado

Foram removidos os usuários anteriores, cadastros pendentes, desafios de
verificação, recuperações de senha, sessões e dados vinculados dos quatro apps:
Finorya, Ajudante Elétrico, Meu Negócio e Lingua Memory. Cada app ficou com uma
única conta administrativa ativa, sem contas de clientes.

| Sistema | Identificador do administrador | Perfil |
| --- | --- | --- |
| Central Simples | `admin` | Administração da Central |
| Finorya | `admin` | `owner` |
| Ajudante Elétrico | `admin` | `owner` |
| Meu Negócio | `admin` | `owner` |
| Lingua Memory | `admin` (e-mail também aceito) | `admin` |

Após a reinicialização, foi publicado suporte ao login `admin` no Lingua Memory,
preservando a mesma conta, e-mail e hash de senha. O e-mail
`admin@centralsimples.com.br` também permanece aceito e não representa a criação
de uma caixa postal. Veja o [registro do ajuste](https://github.com/JeanLuis-DEV/Lingua-Memory/blob/main/docs/LOGIN-ADMIN-2026-10-17.md).
A senha foi definida conforme a nova
instrução do proprietário e não está registrada neste documento nem no Git.

Os e-mails usados anteriormente nos cadastros foram liberados. Nenhuma conta
de cliente foi criada durante a validação final.

## Preservação e segurança

- Os quatro bancos D1 foram exportados antes da limpeza. As cópias foram
  criptografadas com AES-256-GCM, descriptografadas para conferência e usadas
  em ensaio de recuperação e limpeza em SQLite em memória.
- Os snapshots desta operação estão fora dos repositórios, em
  `%USERPROFILE%/.central-simples/maintenance/reset-accounts-2026-10-17/`.
  São cópias locais; esta operação não incluiu nova transferência ao Drive.
- As chaves permanecem em `%USERPROFILE%/.central-simples/backup-keys/`.
  Foi criada uma chave D1 para Meu Negócio; a chave R2 existente foi preservada.
- O Lingua Memory tinha zero áudios; não houve objetos de áudio a remover no R2.
- Esquemas, migrações, proteção contra repetição de requisições e registros
  operacionais/de segurança foram preservados. Não foram eliminados os bancos.
- Na Central foram atualizados somente o usuário administrativo, o hash de
  senha e o segredo de sessão. As sessões anteriores à operação foram
  invalidadas. As credenciais de Gmail, Mercado Pago e integrações foram
  preservadas.
- As alterações locais pendentes de autenticação da Central não foram
  publicadas nesta operação; a atualização de segredos usou a configuração
  isolada correspondente ao código que já estava em produção.

## Validação

Concluída em `2026-10-17T16:24:34.043Z`:

- Integridade referencial válida e exatamente um administrador em cada D1.
- Login, consulta da sessão e logout reais aprovados na Central e nos quatro apps.
- As quatro consultas de contas pelas integrações da Central funcionaram,
  com zero contas de clientes.
- Nenhum envio de e-mail ou pagamento foi disparado por esta operação.

As evidências privadas de execução e verificação estão em `execution.json` e
`verification.json` na pasta de manutenção indicada acima. O teste de um novo
cadastro e do recebimento de seu código fica para a gravação do proprietário,
mantendo os e-mails livres até lá.
