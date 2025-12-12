import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, DollarSign, BarChart3, ShieldCheck, Zap, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrganizerApplicationModal } from "@/components/organizer/organizer-application-modal";

export default function VenderPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#F8F8F3] py-20 lg:py-32">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 px-4 py-1.5 text-sm font-bold border-none">
                            Para Organizadores, Fraternidades, Casas de Festa e Eventos
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-none tracking-tight">
                            Transforme seus eventos em <span className="text-primary">experiências inesquecíveis</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                            A plataforma completa para gerenciar, vender e escalar seus eventos com a menor taxa do mercado e segurança total.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <OrganizerApplicationModal>
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/25 rounded-full cursor-pointer py-3 h-auto">
                                    Seja um Organizador
                                </Button>
                            </OrganizerApplicationModal>
                            <Button variant="outline" size="lg" className="text-base rounded-full border-2 cursor-pointer py-3 h-auto" asChild>
                                <Link href="#beneficios">Saiba mais</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Abstract shapes/decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Stats/Trust Bar */}
            <div className="border-y border-gray-100 bg-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">+1.100</p>
                            <p className="text-sm text-gray-500">Ingressos vendidos</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">10%</p>
                            <p className="text-sm text-gray-500">Taxa fixa da PartyU</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">24h</p>
                            <p className="text-sm text-gray-500">Suporte dedicado</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">100%</p>
                            <p className="text-sm text-gray-500">Seguro e confiável</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Benefits */}
            <section id="beneficios" className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Por que escolher a PartyU?</h2>
                        <p className="text-gray-600 text-lg">
                            Construímos a plataforma pensando nas dores reais dos organizadores. Mais lucro, menos dor de cabeça.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:bg-[#F8F8F3] transition-colors border border-transparent hover:border-primary/10">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <DollarSign className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Taxa Justa de 10%</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Esqueça taxas abusivas. Cobramos apenas 10% sobre o valor do ingresso. Mais dinheiro no seu bolso para investir no seu evento.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:bg-[#F8F8F3] transition-colors border border-transparent hover:border-primary/10">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Ticket className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Revenda Oficial e Segura</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Elimine o mercado paralelo. Nossa revenda oficial garante autenticidade e você ainda ganha uma taxa sobre cada revenda.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-50 rounded-2xl p-8 hover:bg-[#F8F8F3] transition-colors border border-transparent hover:border-primary/10">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <BarChart3 className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Painel em Tempo Real</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Acompanhe vendas, check-ins e faturamento em tempo real. Dashboard completo para tomada de decisões rápidas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Dive: Resale */}
            <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="inline-block bg-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-primary/30">
                                DIFERENCIAL EXCLUSIVO
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                O fim dos cambistas e fraudes
                            </h2>
                            <div className="space-y-6 text-gray-300 text-lg">
                                <p>
                                    A PartyU integrou um sistema de revenda proprietário que protege seu público e sua marca.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-white block">Anti-fraude nativo</strong>
                                            QR codes dinâmicos que permitem a validação de identidade.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-white block">Teto de preço</strong>
                                            Impede preços abusivos na revenda, mantendo seu evento acessível.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-white block">Receita extra</strong>
                                            Defina uma taxa de royalty e ganhe uma porcentagem toda vez que um ingresso for revendido.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            {/* Illustration/Image Placeholder */}
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-all duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Venda Aprovada</h4>
                                        <p className="text-sm text-gray-400">Ingresso transferido com segurança</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-white/10 rounded-full w-3/4" />
                                    <div className="h-2 bg-white/10 rounded-full w-full" />
                                    <div className="h-2 bg-white/10 rounded-full w-5/6" />
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Taxa do Organizador (5%)</span>
                                    <span className="text-green-400 font-bold">+ R$ 12,50</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bureaucracy Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Sem burocracia, start rápido</h2>
                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <div className="p-6">
                            <div className="text-5xl font-bold text-gray-200 mb-4">01</div>
                            <h3 className="text-xl font-bold mb-2">Cadastre-se</h3>
                            <p className="text-gray-600">Preencha seus dados básicos em menos de 2 minutos.</p>
                        </div>
                        <div className="p-6">
                            <div className="text-5xl font-bold text-gray-200 mb-4">02</div>
                            <h3 className="text-xl font-bold mb-2">Aguarde Análise</h3>
                            <p className="text-gray-600">Nossa equipe validará seu perfil de organizador rapidamente.</p>
                        </div>
                        <div className="p-6">
                            <div className="text-5xl font-bold text-gray-200 mb-4">03</div>
                            <h3 className="text-xl font-bold mb-2">Crie o evento</h3>
                            <p className="text-gray-600">Configure data, local e tipos de ingressos.</p>
                        </div>
                        <div className="p-6">
                            <div className="text-5xl font-bold text-gray-200 mb-4">04</div>
                            <h3 className="text-xl font-bold mb-2">Comece a vender</h3>
                            <p className="text-gray-600">Publique e acompanhe as vendas no painel.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-20 bg-[#F8F8F3]">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Pronto para elevar o nível?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Junte-se a milhares de produtores que escolheram a PartyU.
                    </p>
                    <OrganizerApplicationModal>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/30 rounded-full transform hover:-translate-y-1 transition-all cursor-pointer py-3 h-auto">
                            Começar Agora
                        </Button>
                    </OrganizerApplicationModal>
                </div>
            </section>
        </div>
    );
}
