import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoliticaPrivacidadePage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
          <p className="text-gray-600 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introdução</h2>
            <p className="text-gray-700 mb-4">
              A <strong>Bresus Servicos Digtais Ltda</strong> ("Partyu", "nós", "nosso" ou "nossa"), 
              CNPJ 55.654.824/0001-77, respeita sua privacidade e está comprometida em proteger seus dados pessoais.
            </p>
            <p className="text-gray-700">
              Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações 
              pessoais quando você utiliza nossa plataforma PartyU. Ao usar nossos serviços, você concorda com a coleta 
              e uso de informações de acordo com esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1. Informações Fornecidas por Você</h3>
            <p className="text-gray-700 mb-4">Coletamos informações que você nos fornece diretamente:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Dados de Cadastro:</strong> Nome completo, email, telefone, CPF/CNPJ</li>
              <li><strong>Dados de Pagamento:</strong> Informações de cartão de crédito, chave PIX, dados bancários</li>
              <li><strong>Dados de Perfil:</strong> Foto de perfil, preferências, histórico de eventos</li>
              <li><strong>Dados de Eventos:</strong> Informações sobre eventos criados (se organizador)</li>
              <li><strong>Comunicações:</strong> Mensagens enviadas através da plataforma</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2. Informações Coletadas Automaticamente</h3>
            <p className="text-gray-700 mb-4">Quando você usa nossa plataforma, coletamos automaticamente:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Dados de Uso:</strong> Páginas visitadas, tempo de permanência, cliques</li>
              <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
              <li><strong>Dados de Dispositivo:</strong> Identificador único, modelo, versão do sistema</li>
              <li><strong>Cookies e Tecnologias Similares:</strong> Para melhorar sua experiência</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3. Informações de Terceiros</h3>
            <p className="text-gray-700">
              Podemos receber informações sobre você de terceiros, como processadores de pagamento, 
              provedores de autenticação e redes sociais (quando você se conecta através delas).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Como Usamos Suas Informações</h2>
            <p className="text-gray-700 mb-4">Utilizamos suas informações pessoais para:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Fornecer Serviços:</strong> Processar transações, gerenciar sua conta, validar ingressos</li>
              <li><strong>Comunicação:</strong> Enviar confirmações, atualizações e notificações sobre eventos</li>
              <li><strong>Melhorar a Plataforma:</strong> Analisar uso, desenvolver novos recursos, personalizar experiência</li>
              <li><strong>Segurança:</strong> Prevenir fraudes, detectar atividades suspeitas, proteger usuários</li>
              <li><strong>Suporte:</strong> Responder a solicitações, resolver problemas técnicos</li>
              <li><strong>Marketing:</strong> Enviar ofertas e promoções (com seu consentimento)</li>
              <li><strong>Conformidade Legal:</strong> Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
            <p className="text-gray-700 mb-4">Podemos compartilhar suas informações nas seguintes situações:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1. Com Organizadores de Eventos</h3>
            <p className="text-gray-700 mb-4">
              Quando você compra um ingresso, compartilhamos informações necessárias com o organizador 
              do evento (nome, email, informações de ingresso) para permitir a validação e comunicação sobre o evento.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2. Com Prestadores de Serviços</h3>
            <p className="text-gray-700 mb-4">
              Compartilhamos dados com terceiros que nos ajudam a operar a plataforma:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Processadores de pagamento</li>
              <li>Provedores de hospedagem e infraestrutura</li>
              <li>Serviços de análise e marketing</li>
              <li>Provedores de suporte ao cliente</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3. Por Motivos Legais</h3>
            <p className="text-gray-700 mb-4">
              Podemos divulgar informações se necessário para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Cumprir leis, regulamentos ou processos legais</li>
              <li>Proteger direitos, propriedade ou segurança da PartyU e usuários</li>
              <li>Prevenir fraudes ou atividades ilegais</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4. Com Seu Consentimento</h3>
            <p className="text-gray-700">
              Compartilhamos informações com terceiros quando você nos dá consentimento explícito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança dos Dados</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Criptografia SSL/TLS para transmissão de dados</li>
              <li>Armazenamento seguro em servidores protegidos</li>
              <li>Controles de acesso e autenticação</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares dos dados</li>
            </ul>
            <p className="text-gray-700">
              No entanto, nenhum método de transmissão ou armazenamento é 100% seguro. 
              Embora nos esforcemos para proteger seus dados, não podemos garantir segurança absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="text-gray-700 mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
              <li><strong>Anonimização ou Eliminação:</strong> Solicitar exclusão de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> Solicitar exclusão de dados tratados com consentimento</li>
              <li><strong>Revogação de Consentimento:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se ao tratamento de dados em certas circunstâncias</li>
            </ul>
            <p className="text-gray-700">
              Para exercer seus direitos, entre em contato conosco através do email: agenciabdadigital@gmail.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies e Tecnologias Similares</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Manter você conectado à plataforma</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar como você usa a plataforma</li>
              <li>Personalizar conteúdo e anúncios</li>
            </ul>
            <p className="text-gray-700">
              Você pode controlar cookies através das configurações do seu navegador. 
              No entanto, desabilitar cookies pode afetar a funcionalidade da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Retenção de Dados</h2>
            <p className="text-gray-700 mb-4">
              Mantemos seus dados pessoais apenas pelo tempo necessário para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Fornecer nossos serviços</li>
              <li>Cumprir obrigações legais</li>
              <li>Resolver disputas</li>
              <li>Fazer cumprir nossos acordos</li>
            </ul>
            <p className="text-gray-700">
              Quando não houver mais necessidade de reter seus dados, eles serão excluídos ou anonimizados 
              de forma segura, exceto quando a retenção for exigida por lei.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacidade de Menores</h2>
            <p className="text-gray-700 mb-4">
              Nossos serviços são destinados a pessoas com 18 anos ou mais. Não coletamos intencionalmente 
              dados pessoais de menores de idade.
            </p>
            <p className="text-gray-700">
              Se tomarmos conhecimento de que coletamos dados de um menor sem consentimento dos pais, 
              tomaremos medidas para excluir essas informações imediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Alterações nesta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              alterações significativas publicando a nova política na plataforma e atualizando a data 
              de "Última atualização".
            </p>
            <p className="text-gray-700">
              Recomendamos que você revise esta política periodicamente para se manter informado sobre 
              como protegemos suas informações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Transferência Internacional de Dados</h2>
            <p className="text-gray-700 mb-4">
              Seus dados podem ser processados e armazenados em servidores localizados fora do Brasil. 
              Ao usar nossos serviços, você consente com a transferência de seus dados para esses servidores.
            </p>
            <p className="text-gray-700">
              Garantimos que todas as transferências internacionais de dados sejam feitas em conformidade 
              com a LGPD e com medidas de segurança adequadas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 mb-4">
              Para questões sobre esta Política de Privacidade ou para exercer seus direitos, entre em contato:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li><strong>Email:</strong> agenciabdadigital@gmail.com</li>
              <li><strong>Empresa:</strong> Bresus Servicos Digtais Ltda</li>
              <li><strong>CNPJ:</strong> 55.654.824/0001-77</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Você também pode entrar em contato com a Autoridade Nacional de Proteção de Dados (ANPD) 
              caso tenha preocupações sobre o tratamento de seus dados pessoais.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Ao usar a plataforma PartyU, você confirma que leu e entendeu esta Política de Privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
