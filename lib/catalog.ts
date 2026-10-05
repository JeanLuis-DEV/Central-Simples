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
      "Organize receitas, despesas e compromissos em um espaço só. Veja o que entra, o que sai e o que ainda precisa da sua atenção.",
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
] as const;
export type CatalogApp = (typeof apps)[number];
