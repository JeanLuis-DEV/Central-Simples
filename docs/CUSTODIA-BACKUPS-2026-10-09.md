# Custódia de backups — 09/10/2026

## Concluído

- Novas cópias integrais criptografadas do Finorya e Ajudante Elétrico criadas em 09/10/2026 às 18:42:43 America/Sao_Paulo, com verificação AES-GCM, schema, referências e hashes.
- Backup criptografado do D1/R2 público do Lingua Memory implementado, criado e restaurado em recursos isolados reais. Um exercício adicional preenchido com áudio validou senha, dados, progresso, acesso privado, Range, isolamento, gravação de novos dados e logout no bundle do app. Recursos temporários removidos.
- Chaves originais de Finorya e Ajudante preservadas; chave própria de 32 bytes criada para Lingua, sem reaproveitar credenciais de autenticação/provedores.
- `scripts/prepare-backup-custody.ps1` prepara as cópias verificadas mais recentes e um pacote separado das três chaves na pasta privada do proprietário. Os ZIPs são reabertos e cada arquivo é comparado por tamanho e SHA-256. Não inclui SQL aberto, credenciais Gmail, Mercado Pago ou Cloudflare.

Os arquivos privados e as evidências não integram o Git. A Central não tem um D1 próprio nessa arquitetura; seu código/configuração estão no repositório e a gestão usa os bancos dos três apps.

## Transferência ainda pendente

Foi solicitada ao titular a indicação do destino externo das cópias e de um local separado para as chaves. Há uma unidade removível `D:` com rótulo `Backup`, mas ela não foi selecionada como destino pelo titular nesta etapa. **Não há confirmação de cópias/chaves guardadas fora deste computador.** Preparação local não equivale a custódia externa.

Pasta privada preparada mais recente: `%USERPROFILE%/.central-simples/backup-custody/2026-10-09T21-53-26Z-2e7a9f65bc1f4291b7e3ef3278790972/`. Esse pacote contém o snapshot produtivo do Lingua repetido às 18:50:16 e comparado ao anterior: schema e hashes das 13 tabelas, incluindo seis migrações, preservados.

- `backups-criptografados.zip`: somente os snapshots cifrados dos três apps.
- `chaves-privadas.zip`: três chaves de decifração, arquivo privado **sem criptografia adicional**. Não armazenar/upload junto das cópias nem em pasta compartilhada.
- `custody-report.json`: inventário, hashes e estado; `OffComputerConfirmed=false` enquanto a transferência das duas partes não for comprovada.

## Uso

No PowerShell 7, na raiz da Central:

```powershell
./scripts/prepare-backup-custody.ps1
# Apenas após escolher a unidade externa: copia os backups, sem copiar chaves.
./scripts/prepare-backup-custody.ps1 -Destination 'D:\Central-Simples\Backups'
```

A opção de destino verifica unidade removível/USB e compara o hash do ZIP após a cópia. Destinos em nuvem precisam de upload efetivo confirmado no provedor; uma pasta sincronizada localmente não é prova suficiente. A custódia de chaves exige transferência própria para o local separado escolhido pelo titular.

As tarefas Windows dos dois apps continuam existentes. Este trabalho não cria agendamento em nuvem nem afirma proteção diária com o computador desligado. A rotina pública do Lingua é manual. Seus comandos, segurança e evidências estão em `Lingua Memory/docs/BACKUP-CLOUDFLARE-2026-10-09.md`.
