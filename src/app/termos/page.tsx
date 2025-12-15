import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
          <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Ao acessar e usar a plataforma PartyU, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. 
              Se você não concorda com qualquer parte destes termos, não deve usar nossos serviços.
            </p>
            <p className="text-gray-700">
              A PartyU é uma plataforma digital desenvolvida pela <strong>Bresus Servicos Digtais Ltda</strong>, 
              CNPJ 55.654.824/0001-77, que facilita a compra, venda e revenda de ingressos para eventos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição dos Serviços</h2>
            <p className="text-gray-700 mb-4">
              A PartyU oferece os seguintes serviços:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Plataforma para organizadores criarem e gerenciarem eventos</li>
              <li>Sistema de venda de ingressos online</li>
              <li>Plataforma de revenda oficial e segura de ingressos</li>
              <li>Processamento de pagamentos via PIX</li>
              <li>Gerenciamento de carteira digital</li>
              <li>Validação de ingressos através de QR codes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cadastro e Conta de Usuário</h2>
            <p className="text-gray-700 mb-4">
              Para utilizar nossos serviços, você precisa criar uma conta fornecendo informações precisas, 
              completas e atualizadas. Você é responsável por:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Manter a confidencialidade de sua senha</li>
              <li>Todas as atividades que ocorrem em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Responsabilidades do Organizador</h2>
            <p className="text-gray-700 mb-4">
              Organizadores que utilizam a plataforma para criar eventos são responsáveis por:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Fornecer informações precisas sobre o evento</li>
              <li>Garantir que o evento seja realizado conforme descrito</li>
              <li>Respeitar os direitos dos compradores de ingressos</li>
              <li>Gerenciar adequadamente a capacidade e segurança do evento</li>
              <li>Pagar as taxas da plataforma conforme acordado</li>
              <li>Cumprir todas as leis e regulamentações aplicáveis</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Compra e Revenda de Ingressos</h2>
            <p className="text-gray-700 mb-4">
              <strong>Compra de Ingressos:</strong> Ao comprar um ingresso através da PartyU, você recebe uma licença 
              revogável para participar do evento específico. Os ingressos são pessoais e intransferíveis, exceto através 
              do sistema de revenda oficial da plataforma.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Revenda de Ingressos:</strong> A PartyU oferece um sistema de revenda oficial que permite aos 
              usuários revenderem seus ingressos de forma segura. A revenda está sujeita a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Limites de preço estabelecidos pelo organizador</li>
              <li>Taxas aplicáveis conforme divulgado</li>
              <li>Validação de identidade para prevenir fraudes</li>
              <li>Regras específicas de cada evento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Taxas e Pagamentos</h2>
            <p className="text-gray-700 mb-4">
              A PartyU cobra taxas sobre as transações realizadas na plataforma:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Taxa do Organizador:</strong> 10% sobre o valor do ingresso vendido</li>
              <li><strong>Taxa de Revenda:</strong> Conforme estabelecido pelo organizador (mínimo 5%)</li>
              <li><strong>Taxa de Processamento:</strong> Taxas de processamento de pagamento podem ser aplicadas</li>
            </ul>
            <p className="text-gray-700">
              Todas as taxas são claramente divulgadas antes da conclusão da transação. Os pagamentos são processados 
              através de PIX e outras formas de pagamento aceitas pela plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancelamentos e Reembolsos</h2>
            <p className="text-gray-700 mb-4">
              <strong>Cancelamento pelo Organizador:</strong> Se um evento for cancelado pelo organizador, os compradores 
              terão direito a reembolso integral, exceto taxas de processamento quando aplicável.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Cancelamento pelo Comprador:</strong> Os termos de cancelamento e reembolso variam conforme a política 
              de cada evento. Consulte as informações específicas do evento antes da compra.
            </p>
            <p className="text-gray-700">
              <strong>Reembolsos:</strong> Os reembolsos serão processados dentro de 5 a 10 dias úteis após a aprovação, 
              utilizando o mesmo método de pagamento original.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 mb-4">
              A PartyU atua como intermediária entre organizadores e compradores. Não somos responsáveis por:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>A organização, execução ou qualidade dos eventos</li>
              <li>Danos ou lesões ocorridas durante os eventos</li>
              <li>Cancelamentos ou alterações de eventos pelos organizadores</li>
              <li>Disputas entre organizadores e participantes</li>
              <li>Problemas técnicos ou de conectividade durante eventos</li>
            </ul>
            <p className="text-gray-700">
              Nossa responsabilidade está limitada ao valor pago pelo ingresso através da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Propriedade Intelectual</h2>
            <p className="text-gray-700 mb-4">
              Todo o conteúdo da plataforma PartyU, incluindo design, logotipos, textos, gráficos e software, 
              é propriedade da Bresus Servicos Digtais Ltda e está protegido por leis de propriedade intelectual.
            </p>
            <p className="text-gray-700">
              Você não pode copiar, modificar, distribuir ou criar trabalhos derivados do conteúdo da plataforma 
              sem autorização prévia por escrito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificações dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Reservamos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão 
              em vigor imediatamente após a publicação na plataforma.
            </p>
            <p className="text-gray-700">
              É sua responsabilidade revisar periodicamente estes termos. O uso continuado da plataforma após 
              alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Lei Aplicável e Jurisdição</h2>
            <p className="text-gray-700 mb-4">
              Estes Termos de Uso são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos 
              tribunais competentes do Brasil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 mb-4">
              Para questões sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li><strong>Email:</strong> agenciabdadigital@gmail.com</li>
              <li><strong>Empresa:</strong> Bresus Servicos Digtais Ltda</li>
              <li><strong>CNPJ:</strong> 55.654.824/0001-77</li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Ao usar a plataforma PartyU, você confirma que leu, entendeu e concorda com estes Termos de Uso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
