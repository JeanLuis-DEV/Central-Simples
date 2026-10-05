"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Grid2X2,
  LayoutGrid,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { apps, type CatalogApp } from "@/lib/catalog";
function AppIcon({ app, small = false }: { app: CatalogApp; small?: boolean }) {
  return (
    <span className={`app-icon ${small ? "small" : ""}`} aria-hidden="true">
      {app.id === "finorya" ? (
        "F"
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
  // Implementação futura: reativar este estado e a lógica junto com o filtro abaixo.
  // const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState<CatalogApp | null>(null);
  const [access, setAccess] = useState(false);
  /* Implementação futura: filtro por categoria.
  const filtered = apps.filter(
    (app) => category === "Todos" || category === app.category,
  );
  */
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Brand />
          <nav aria-label="Navegação principal">
            <a href="#aplicativos">Aplicativos</a>
            <a href="#sobre">Sobre a Central</a>
          </nav>
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
            <p className="eyebrow">
              <span /> UMA CENTRAL. VÁRIAS POSSIBILIDADES.
            </p>
            <h1>
              Seu dia mais simples.
              <br />
              <em>
                <span className="hero-title-line">Seus apps,</span>
                <span className="hero-title-line">num só lugar.</span>
              </em>
            </h1>
            <p className="lead">
              Ferramentas feitas para facilitar sua rotina.
              <br className="desktop-break" /> Escolha o aplicativo que combina
              com você e cuide do que importa.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#aplicativos">
                Encontrar meu aplicativo
                <ArrowRight size={18} />
              </a>
            </div>
            <p className="hero-note">
              <Check size={15} />
              Simples de usar. Feitos para a vida real.
            </p>
          </div>
          <div
            className="hero-visual mobile-showcase"
            aria-label="Finorya e Ajudante Elétrico no celular"
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
                <br />
                <span>Simplifique a sua rotina.</span>
              </h2>
            </div>
          </div>
          {/* Implementação futura: filtros por categoria. Reativar com o estado e a lógica acima.
          <div className="catalog-toolbar">
            <div
              className="filters"
              role="group"
              aria-label="Filtrar por categoria"
            >
              {["Todos", "Finanças", "Serviços"].map((item) => (
                <button
                  key={item}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                  {item === "Todos" && <span>{apps.length}</span>}
                </button>
              ))}
            </div>
          </div>
          */}
          <div className="app-grid" aria-label="Catálogo de aplicativos">
            {apps.map((app) => (
              <article className="app-card" key={app.id}>
                <div className="card-image">
                  <div className="card-image-bar">
                    <span className="window-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span>{app.name}</span>
                    <MonitorSmartphone size={13} />
                  </div>
                  <Image
                    src={app.image}
                    alt={`Visão do aplicativo ${app.name}`}
                    width={app.width}
                    height={app.height}
                    unoptimized
                  />
                </div>
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
                  <ul className="feature-tags">
                    {balanceFeatures(app.features).map((feature) => (
                      <li key={feature}>
                        <Check size={13} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="card-actions">
                    <button
                      className="button primary"
                      onClick={() => {
                        rememberTrigger();
                        setSelected(app);
                      }}
                      aria-label={`Conhecer ${app.name}`}
                    >
                      Conhecer aplicativo
                      <ArrowRight size={17} />
                    </button>
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
          <p className="catalog-note">
            <Sparkles size={15} />
            Esta é só a primeira página da nossa história. Novas ferramentas
            virão.
          </p>
        </section>
        <section id="sobre" className="wrap about-section">
          <div className="about-symbol" aria-hidden="true">
            <Grid2X2 size={47} />
          </div>
          <div>
            <p className="eyebrow">ESSA É A NOSSA IDEIA</p>
            <h2>
              Várias ferramentas.
              <br />
              <em>Uma mesma forma de pensar.</em>
            </h2>
            <p>
              A Central Simples reúne aplicativos com uma proposta em comum:
              transformar tarefas do dia a dia em experiências mais claras,
              organizadas e fáceis de usar.
            </p>
          </div>
          <a href="#aplicativos" className="text-link">
            Conheça os aplicativos
            <ArrowRight size={18} />
          </a>
        </section>
      </main>
      <footer className="wrap footer">
        <Brand />
        <p>Aplicativos simples. Possibilidades de sobra.</p>
        <div>
          <a href="#aplicativos">Aplicativos</a>
          <a href="#sobre">Sobre a Central</a>
          <button
            onClick={() => {
              rememberTrigger();
              setAccess(true);
            }}
          >
            Acessar
          </button>
        </div>
        <small>© 2026 Central Simples</small>
      </footer>
      <Dialog.Root
        open={!!selected || access}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setAccess(false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
            className={`dialog-content ${selected ? "product-dialog" : "access-dialog"}`}
          >
            <Dialog.Close className="close-button" aria-label="Fechar">
              <X size={21} />
            </Dialog.Close>
            {selected ? (
              <>
                <div className="dialog-product-heading">
                  <AppIcon app={selected} />
                  <div>
                    <p className="eyebrow">{selected.category}</p>
                    <Dialog.Title>{selected.name}</Dialog.Title>
                  </div>
                </div>
                <Dialog.Description className="dialog-description">
                  {selected.detail}
                </Dialog.Description>
                <Image
                  className="detail-image"
                  src={selected.image}
                  alt={`Tela do ${selected.name}`}
                  width={selected.width}
                  height={selected.height}
                  unoptimized
                />
                <ul className="detail-features">
                  {selected.features.map((feature) => (
                    <li key={feature}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="detail-actions">
                  <a
                    className="button primary"
                    href={selected.site}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conhecer planos e teste grátis
                    <ArrowUpRight size={17} />
                  </a>
                  <a
                    className="button secondary"
                    href={`${selected.site}/login`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir aplicativo
                    <ArrowRight size={17} />
                  </a>
                </div>
              </>
            ) : (
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
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

// Alternate longer and shorter labels so each row mixes text lengths.
function balanceFeatures(features: readonly string[]) {
  const remaining = [...features].sort((a, b) => b.length - a.length);
  const balanced: string[] = [];
  while (remaining.length) {
    balanced.push(remaining.shift()!);
    if (remaining.length) balanced.push(remaining.pop()!);
  }
  return balanced;
}
