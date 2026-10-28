const productUrl = (value: string | undefined, fallback: string) => {
  const url = new URL(value || fallback);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("Endereço de aplicativo inválido.");
  return url.origin;
};
export const apps = [
  {
    id: "finorya",
    name: "Finorya",
    subtitle: "Gestão Financeira",
    category: "Finanças",
    label: "FINANÇAS PESSOAIS",
    image: "/apps/finorya.png",
    mobileImage: "/apps/finorya-mobile.png",
    mobileScreen: "Visão geral",
    mobileWidth: 390,
    mobileHeight: 844,
    width: 1440,
    height: 1100,
    description:
      "Clareza para o seu dinheiro. Tranquilidade para os seus próximos planos.",
    detail:
      "Organize receitas, despesas e compromissos em um só espaço. Crie perfis de gastos ilimitados, todo controle em sua mão.",
    features: [
      "Parcelamento de lançamentos",
      "Recorrências mensais",
      "Saldo realizado e previsto",
      "Controle de contas em atraso",
      "Perfis financeiros separados",
      "Categoria criada no lançamento",
      "Gráficos de evolução e categorias",
      "Calculadora com envio ao lançamento",
      "Relatórios por período",
      "Relatórios em CSV",
      "Relatórios em PDF",
      "Backup e restauração",
    ],
    site: productUrl(
      process.env.NEXT_PUBLIC_FINORYA_URL,
      "http://127.0.0.1:5180",
    ),
  },
  {
    id: "ajudante",
    name: "Ajudante Elétrico",
    subtitle: "Seu trabalho mais organizado",
    category: "Serviços",
    label: "SERVIÇOS E ORÇAMENTOS",
    image: "/apps/ajudante.jpg",
    mobileImage: "/apps/ajudante-orcamentos-mobile.jpg",
    mobileScreen: "Orçamentos",
    mobileWidth: 375,
    mobileHeight: 812,
    width: 1440,
    height: 1000,
    description:
      "Menos tempo com a organização. Mais tempo para fazer acontecer.",
    detail:
      "Reúna clientes, serviços, orçamentos e o financeiro do seu trabalho. Uma ferramenta pensada para acompanhar a rotina do eletricista.",
    features: [
      "Edição de orçamento e OS",
      "Orçamento em PDF",
      "Nota de serviço em PDF",
      "PDF de serviço com fotos",
      "Orçamento via WhatsApp",
      "OS a partir do orçamento",
      "Adicionais na ordem de serviço",
      "Descontos em reais ou percentual",
      "Termos de garantia no orçamento",
      "Custos e margens por item",
      "Documentos com logo da empresa",
      "Consulta de endereço pelo CEP",
      "Validação de CPF e CNPJ",
      "Recebimentos vinculados à OS",
      "Fluxo de caixa em gráfico",
      "Backup e restauração",
    ],
    site: productUrl(
      process.env.NEXT_PUBLIC_AJUDANTE_URL,
      "http://127.0.0.1:5173",
    ),
  },
  {
    id: "meu-negocio",
    name: "Meu Negócio",
    subtitle: "Gestão de vendas e estoque",
    category: "Negócios",
    label: "VENDAS E GESTÃO COMERCIAL",
    image: "/apps/meu-negocio.png",
    mobileImage: "/apps/meu-negocio-mobile.png",
    mobileScreen: "Resumo comercial",
    mobileWidth: 390,
    mobileHeight: 1866,
    width: 1440,
    height: 1000,
    description:
      "Do pedido à entrega. Seu negócio organizado em um só lugar.",
    detail:
      "Acompanhe vendas, clientes, produtos, fornecedores e estoque. Organize entregas e recebimentos e veja os resultados do seu negócio com clareza.",
    features: [
      "Resumo comercial e últimas vendas",
      "Vendas à vista, a prazo e parceladas",
      "Clientes e fornecedores",
      "Produtos e controle de estoque",
      "Agendamento e acompanhamento de entregas",
      "Recebimentos e parcelas pendentes",
      "Custos, lucro bruto e margens",
      "Relatórios comerciais em CSV e PDF",
      "Financeiro com receitas e despesas",
      "Backup e restauração",
    ],
    site: productUrl(
      process.env.NEXT_PUBLIC_MEU_NEGOCIO_URL,
      "http://127.0.0.1:5181",
    ),
  },
  {
    id: "lingua-memory",
    name: "Lingua Memory",
    subtitle: "Aprendizado de idiomas",
    category: "Idiomas",
    label: "ESTUDO DE IDIOMAS",
    image: "/apps/lingua-memory.png",
    mobileImage: "/apps/lingua-memory-mobile.png",
    mobileScreen: "Visão geral",
    mobileWidth: 390,
    mobileHeight: 1111,
    width: 1440,
    height: 1066,
    description:
      "Transforme frases reais em prática constante e avance no seu ritmo.",
    detail:
      "Guarde frases, revise no momento certo e pratique sua pronúncia em um espaço feito para o aprendizado de idiomas.",
    features: [
      "Frases e traduções editáveis",
      "Flashcards com repetição espaçada",
      "Categorias e níveis de estudo",
      "Gravações privadas de pronúncia",
      "Progresso e histórico de revisões",
      "Exportação e reset dos dados",
    ],
    site: productUrl(
      process.env.NEXT_PUBLIC_LINGUA_MEMORY_URL,
      "http://127.0.0.1:5200",
    ),
  },
] as const;
export type CatalogApp = (typeof apps)[number];
