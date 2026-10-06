import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";

export const metadata: Metadata = { title: "Privacidade — Central Simples" };

export default function PrivacyPage() {
  return (
    <LegalDocument title="Política de privacidade">
      <section>
        <h2>1. Serviços e contato</h2>
        <p>Esta política descreve o tratamento de dados pela Central Simples, pelo Finorya e pelo Ajudante Elétrico. Cada aplicativo mantém sua própria conta e seus próprios dados. Para assuntos de privacidade, entre em contato pelo e-mail <a href="mailto:jeanluis.dev@gmail.com">jeanluis.dev@gmail.com</a>.</p>
      </section>
      <section>
        <h2>2. Dados utilizados</h2>
        <p>O cadastro, a compra e a recuperação de acesso podem utilizar nome, login, e-mail, CPF e telefone/WhatsApp. Os aplicativos também armazenam os registros que você insere: dados financeiros no Finorya e dados de clientes, produtos, serviços, orçamentos, ordens de serviço, fotos e movimentações financeiras no Ajudante Elétrico.</p>
        <p>Dados técnicos de sessão, requisições e tentativas de acesso são utilizados para autenticação, funcionamento e proteção contra abuso. Cookies de sessão e armazenamento no dispositivo permitem manter o acesso e os dados locais necessários ao funcionamento e à sincronização.</p>
      </section>
      <section>
        <h2>3. Finalidades e proteção</h2>
        <p>Os dados são utilizados para prestar o serviço, sincronizar registros entre dispositivos, administrar o acesso contratado, verificar contatos e atender solicitações de suporte. As senhas são verificadas por resumo criptográfico; o administrador não consulta a senha cadastrada. O CPF utilizado na recuperação é comparado por um resumo criptográfico protegido por chave.</p>
        <p>As permissões de conta são verificadas no servidor. Credenciais de serviços externos ficam fora do código público e do navegador dos usuários. Nenhuma medida técnica elimina todos os riscos; mantenha seus dispositivos e credenciais protegidos.</p>
      </section>
      <section>
        <h2>4. Gmail API e dados do Google</h2>
        <p>A integração com a Gmail API utiliza exclusivamente a permissão de enviar e-mails da conta remetente jeanluis.dev@gmail.com, autorizada por seu titular. Os clientes dos aplicativos não precisam autorizar acesso ao próprio Gmail.</p>
        <p>A integração não solicita leitura da caixa de entrada, contatos ou exclusão de mensagens. A credencial OAuth é armazenada de forma restrita para renovar o acesso ao envio. Os destinatários, assuntos e conteúdos necessários a códigos de verificação, avisos de acesso e atendimento ao suporte são transmitidos ao Google para entrega das mensagens. As mensagens enviadas também ficam sujeitas ao armazenamento e às configurações da conta Gmail remetente.</p>
        <p>Os dados obtidos pela integração com as APIs do Google são utilizados somente para essas funções e não são vendidos nem utilizados para publicidade. O uso e a transferência desses dados seguem a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política de Dados do Usuário dos Serviços de API do Google</a>, incluindo seus requisitos de uso limitado. O titular pode revogar a autorização nas configurações de segurança da sua conta Google.</p>
      </section>
      <section>
        <h2>5. Prestadores e atendimento</h2>
        <p>A Cloudflare fornece hospedagem e armazenamento do serviço. O Mercado Pago processa compras; informações de pagamento são tratadas em seus próprios ambientes. Quando habilitados, os serviços de entrega de e-mail e WhatsApp recebem os dados necessários à mensagem. A ativação de cada integração depende da configuração do respectivo provedor.</p>
        <p>Ao solicitar recuperação manual, os dados informados no formulário são encaminhados ao suporte em jeanluis.dev@gmail.com. O pedido utiliza somente os dígitos finais do CPF na mensagem de atendimento. A solicitação não concede acesso automaticamente e pode exigir verificações adicionais.</p>
      </section>
      <section>
        <h2>6. Conservação e solicitações</h2>
        <p>Os registros do aplicativo são mantidos para prestar o serviço à conta. Encerrar uma assinatura não equivale a solicitar exclusão dos dados. Mensagens de suporte e registros necessários à segurança, a pagamentos e ao cumprimento de obrigações podem ser conservados conforme sua finalidade.</p>
        <p>Você pode solicitar informações sobre seus dados, correção, exportação ou exclusão pelo contato acima. Antes de atender pedidos que afetem dados ou acesso, o suporte verifica a identidade do solicitante. Dados de outras pessoas inseridos nos aplicativos devem ser tratados por você de forma autorizada e adequada à finalidade do serviço.</p>
      </section>
    </LegalDocument>
  );
}
