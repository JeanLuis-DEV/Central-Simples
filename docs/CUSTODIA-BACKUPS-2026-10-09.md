# Custódia de backups — 09/10/2026

## Concluído

- Novas cópias integrais criptografadas do Finorya e Ajudante Elétrico criadas em 09/10/2026 às 18:42:43 America/Sao_Paulo, com verificação AES-GCM, schema, referências e hashes.
- Backup criptografado do D1/R2 público do Lingua Memory implementado, criado e restaurado em recursos isolados reais. Um exercício adicional preenchido com áudio validou senha, dados, progresso, acesso privado, Range, isolamento, gravação de novos dados e logout no bundle do app. Recursos temporários removidos.
- Chaves originais de Finorya e Ajudante preservadas; chave própria de 32 bytes criada para Lingua, sem reaproveitar credenciais de autenticação/provedores.
- `scripts/prepare-backup-custody.ps1` prepara as cópias verificadas mais recentes e um pacote separado das três chaves na pasta privada do proprietário. Os ZIPs são reabertos e cada arquivo é comparado por tamanho e SHA-256. Não inclui SQL aberto, credenciais Gmail, Mercado Pago ou Cloudflare.

Os arquivos privados e as evidências não integram o Git. A Central não tem um D1 próprio nessa arquitetura; seu código/configuração estão no repositório e a gestão usa os bancos dos três apps.

## Custódia externa concluída no Google Drive

O titular autorizou o Google Drive aberto na conta `jeanluis.dev@gmail.com`. A pasta [Central Simples - Backups criptografados](https://drive.google.com/drive/u/1/folders/1VWWb_x-JyKc9o7OdyvCI5zRY8-i8e5a4) recebeu os backups dos três apps, o pacote cifrado das três chaves e o script de recuperação. O Drive confirmou os uploads. Os dois pacotes foram baixados novamente pelo navegador e seus tamanhos e SHA-256 coincidiram com os originais. O diálogo de compartilhamento da pasta e do pacote das chaves mostrou somente o proprietário e acesso geral **Restrito**.

| Arquivo externo | Tamanho | SHA-256 conferido após download |
| --- | --- | --- |
| `backups-criptografados.zip` | 67.699 bytes | `541f9264a42df6eaaac245d72018521c07a34ca5efbba4963144e7782f1797b7` |
| `chaves-protegidas.cskeys` | 523 bytes | `a6a327a663cc12efed032c9d69b063887d53855bd5e3a26f6bfcf53e5ecf1b82` |

O bloqueio inicial de upload foi resolvido pelo titular ao habilitar a permissão de arquivos da extensão. A primeira janela de senha estava invisível; foi reaberta como ferramenta interativa visível. O titular definiu a senha localmente e confirmou sua guarda fora do Drive. O pacote protegido foi gerado e sua decifração integral foi conferida às 20:27:14 America/Sao_Paulo. A senha não foi recebida pelo agente nem enviada ao Drive.

Há uma unidade removível `D:` com rótulo `Backup`, mas ela não foi selecionada pelo titular e não recebeu arquivos nesta etapa.

Pasta privada preparada mais recente: `%USERPROFILE%/.central-simples/backup-custody/2026-10-09T21-53-26Z-2e7a9f65bc1f4291b7e3ef3278790972/`. Esse pacote contém o snapshot produtivo do Lingua repetido às 18:50:16 e comparado ao anterior: schema e hashes das 13 tabelas, incluindo seis migrações, preservados.

- `backups-criptografados.zip`: somente os snapshots cifrados dos três apps.
- `chaves-privadas.zip`: três chaves de decifração, arquivo privado **sem criptografia adicional**. Não armazenar/upload junto das cópias nem em pasta compartilhada.
- `custody-report.json`: inventário, hashes e estado; atualizado com `OffComputerConfirmed=true`, confirmações das duas transferências e de seus downloads. `KeyArchiveEncrypted=false` continua descrevendo o ZIP privado original; o pacote transferido tem `ProtectedKeyArchiveEncrypted=true`.

## Chaves no mesmo Google Drive

Use `scripts/protect-backup-keys.ps1` para proteger o ZIP privado antes de seu upload. A janela local solicita uma senha independente, sua confirmação e a confirmação do titular de que a guardou **fora do Google Drive**. Não informar essa senha no chat. Duas pastas na mesma conta não substituem a senha independente.

O formato `.cskeys` usa AES-256-GCM, PBKDF2-HMAC-SHA256 com 600.000 iterações, salt aleatório de 32 bytes, nonce de 12 bytes e tag de 16 bytes. O cabeçalho é autenticado, os parâmetros são fixos e a entrada é limitada a 1 MB. O ZIP precisa conter exatamente as três chaves de 32 bytes; antes de protegê-lo, o conteúdo é comparado ao inventário de custódia. O arquivo cifrado é reaberto e comparado ao ZIP original antes de emitir o relatório verificado. Senha e chave derivada não são gravadas em relatórios, argumentos de processo ou no repositório.

O pacote protegido pode ficar no Drive junto dos backups; **a senha de recuperação deve ficar em um gerenciador de senhas ou cópia física protegida fora dessa conta**. Nunca enviar `chaves-privadas.zip`. O titular confirmou essa guarda na janela local; o agente verificou a geração/decifração do pacote e a transferência, mas não inspecionou o local onde o titular guardou a senha.

No PowerShell 7 do Windows:

```powershell
./scripts/protect-backup-keys.ps1 -InputFile 'CAMINHO_PRIVADO/chaves-privadas.zip'
# Na recuperação, baixe o .cskeys e obtenha a senha guardada separadamente:
./scripts/protect-backup-keys.ps1 -Restore -InputFile 'CAMINHO_BAIXADO/chaves-protegidas.cskeys'
```

A recuperação gera `chaves-recuperadas.zip` em uma nova pasta privada com ACL restrita em `%USERPROFILE%/.central-simples/backup-custody/keys-restored-<UUID>`. Não sobrescreve as chaves atuais. O ZIP recuperado também precisa conter exatamente as três chaves esperadas. O formato binário v1 é: magic ASCII `CSKEYS1` + byte zero (8 bytes), salt (32), nonce (12), tag (16), ciphertext; os primeiros 52 bytes são os dados adicionais autenticados. A senha é codificada em UTF-8, sem normalização.

Validação local: `./scripts/protect-backup-keys.ps1 -SelfTest` passou recuperação, aleatoriedade, senha incorreta, adulteração de magic/salt/nonce/tag/ciphertext, truncamento e divergência do inventário ZIP. A confirmação externa vem separadamente do upload concluído no Drive e da comparação dos downloads.

## Uso

No PowerShell 7, na raiz da Central:

```powershell
./scripts/prepare-backup-custody.ps1
# Apenas após escolher a unidade externa: copia os backups, sem copiar chaves.
./scripts/prepare-backup-custody.ps1 -Destination 'D:\Central-Simples\Backups'
```

A opção de destino verifica unidade removível/USB e compara o hash do ZIP após a cópia. Destinos em nuvem precisam de upload efetivo confirmado no provedor; uma pasta sincronizada localmente não é prova suficiente. A custódia de chaves exige transferência própria para o local separado escolhido pelo titular.

As tarefas Windows dos dois apps continuam existentes. Este trabalho não cria agendamento em nuvem nem afirma proteção diária com o computador desligado. A rotina pública do Lingua é manual. Seus comandos, segurança e evidências estão em `Lingua Memory/docs/BACKUP-CLOUDFLARE-2026-10-09.md`.
