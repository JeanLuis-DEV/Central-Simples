import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";

export const metadata: Metadata = { title: "Privacidade — Central Simples" };

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de privacidade"
      updatedAt="17 de outubro de 2026"
    >
      <section>
        <h2>1. Serviços e contato</h2>
        <p>
          Esta política descreve o tratamento de dados pela Central Simples,
          pelo Finorya, pelo Ajudante Elétrico, pelo Meu Negócio e pelo Lingua
          Memory. Cada aplicativo mantém sua própria conta e seus próprios
          dados. Para assuntos de privacidade, entre em contato pelo e-mail{" "}
          <a href="mailto:jeanluis.dev@gmail.com">jeanluis.dev@gmail.com</a>.
        </p>
      </section>
      <section>
        <h2>2. Dados utilizados</h2>
        <p>
          Os cadastros públicos utilizam nome, e-mail, login e senha, com
          confirmação do e-mail por código. A recuperação de acesso utiliza o
          e-mail confirmado. CPF e telefone não são exigidos para criar a conta;
          podem ser necessários em operações comerciais ou pelo provedor de
          pagamento, na etapa correspondente. Os aplicativos também armazenam os
          registros que você insere: dados financeiros no Finorya e dados de
          clientes, produtos, fornecedores, vendas e entregas no Meu Negócio,
          além de serviços, orçamentos, ordens de serviço, fotos e movimentações
          no Ajudante Elétrico.
        </p>
        <p>
          O Lingua Memory utiliza nome, e-mail, login e senha no cadastro, sem
          exigir CPF ou telefone. A confirmação por código precede a criação da
          conta. Idioma e preferências podem ser configurados depois do acesso.
          Também armazena frases, palavras, traduções, progresso e gravações de
          pronúncia que você decide salvar. O acesso ao microfone depende de sua
          permissão no navegador.
        </p>
        <p>
          O Meu Negócio armazena os dados comerciais que você cadastra: clientes
          e fornecedores, contatos e endereços de entrega, produtos, estoque,
          vendas, recebimentos, parcelas e registros financeiros. Esses dados
          são utilizados para organizar sua atividade comercial, gerar
          relatórios e acompanhar pedidos e entregas.
        </p>
        <p>
          Dados técnicos de sessão, requisições e tentativas de acesso são
          utilizados para autenticação, funcionamento e proteção contra abuso.
          Cookies de sessão e armazenamento no dispositivo permitem manter o
          acesso e os dados locais necessários ao funcionamento e à
          sincronização.
        </p>
      </section>
      <section>
        <h2>3. Finalidades e proteção</h2>
        <p>
          Os dados são utilizados para prestar o serviço, sincronizar registros
          entre dispositivos, administrar o acesso contratado, verificar o
          e-mail de acesso e atender solicitações de suporte. As senhas são
          verificadas por resumo criptográfico; o administrador não consulta a
          senha cadastrada. A recuperação exige confirmação de código enviado ao
          e-mail confirmado da conta.
        </p>
        <p>
          As permissões de conta são verificadas no servidor. Credenciais de
          serviços externos ficam fora do código público e do navegador dos
          usuários. Nenhuma medida técnica elimina todos os riscos; mantenha
          seus dispositivos e credenciais protegidos.
        </p>
      </section>
      <section>
        <h2>4. Gmail API e dados do Google</h2>
        <p>
          Os aplicativos Finorya, Ajudante Elétrico, Meu Negócio e Lingua Memory
          utilizam a Gmail API exclusivamente com o escopo{" "}
          <code>https://www.googleapis.com/auth/gmail.send</code>, para enviar
          códigos de cadastro e recuperação, confirmação do cadastro para compra
          quando aplicável, solicitações de suporte e alertas operacionais
          quando habilitados. A conta remetente é jeanluis.dev@gmail.com,
          autorizada por seu titular. Os clientes dos aplicativos não precisam
          autorizar acesso ao próprio Gmail.
        </p>
        <p>
          Os dados do Google tratados pela integração incluem a autorização
          OAuth, os tokens de acesso e renovação e as respostas técnicas que
          confirmam o envio. O endereço remetente é configurado pelo
          responsável. Não lemos, listamos ou excluímos mensagens, não acessamos
          contatos nem anexos existentes na conta e não importamos sua caixa
          postal para os aplicativos.
        </p>
        <p>
          Para enviar uma mensagem, transmitimos ao Google o remetente,
          destinatário, assunto e conteúdo necessários à função solicitada.
          Códigos são enviados ao e-mail informado pelo usuário; solicitações de
          suporte e alertas operacionais são enviados ao responsável em
          jeanluis.dev@gmail.com. O suporte inclui os dados declarados no
          formulário, sem solicitar CPF ou telefone da conta. Alertas
          operacionais não incluem dados pessoais de clientes. As mensagens
          enviadas ficam na conta Gmail remetente e na caixa do destinatário,
          sujeitas às configurações dessas contas.
        </p>
        <h3>Com quem compartilhamos dados do Google</h3>
        <p>
          Compartilhamos ou transferimos os dados dessa integração somente com
          os seguintes destinatários e para estas finalidades:
        </p>
        <p>
          <strong>Google:</strong> recebe as credenciais OAuth necessárias à
          autorização e renovação e processa os dados das mensagens para
          enviá-las pela Gmail API. <strong>Cloudflare:</strong> fornece o
          ambiente de execução dos servidores; nele são processadas as mensagens
          e guardadas as credenciais OAuth nos segredos privados dos Workers,
          com acesso restrito à administração autorizada.
        </p>
        <p>
          <strong>Destinatário da mensagem e seu provedor de e-mail:</strong>{" "}
          recebem o conteúdo e os endereços necessários à entrega, mas não
          recebem nossos tokens ou credenciais OAuth.{" "}
          <strong>Responsável autorizado pelo suporte:</strong> pode acessar as
          mensagens encaminhadas ao atendimento e os avisos operacionais,
          somente para atender a solicitação, verificar incidentes e manter o
          serviço.
        </p>
        <p>
          Não vendemos dados do Google nem os compartilhamos, transferimos ou
          divulgamos a terceiros para publicidade, criação de perfis,
          treinamento de modelos gerais de inteligência artificial ou outras
          finalidades diferentes das funções de envio, suporte e segurança
          descritas nesta política. Não disponibilizamos credenciais OAuth a
          clientes ou a destinatários de mensagens.
        </p>
        <h3>Como protegemos os dados do Google</h3>
        <p>
          Usamos conexões HTTPS com criptografia TLS para proteger os dados em
          trânsito entre o navegador, nossos servidores e as APIs do Google.
          Tokens de renovação e segredos OAuth ficam nos segredos privados dos
          Workers, fora do código publicado e do navegador dos clientes. O
          acesso administrativo é restrito; tokens de acesso temporários são
          utilizados no servidor e não aparecem em URLs públicas ou mensagens de
          e-mail.
        </p>
        <p>
          As APIs verificam autenticação, origem e permissões no servidor e
          isolam os dados por conta. Cookies de sessão usam HttpOnly, SameSite e
          Secure em HTTPS; senhas são armazenadas como hashes scrypt com salt
          individual. Códigos de confirmação são armazenados como HMAC, expiram
          e têm limites de tentativas e reenvio. Não registramos tokens, senhas,
          códigos ou conteúdo das mensagens nos logs públicos da aplicação. As
          cópias operacionais dos bancos são criptografadas com AES-256-GCM e
          têm chaves protegidas separadamente; não incluem os segredos OAuth dos
          Workers.
        </p>
        <h3>Conservação, revogação e uso limitado</h3>
        <p>
          Conservamos a credencial de renovação enquanto a integração de envio
          estiver autorizada e em uso. Tokens de acesso são temporários; as
          respostas de envio são usadas para confirmar a operação, sem leitura
          da caixa postal. O titular da conta remetente pode revogar o acesso
          nas configurações de segurança da conta Google ou solicitar a remoção
          da credencial ao suporte. Após a revogação, a integração não consegue
          renovar a autorização para novos envios.
        </p>
        <p>
          Revogar a autorização ou excluir uma conta do aplicativo não apaga
          automaticamente mensagens já entregues. Mensagens na conta remetente
          ou do destinatário seguem as configurações e os controles de exclusão
          do respectivo provedor; solicitações de remoção dos registros de
          suporte podem ser encaminhadas ao contato desta política, ressalvadas
          as necessidades de segurança e obrigações aplicáveis.
        </p>
        <p>
          O uso e a transferência de informações recebidas das APIs do Google
          seguem a{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo seus requisitos de uso limitado.
        </p>
      </section>
      <section>
        <h2>5. Prestadores e atendimento</h2>
        <p>
          A Cloudflare fornece hospedagem e armazenamento do serviço. O Mercado
          Pago processa compras; informações de pagamento são tratadas em seus
          próprios ambientes. O Gmail configurado em cada aplicativo recebe
          apenas os dados necessários aos códigos e mensagens de e-mail.
        </p>
        <p>
          Cópias operacionais criptografadas podem ser guardadas no Google Drive
          privado do responsável, com acesso restrito e chaves protegidas. Essa
          custódia é independente do escopo de envio Gmail. No Lingua Memory, ao
          clicar em Traduzir frase original, a frase e o idioma são enviados ao
          serviço MyMemory para obter uma sugestão de tradução; o texto pode ser
          preenchido manualmente sem esse envio.
        </p>
        <p>
          No Meu Negócio, ao abrir uma rota de entrega no Google Maps ou no
          Waze, o endereço escolhido é encaminhado ao respectivo serviço. Ao
          utilizar os atalhos de WhatsApp para contato ou aviso de entrega, o
          telefone e a mensagem preparada são abertos nesse serviço; o envio
          depende de sua ação. Esses recursos são opcionais e independentes da
          confirmação de conta por e-mail.
        </p>
        <p>
          Ao solicitar recuperação manual, os dados informados no formulário são
          encaminhados ao suporte em jeanluis.dev@gmail.com. O pedido informa o
          nome, login quando aplicável, e-mail da conta, e-mail para retorno e
          descrição do problema. A solicitação não concede acesso
          automaticamente e pode exigir verificações adicionais.
        </p>
      </section>
      <section>
        <h2>6. Conservação e solicitações</h2>
        <p>
          Os registros do aplicativo são mantidos para prestar o serviço à
          conta. Encerrar uma assinatura não equivale a solicitar exclusão dos
          dados. Mensagens de suporte e registros necessários à segurança, a
          pagamentos e ao cumprimento de obrigações podem ser conservados
          conforme sua finalidade.
        </p>
        <p>
          Você pode solicitar informações sobre seus dados, correção, exportação
          ou exclusão pelo contato acima. Antes de atender pedidos que afetem
          dados ou acesso, o suporte verifica a identidade do solicitante. Dados
          de outras pessoas inseridos nos aplicativos devem ser tratados por
          você de forma autorizada e adequada à finalidade do serviço.
        </p>
      </section>
    </LegalDocument>
  );
}
