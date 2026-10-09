import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";

export const metadata: Metadata = { title: "Termos de uso — Central Simples" };

export default function TermsPage() {
  return (
    <LegalDocument title="Termos de uso">
      <section>
        <h2>1. Aplicativos e conta</h2>
        <p>A Central Simples reúne o catálogo de aplicativos. O Finorya organiza registros financeiros; o Ajudante Elétrico organiza clientes, serviços, orçamentos, ordens de serviço e registros financeiros. Cada aplicativo utiliza sua própria conta e licença.</p>
        <p>Informe dados corretos, mantenha suas credenciais protegidas e utilize somente dados e arquivos que você esteja autorizado a tratar. Não utilize os serviços para atividades ilícitas, acesso indevido a outras contas ou tentativas de contornar controles de segurança.</p>
      </section>
      <section>
        <h2>2. Teste gratuito</h2>
        <p>Quando oferecido, o teste gratuito permite usar o aplicativo por sete dias sem informar cartão de crédito. O teste não gera cobrança automática. Após seu término, a continuidade do acesso depende de uma licença válida.</p>
      </section>
      <section>
        <h2>3. Planos e pagamento</h2>
        <p>Preço, duração da licença e condições promocionais são apresentados na página do aplicativo e na finalização da compra. A compra é processada pelo Mercado Pago. A liberação de uma licença paga depende da confirmação do pagamento no servidor, não apenas do retorno do navegador.</p>
        <p>Promoções para fundadores estão sujeitas ao limite e às condições informadas no respectivo plano. Solicitações sobre pagamento, cancelamento ou reembolso podem ser encaminhadas ao suporte e serão tratadas considerando as condições da compra e a legislação aplicável.</p>
      </section>
      <section>
        <h2>4. Registros, sincronização e disponibilidade</h2>
        <p>Confira os dados, cálculos e documentos antes de utilizá-los ou enviá-los a terceiros. Os aplicativos auxiliam a organização dos registros e não substituem a avaliação técnica, contábil ou profissional necessária ao seu trabalho.</p>
        <p>A sincronização entre dispositivos depende de conexão e autenticação válidas. Alterações ainda não sincronizadas podem permanecer somente no dispositivo de origem. Utilize os recursos de exportação e backup disponíveis. Manutenções, falhas de conexão e indisponibilidade dos prestadores podem afetar o acesso temporariamente.</p>
      </section>
      <section>
        <h2>5. Recuperação de acesso e privacidade</h2>
        <p>A recuperação de acesso depende da conferência dos dados e das verificações de identidade exigidas pelo serviço. Perda de acesso ao e-mail deve ser encaminhada ao suporte; esse pedido não cria uma nova senha nem libera a conta automaticamente.</p>
        <p>O tratamento de dados é descrito na <a href="/privacidade">Política de privacidade</a>. Dúvidas ou solicitações podem ser enviadas para <a href="mailto:jeanluis.dev@gmail.com">jeanluis.dev@gmail.com</a>.</p>
      </section>
    </LegalDocument>
  );
}
