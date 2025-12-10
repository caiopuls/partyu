import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 text-base text-muted-foreground sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-[0.18em] text-foreground/80">
              PARTYU
            </h2>
            <p className="text-xs text-muted-foreground/80">
              PartyU não é o organizador dos eventos. Cada produtor é
              responsável por suas próprias experiências.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">
              Produto
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/explorar" className="hover:text-foreground">
                  Explorar eventos
                </Link>
              </li>
              <li>
                <Link href="/revenda" className="hover:text-foreground">
                  Revenda de ingressos
                </Link>
              </li>
              <li>
                <Link href="/organizadores" className="hover:text-foreground">
                  Para organizadores
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">
              Suporte
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/ajuda" className="hover:text-foreground">
                  Central de ajuda
                </Link>
              </li>
              <li>
                <Link href="/seguranca" className="hover:text-foreground">
                  Segurança e antifraude
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-foreground">
                  Fale conosco
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">
              Legal
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/termos" className="hover:text-foreground">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-foreground">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">
              Sobre
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/sobre" className="hover:text-foreground">
                  Quem somos
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="hover:text-foreground">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/carreiras" className="hover:text-foreground">
                  Carreiras
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground/80">
              Redes Sociais
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://www.instagram.com/partyubr_?igsh=d3dqamlkbGM3NWcw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </Link>
              <Link
                href="mailto:contato@partyu.com"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-dashed border-border/60 pt-4 text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PartyU. Todos os direitos reservados.</p>
          <p>
            Pagamentos processados com PIX via{" "}
            <span className="font-medium text-foreground">OpenPix</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}



