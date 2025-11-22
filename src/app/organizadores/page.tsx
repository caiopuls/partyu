import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, DollarSign, BarChart3, Users, Calendar, Shield } from "lucide-react";

export default function OrganizadoresPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl font-bold tracking-tight mb-6">
                    Crie eventos incríveis com a <span className="text-primary">PartyU</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    A plataforma completa para gerenciar seus eventos, vender ingressos e receber pagamentos de forma rápida e segura.
                </p>
                <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/criar-conta-organizador">
                        Começar Agora →
                    </Link>
                </Button>
            </section>

            {/* Benefits Section */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Por que escolher a PartyU?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <DollarSign className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Pagamentos PIX Instantâneos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Receba seus pagamentos via PIX de forma rápida e segura, sem complicações bancárias.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <BarChart3 className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Dashboard Completo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Acompanhe vendas, receitas e métricas do seu evento em tempo real através de um painel intuitivo.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Users className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Gestão de Participantes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Gerencie listas de convidados, controle de acesso e validação de ingressos com QR Code.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Calendar className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Múltiplos Tipos de Ingresso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Crie diferentes categorias de ingressos, lotes e promoções para maximizar suas vendas.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Shield className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Revenda Controlada</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Sistema de revenda integrado com limite de preço para proteger seu público de cambistas.
                            </CardDescription>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Check className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Sem Taxas Abusivas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Taxas transparentes e justas. Você mantém a maior parte da receita dos seus eventos.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* How it Works */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Como funciona
                </h2>
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Cadastre-se como Organizador</h3>
                            <p className="text-muted-foreground">
                                Preencha seus dados (CPF/CNPJ) e aguarde a aprovação do nosso time. O processo é rápido e simples.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Crie seu Evento</h3>
                            <p className="text-muted-foreground">
                                Configure detalhes do evento, tipos de ingressos, preços e data. Nossa plataforma te guia em cada passo.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Compartilhe e Venda</h3>
                            <p className="text-muted-foreground">
                                Divulgue seu evento nas redes sociais e receba pagamentos via PIX automaticamente.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                            4
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Acompanhe e Receba</h3>
                            <p className="text-muted-foreground">
                                Monitore vendas em tempo real e solicite saques quando quiser. Dinheiro na sua conta em minutos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-3xl">Pronto para começar?</CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                            Junte-se a centenas de organizadores que já usam a PartyU
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
                            <Link href="/criar-conta-organizador">
                                Criar Conta de Organizador
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
