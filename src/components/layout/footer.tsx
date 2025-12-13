import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/10 bg-[#F8F8F3] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/assets/logoheader.svg" alt="Partyu Logo" width={140} height={40} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Serviços Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-sm">Serviços</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <Link href="/explorar" className="hover:text-primary transition-colors">Explorar eventos</Link>
              <Link href="/vender" className="hover:text-primary transition-colors">Venda na Partyu</Link>
              <Link href="/revenda" className="hover:text-primary transition-colors">Revenda de ingressos</Link>
              <Link href="/gerenciar" className="hover:text-primary transition-colors">Gerenciar eventos</Link>
            </div>
          </div>

          {/* Ajuda Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-sm">Ajuda</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <Link href="/ajuda" className="hover:text-primary transition-colors">Central de ajuda</Link>
              <Link href="/seguranca" className="hover:text-primary transition-colors">Segurança</Link>
              <Link href="/contato" className="hover:text-primary transition-colors">Fale conosco</Link>
            </div>
          </div>

          {/* Redes Sociais Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-sm">Redes sociais</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Baixe o App Column */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-sm">Legal e Termos</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-600">
              <span className="opacity-60">Em breve</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-xs text-gray-500 max-w-2xl">
            <p className="mb-2">A Partyu não é responsável pela organização e segurança dos eventos. <Link href="/termos" className="underline hover:text-gray-800">Saiba mais</Link></p>
            <p>agenciabdadigital@gmail.com • Desenvolvido por Bresus Servicos Digtais Ltda CNPJ 55.654.824/0001-77</p>
          </div>
          <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Secure badges placeholders */}
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
