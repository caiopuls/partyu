import Link from "next/link";
import Image from "next/image";
import { TicketPercent, PartyPopper, Disc, Music, ArrowRight, MapPin, Calendar, Tag, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventsByRegion } from "@/lib/supabase/queries";
import { EventsCarousel } from "@/components/events/events-carousel";

export default async function Home() {
  const events = await getEventsByRegion(undefined, undefined, 10);

  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-[#F8F8F3] animate-[fadeIn_0.6s_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-6 z-10 animate-[fadeInUp_0.8s_ease-out]">
              <h1 className="text-[42px] md:text-[48px] font-extrabold tracking-tight leading-[0.95] text-gray-900">
                SOMOS A NOVA <br />
                FORMA DE COMPRAR <br />
                E REVENDER <span className="font-gochi text-primary text-[64px] md:text-[72px] block mt-1 transform -rotate-2">EXPERIÊNCIAS</span>
              </h1>
              <p className="text-lg text-gray-600 font-medium max-w-lg">
                Os melhores rolês acontecem na Partyu :)
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="default"
                  className="bg-gray-900 text-white hover:bg-black h-12 px-6 rounded-lg text-base font-bold transition-all hover:scale-105"
                  asChild
                >
                  <Link href="/explorar">
                    <PartyPopper className="mr-2 h-4 w-4" />
                    Explorar eventos
                  </Link>
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  className="bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50 h-12 px-6 rounded-lg text-base font-bold transition-all hover:scale-105"
                  asChild
                >
                  <Link href="/vender">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Vender na Partyu
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-[fadeInUp_1s_ease-out]">
              <div className="aspect-[4/3] w-full rounded-3xl relative overflow-hidden">
                <Image
                  src="/assets/heroimage.png"
                  alt="PartyU Hero"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Black Background) */}
      <section className="bg-black text-white py-24 animate-[fadeIn_1s_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

            {/* Feature 1 */}
            <div className="flex flex-col items-center space-y-6 animate-[fadeInUp_0.8s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
              <div className="w-32 h-32 rounded-2xl overflow-hidden mb-4 shadow-lg transition-transform hover:scale-110 duration-300">
                <Image src="/assets/card1.png" alt="Feature 1" width={128} height={128} className="object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase mb-2">Eventos pra quem <br /> vive o rolê</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Do universitário ao grande show. <br /> Tem de tudo no Partyu!</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center space-y-6 animate-[fadeInUp_0.8s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
              <div className="w-32 h-32 rounded-2xl overflow-hidden mb-4 shadow-lg transition-transform hover:scale-110 duration-300">
                <Image src="/assets/card2.png" alt="Feature 2" width={128} height={128} className="object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase mb-2">Comprou e não foi? <br /> Revenda!</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Ingressos circulam de forma <br /> simples, segura e justa.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center space-y-6 animate-[fadeInUp_0.8s_ease-out_0.6s] opacity-0 [animation-fill-mode:forwards]">
              <div className="w-32 h-32 rounded-2xl overflow-hidden mb-4 shadow-lg transition-transform hover:scale-110 duration-300">
                <Image src="/assets/card3.png" alt="Feature 3" width={128} height={128} className="object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase mb-2">Eventos mais <br /> democráticos</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Seja um criador de evento em alguns <br /> minutos com nossa plataforma</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS SECTION */}
      <section className="py-20 bg-[#F8F8F3] animate-[fadeIn_1.2s_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex items-center justify-between mb-12 animate-[fadeInUp_0.8s_ease-out]">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase">Próximos Eventos</h2>
            <Button variant="default" className="bg-black text-white hover:bg-gray-800 rounded-full px-6 transition-all hover:scale-105" asChild>
              <Link href="/explorar">Ver todos os eventos</Link>
            </Button>
          </div>

          {/* Events Carousel */}
          {events.length > 0 ? (
            <EventsCarousel events={events} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum evento disponível no momento.
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
