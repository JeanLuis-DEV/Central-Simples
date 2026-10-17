# Responsividade e console — 17/10/2026

## Resultado em produção

Verificação no Chrome autenticado, na URL https://centralsimples.com.br, após a
publicação `5989f685-4031-4fa1-9ed8-d88df3e62a08`.

- Dezenove larguras verificadas: 275, 320, 360, 375, 390, 412, 430, 440, 480,
  540, 600, 768, 820, 850, 851, 1024, 1280, 1440 e 1920 px.
- Celulares/tablets com emulação mobile, densidade 3 e escala visual 1;
  desktop com densidade 1. Orientação horizontal também verificada em 956 × 440.
- A largura do documento ficou contida na área visível em todos os casos,
  sem transbordamento horizontal de cabeçalho, texto principal, botão,
  cards ou rodapé.
- Quinze verificações de diálogos: quatro produtos e seletor de acesso em
  320, 390 e 440 px. Abertura/fechamento pelo teclado funcionaram; limites
  externos e conteúdo horizontal ficaram contidos na tela. O seletor manteve
  os quatro links corretos. O conteúdo longo pode exigir rolagem vertical.
- A largura exata do iPhone citado, 440 × 956, apresentou o cabeçalho, botão
  principal e cards inteiros. O corte da captura enviada não foi reproduzido
  após recarregar e usar escala visual normal. Não há evidência suficiente para
  atribuir aquele corte a uma regra CSS específica.

Isso valida a emulação no Chrome; não é teste em iPhone físico/Safari. Não foi
necessário alterar o CSS nem publicar outra versão para obter esses resultados.

## Erros do console

O erro CORS foi reproduzido no `beacon.min.js` de `static.cloudflareinsights.com`,
injetado automaticamente pela Cloudflare para métricas. Não é o código de
cadastro, de autenticação ou de comunicação com os bancos.

- Dentro do navegador: HTTP 499, conteúdo `image/png` com 67 bytes e sem
  `Access-Control-Allow-Origin`; por isso o script é recusado e aparece
  `net::ERR_FAILED`.
- Consulta direta ao mesmo recurso público, com o Origin da Central: HTTP 200,
  JavaScript e `Access-Control-Allow-Origin: *`.
- Foi observada a integração do Kaspersky nas requisições do navegador. A
  diferença entre as respostas indica interceptação/bloqueio local; o Kaspersky
  é o provável responsável, mas seu módulo específico não foi isolado.
- Os arquivos JavaScript da Central responderam 200 e os diálogos funcionaram.
  Não foram observadas exceções JavaScript da aplicação na execução monitorada.

Não foram modificadas proteções do antivírus, extensões, permissões CORS das
APIs ou métricas da Cloudflare para contornar um bloqueio local de rastreamento.
Adicionar cabeçalhos CORS aos endpoints da Central não corrigiria a resposta
desse recurso externo.

## Evidências

Medições e captura local em `artifacts/responsividade-2026-10-17/`, fora do Git.
Em caso de corte apenas no DevTools, reiniciar a emulação e recarregar, conferindo
o zoom e a largura visual efetiva antes de atribuir a falha ao layout.

Fontes primárias: [Cloudflare: bloqueadores e erros do beacon](https://developers.cloudflare.com/web-analytics/faq/)
e [Kaspersky: proteção contra rastreamento](https://support.kaspersky.com/help/Kaspersky/Win21.5/en-US/93724.htm).
