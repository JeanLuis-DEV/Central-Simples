"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Grid2X2,
  LayoutGrid,
  ShieldCheck,
  Store,
  X,
  Zap,
} from "lucide-react";
import { apps, type CatalogApp } from "@/lib/catalog";
function AppIcon({ app, small = false }: { app: CatalogApp; small?: boolean }) {
  return (
    <span className={`app-icon ${small ? "small" : ""}`} aria-hidden="true">
      {app.id === "finorya" ? (
        "F"
      ) : app.id === "lingua-memory" ? (
        <BookOpen size={small ? 18 : 27} strokeWidth={2.2} />
      ) : app.id === "meu-negocio" ? (
        <Store size={small ? 18 : 27} strokeWidth={2.2} />
      ) : (
        <Zap size={small ? 18 : 27} fill="currentColor" />
      )}
    </span>
  );
}
function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="Central Simples — início">
      <span className="brand-mark">
        <Grid2X2 size={25} strokeWidth={2.6} />
      </span>
      <span>
        Central <strong>Simples</strong>
        <small>SEUS APPS. UMA CENTRAL.</small>
      </span>
    </a>
  );
}
export default function Catalog() {
  const trigger = useRef<HTMLElement | null>(null);
  function rememberTrigger() {
    trigger.current = document.activeElement as HTMLElement | null;
  }
  const [access, setAccess] = useState(false);
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Brand />
          <button
            className="button header-access"
            onClick={() => {
              rememberTrigger();
              setAccess(true);
            }}
          >
            <LayoutGrid size={17} />
            Acessar apps
            <ArrowUpRight size={16} />
          </button>
        </div>
      </header>
      <main id="conteudo">
        <section id="inicio" className="wrap hero">
          <div className="hero-copy">
            <h1>
              Seu dia mais simples.
              <br />
              <em>
                <span className="hero-title-line">Seus apps,</span>
                <span className="hero-title-line">num só lugar.</span>
              </em>
            </h1>
            <div className="hero-actions">
              <a className="button primary" href="#aplicativos">
                Encontrar meu aplicativo
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div
            className="hero-visual mobile-showcase"
            aria-label={`${apps.map((app) => app.name).join(", ")} no celular`}
          >
            <div className="visual-glow" aria-hidden="true" />
            {apps.map((app) => (
              <figure className="phone-preview" key={app.id}>
                <figcaption>
                  <AppIcon app={app} small />
                  <span>
                    <strong>{app.name}</strong>
                    <small>{app.category}</small>
                  </span>
                </figcaption>
                <div className="phone-frame">
                  <span className="phone-speaker" aria-hidden="true" />
                  <div className="phone-screen">
                    <Image
                      src={app.mobileImage}
                      alt={`${app.mobileScreen} do ${app.name} no celular com dados de demonstração`}
                      width={app.mobileWidth}
                      height={app.mobileHeight}
                      unoptimized
                      loading="eager"
                    />
                  </div>
                  <span className="phone-home" aria-hidden="true" />
                </div>
              </figure>
            ))}
          </div>
        </section>
        <section id="aplicativos" className="wrap catalog-section">
          <div className="section-heading">
            <div>
              <h2>
                Escolha o seu app.
              </h2>
            </div>
          </div>
          <div className="app-grid" aria-label="Catálogo de aplicativos">
            {apps.map((app) => (
              <article className="app-card" key={app.id}>
                <div className="card-content">
                  <div className="card-heading">
                    <AppIcon app={app} />
                    <div>
                      <p className="card-category">{app.label}</p>
                      <h3>{app.name}</h3>
                      <p className="card-subtitle">{app.subtitle}</p>
                    </div>
                    <span className="available">
                      <span />
                      Disponível
                    </span>
                  </div>
                  <p className="card-description">{app.detail}</p>
                  <div className="card-actions">
                    <a
                      className="button primary"
                      href={app.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Conhecer ${app.name}`}
                    >
                      Conhecer aplicativo
                      <ArrowRight size={17} />
                    </a>
                    <a
                      className="button secondary"
                      href={`${app.site}/login`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir aplicativo
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="wrap footer">
        <div>
          <a href="/area-restrita">Administração</a>
          <a href="/privacidade">Privacidade</a>
          <a href="/termos">Termos de uso</a>
        </div>
        <small>© 2026 Central Simples. Todos os direitos reservados.</small>
      </footer>
      <Dialog.Root
        open={access}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setAccess(false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            onCloseAutoFocus={(event: Event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
            className="dialog-content access-dialog"
          >
            <Dialog.Close className="close-button" aria-label="Fechar">
              <X size={21} />
            </Dialog.Close>

              <>
                <span className="access-symbol">
                  <LayoutGrid size={25} />
                </span>
                <Dialog.Title>Qual app vamos abrir?</Dialog.Title>
                <Dialog.Description className="dialog-description">
                  Escolha seu aplicativo e entre com a conta que você já utiliza
                  nele.
                </Dialog.Description>
                <div className="access-list">
                  {apps.map((app) => (
                    <a
                      key={app.id}
                      href={`${app.site}/login`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AppIcon app={app} small />
                      <span>
                        <strong>{app.name}</strong>
                        <small>{app.subtitle}</small>
                      </span>
                      <ArrowUpRight size={19} />
                    </a>
                  ))}
                </div>
                <p className="access-note">
                  <ShieldCheck size={16} />
                  Cada aplicativo mantém sua própria conta e seus dados.
                </p>
              </>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
