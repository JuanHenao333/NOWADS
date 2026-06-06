import { useEffect, useRef, useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// FONTS — agregar en index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Montserrat:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
// ─────────────────────────────────────────────────────────────

// ─── THEME ───────────────────────────────────────────────────
const T = {
  black:  "#000000",
  navy:   "#1C1A4A",
  red:    "#E63B2E",
  gray:   "#26251F",
  off:    "#E8E4DE",
  muted:  "rgba(232,228,222,0.50)",
  border: "rgba(232,228,222,0.09)",
};

// ─── EASING ──────────────────────────────────────────────────
const easeOutExpo  = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// ─── HOOK: useInView ─────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref  = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── HOOK: useCounter ────────────────────────────────────────
function useCounter(end: number, duration = 2000, active = false) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const t0 = performance.now();
    const ease = end > 999 ? easeOutCubic : easeOutExpo;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round(ease(p) * end));
      if (p < 1) requestAnimationFrame(tick);
      else setVal(end);
    };
    requestAnimationFrame(tick);
  }, [active, end, duration]);
  return val;
}

// ─── ANIMATED COUNTER ────────────────────────────────────────
function Counter({ end, prefix = "", suffix = "", duration = 2000 }: {
  end: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const { ref, visible } = useInView(0.4);
  const val = useCounter(end, duration, visible);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {prefix}{val.toLocaleString("es-CO")}{suffix}
    </span>
  );
}

// ─── FADE UP WRAPPER ─────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useInView(0.15);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── SECTION TAG ─────────────────────────────────────────────
function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
      textTransform: "uppercase", color: T.red, marginBottom: 20,
    }}>
      <span style={{ width: 36, height: 1, background: T.red, flexShrink: 0 }} />
      {children}
    </div>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────
function Btn({ href, children, variant = "primary" }: {
  href: string; children: React.ReactNode; variant?: "primary" | "ghost";
}) {
  const base: React.CSSProperties = {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
    textTransform: "uppercase", padding: "17px 44px",
    textDecoration: "none", display: "inline-block",
    transition: "all 0.2s", cursor: "pointer",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { ...base, background: T.red, color: "#fff", border: `1px solid ${T.red}` },
    ghost:   { ...base, background: "transparent", color: T.off, border: `1px solid ${T.border}` },
  };
  return <a href={href} style={styles[variant]}>{children}</a>;
}

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Metodología", href: "#method" },
    { label: "Servicios",   href: "#services" },
    { label: "Planes",      href: "#pricing" },
    { label: "Resultados",  href: "#results" },
    { label: "AI Content",  href: "#heygen" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "20px 64px",
      background: scrolled ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${scrolled ? T.border : "transparent"}`,
      transition: "all 0.3s",
    }}>
      {/* Logo */}
      <a href="#hero" style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 19, letterSpacing: "0.06em", textTransform: "uppercase",
        color: "#fff", textDecoration: "none",
      }}>
        JUAN HENAO <span style={{ color: T.red }}>ADS</span>
      </a>

      {/* Desktop links */}
      <ul style={{
        display: "flex", gap: 40, listStyle: "none",
        margin: 0, padding: 0,
      }} className="nav-links-desktop">
        {links.map(l => (
          <li key={l.href}>
            <a href={l.href} style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
              textTransform: "uppercase", textDecoration: "none",
              color: "rgba(232,228,222,0.55)", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = T.red)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,228,222,0.55)")}
            >{l.label}</a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a href="https://wa.me/573104460407?text=Hola%20Juan,%20quiero%20una%20asesor%C3%ADa%20gratuita"
        target="_blank" rel="noreferrer"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", padding: "12px 28px",
          background: T.red, color: "#fff", textDecoration: "none",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#ff4a3d")}
        onMouseLeave={e => (e.currentTarget.style.background = T.red)}
      >
        Agenda llamada
      </a>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────
function Hero() {
  const stats = [
    { end: 78,   prefix: "+$", suffix: "K", label: "USD gestionados\ncliente dental USA",       delay: 0   },
    { end: 23,   suffix: "X",               label: "ROAS promedio\nrestaurante Medellín",        delay: 120 },
    { end: 7069, suffix: "+",               label: "Conversaciones\ngeneradas en 7 meses",       delay: 240 },
    { end: 150,  suffix: "+",               label: "Campañas simultáneas\ngrupo inmobiliario",   delay: 360 },
  ];

  return (
    <section id="hero" style={{
      minHeight: "100vh", background: T.black,
      display: "flex", flexDirection: "column",
      justifyContent: "center", position: "relative", overflow: "hidden",
    }}>
      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(232,228,222,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,228,222,0.035) 1px, transparent 1px)`,
        backgroundSize: "80px 80px", pointerEvents: "none",
      }} />
      {/* Red glow */}
      <div style={{
        position: "absolute", top: -140, right: -120,
        width: 700, height: 700,
        background: "radial-gradient(circle, rgba(230,59,46,0.11) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Navy glow */}
      <div style={{
        position: "absolute", bottom: 0, left: -100,
        width: 500, height: 500,
        background: "radial-gradient(circle, rgba(28,26,74,0.3) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ padding: "140px 64px 0", position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{
          animation: "fadeUp 0.7s ease both",
          display: "inline-flex", alignItems: "center", gap: 12,
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 11, fontWeight: 600, letterSpacing: "0.22em",
          textTransform: "uppercase", color: T.red, marginBottom: 40,
        }}>
          <span style={{ width: 40, height: 1, background: T.red }} />
          Tráfico digital · Medellín, Colombia
        </div>

        {/* H1 */}
        <h1 style={{
          animation: "fadeUp 0.7s 0.1s ease both",
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: "clamp(64px, 9.5vw, 148px)",
          lineHeight: 0.92, letterSpacing: "-0.01em",
          textTransform: "uppercase", margin: "0 0 40px",
          color: "#fff",
        }}>
          Más<br />
          <span style={{ color: T.red }}>Clientes.</span><br />
          <span style={{
            color: "transparent",
            WebkitTextStroke: `1.5px ${T.off}`,
          }}>
            Más Ventas.
          </span>
        </h1>

        {/* Meta row */}
        <div style={{
          animation: "fadeUp 0.7s 0.22s ease both",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 40, alignItems: "end", marginBottom: 0,
          maxWidth: 900,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 17, fontWeight: 300, color: T.muted,
            lineHeight: 1.75, margin: 0,
          }}>
            Diseñamos y gestionamos campañas de tráfico pago en Meta, Google y TikTok que convierten inversión publicitaria en ventas reales. Con datos, sin excusas.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Btn href="https://wa.me/573104460407?text=Hola%20Juan,%20quiero%20m%C3%A1s%20clientes">
              Quiero más clientes →
            </Btn>
            <Btn href="#results" variant="ghost">Ver resultados</Btn>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        borderTop: `1px solid ${T.border}`,
        background: "rgba(0,0,0,0.6)",
        marginTop: 64, position: "relative", zIndex: 1,
      }}>
        {stats.map((s, i) => (
          <StatCell key={i} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatCell({ end, prefix = "", suffix = "", label, delay }: {
  end: number; prefix?: string; suffix?: string; label: string; delay: number;
}) {
  const { ref, visible } = useInView(0.3);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        padding: "36px 48px",
        borderRight: `1px solid ${T.border}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      <div style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 48, color: T.red, lineHeight: 1, marginBottom: 8,
      }}>
        <Counter end={end} prefix={prefix} suffix={suffix} />
      </div>
      <div style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
        textTransform: "uppercase", color: T.muted,
        lineHeight: 1.5, whiteSpace: "pre-line",
      }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MARQUEE BAND
// ─────────────────────────────────────────────────────────────
const CLIENTS = [
  "Grupo REDI", "Smile Dental Center", "eXp Realty", "Malteatto",
  "Conhogar", "Vértice Ingeniería", "Diana Pulgarin Dental",
  "Charlie Perez RE", "Montpellier", "Luxe Dental", "Fundación Integrar", "Mind Connecting",
];

function MarqueeBand() {
  const doubled = [...CLIENTS, ...CLIENTS];
  return (
    <div style={{
      overflow: "hidden",
      borderTop: `1px solid ${T.border}`,
      borderBottom: `1px solid ${T.border}`,
      background: T.gray, padding: "20px 0",
    }}>
      <p style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 10, fontWeight: 600, letterSpacing: "0.22em",
        textTransform: "uppercase", color: "rgba(232,228,222,0.22)",
        textAlign: "center", margin: "0 0 18px",
      }}>
        Marcas que ya confían en nosotros
      </p>
      <div style={{
        display: "flex", whiteSpace: "nowrap",
        animation: "marquee 32s linear infinite",
      }}>
        {doubled.map((c, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "0 40px",
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "rgba(232,228,222,0.2)",
            borderRight: `1px solid rgba(232,228,222,0.06)`,
          }}>
            <span style={{ color: T.red, opacity: 0.4, fontSize: 8 }}>◆</span>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// METHODOLOGY
// ─────────────────────────────────────────────────────────────
const METHOD_STEPS = [
  { num: "01", title: "Investigación de mercado",     body: "Analizamos tu industria, competencia y audiencia para construir una estrategia basada en datos reales, no suposiciones." },
  { num: "02", title: "Estrategia de comunicación",   body: "Creamos guiones estratégicos y la arquitectura creativa para cada pieza gráfica y video de tus campañas." },
  { num: "03", title: "Ejecución de campañas",        body: "Configuramos pixel, públicos, segmentación y lanzamos campañas ilimitadas en Meta, Google y TikTok." },
  { num: "04", title: "Optimización y escala",        body: "A/B testing constante, análisis de métricas y reuniones de seguimiento para escalar lo que funciona." },
  { num: "05", title: "Conversión y cierre",          body: "Diseñamos el embudo completo: captar atención → activar interés → generar deseo → manejar objeciones → cierre." },
];

const FUNNEL_STAGES = [
  { icon: "🔍", label: "Investigación",  sub: "Mercado · Competencia · Estrategia" },
  { icon: "🎬", label: "Comunicación",   sub: "Guiones · Narrativa · Creativos" },
  { icon: "⚙️", label: "Ejecución",      sub: "Campañas · Pixel · Segmentación" },
  { icon: "💰", label: "Venta",          sub: "Leads cualificados · Cierre comercial", highlight: true },
];

function MethodSection() {
  return (
    <section id="method" style={{ padding: "120px 64px", background: T.black }}>
      <FadeUp>
        <SectionTag>Cómo trabajamos</SectionTag>
        <h2 style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: "clamp(36px,4.5vw,68px)",
          lineHeight: 1, textTransform: "uppercase",
          letterSpacing: "-0.01em", margin: "0 0 64px", color: "#fff",
        }}>
          Metodología<br />de resultados
        </h2>
      </FadeUp>

      <div style={{
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 100, alignItems: "start",
      }}>
        {/* Steps */}
        <div>
          {METHOD_STEPS.map((s, i) => (
            <FadeUp key={i} delay={i * 80}>
              <MethodStep {...s} />
            </FadeUp>
          ))}
        </div>

        {/* Funnel visual */}
        <FadeUp delay={200}>
          <div style={{
            position: "sticky", top: 120,
            background: "rgba(28,26,74,0.12)",
            border: `1px solid rgba(28,26,74,0.45)`,
            padding: 40,
          }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(232,228,222,0.3)",
              marginBottom: 28,
            }}>
              Funnel de conversión Now Ads
            </p>
            {FUNNEL_STAGES.map((f, i) => (
              <div key={i}>
                <FunnelStage {...f} />
                {i < FUNNEL_STAGES.length - 1 && (
                  <div style={{
                    textAlign: "center", color: T.red,
                    opacity: 0.4, fontSize: 14, padding: "2px 0",
                  }}>↓</div>
                )}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function MethodStep({ num, title, body }: { num: string; title: string; body: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid", gridTemplateColumns: "64px 1fr",
        padding: "28px 0",
        borderBottom: `1px solid ${T.border}`,
        background: hovered ? "rgba(230,59,46,0.04)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      <div style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 42, lineHeight: 1.1, paddingTop: 4,
        color: hovered ? T.red : "rgba(230,59,46,0.18)",
        transition: "color 0.2s",
      }}>{num}</div>
      <div>
        <h4 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 15, fontWeight: 700, letterSpacing: "0.04em",
          marginBottom: 6, color: "#fff",
        }}>{title}</h4>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: T.muted, lineHeight: 1.65, margin: 0,
        }}>{body}</p>
      </div>
    </div>
  );
}

function FunnelStage({ icon, label, sub, highlight = false }: {
  icon: string; label: string; sub: string; highlight?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "16px 20px",
        borderLeft: `2px solid ${hovered || highlight ? T.red : "transparent"}`,
        background: hovered || highlight ? "rgba(230,59,46,0.06)" : "transparent",
        transition: "all 0.2s",
      }}
    >
      <span style={{ fontSize: 22, width: 36, textAlign: "center", flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", marginBottom: 2,
          color: highlight ? T.red : "#fff",
        }}>{label}</div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: T.muted,
        }}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: "📱", title: "Meta Ads",
    desc: "Facebook e Instagram con segmentación avanzada orientada a resultados medibles en tiempo real.",
    bullets: ["Campañas de mensajes DM", "Lead generation forms", "Ventas web / conversiones", "Retargeting y lookalike 1%–5%", "A/B testing de creativos"],
  },
  {
    icon: "🤖", title: "AI Content — HeyGen", featured: true,
    desc: "Videos con avatares AI para tus ads. UGC, testimoniales y videos a escala sin actores ni producción.",
    bullets: ["Avatares AI personalizados", "UGC ads para TikTok y Meta", "Videos en 175+ idiomas", "10x variaciones de hook", "Sin producción física"],
  },
  {
    icon: "🔍", title: "Google Ads",
    desc: "Capturamos demanda activa de personas que ya buscan tu servicio en Search, Display y YouTube.",
    bullets: ["Search y Shopping", "Display y YouTube Ads", "Configuración de conversiones", "Estrategias de puja inteligente", "Reportes con métricas clave"],
  },
  {
    icon: "🎵", title: "TikTok Ads",
    desc: "Audiencias de alto engagement con formatos nativos que no parecen publicidad tradicional.",
    bullets: ["In-Feed Ads nativos", "Spark Ads (contenido orgánico)", "UGC creatives con HeyGen", "Segmentación por comportamiento", "Creative testing masivo"],
  },
  {
    icon: "🏗️", title: "Estrategia y Creativos",
    desc: "Investigación de mercado, guiones AIDA/PAS y arquitectura creativa para piezas que convierten.",
    bullets: ["Estudio de mercado y competencia", "Guiones de anuncio AIDA/PAS", "Briefs para diseñadores", "Plan de métricas y KPIs", "Reuniones de seguimiento"],
  },
  {
    icon: "📊", title: "Optimización y Escala",
    desc: "Monitoreo constante y escalamiento de campañas ganadoras para maximizar el ROAS mes a mes.",
    bullets: ["Configuración Pixel y CAPI", "Análisis de públicos avanzado", "Optimización de presupuesto", "Reportes mensuales detallados", "Escalamiento de ganadoras"],
  },
];

function ServicesSection() {
  return (
    <section id="services" style={{ padding: "120px 64px", background: "#0A0A0A" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 60, alignItems: "end", marginBottom: 72,
      }}>
        <FadeUp>
          <SectionTag>Qué hacemos</SectionTag>
          <h2 style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "clamp(36px,4.5vw,68px)",
            lineHeight: 1, textTransform: "uppercase",
            letterSpacing: "-0.01em", margin: 0, color: "#fff",
          }}>
            Servicios<br />de tráfico
          </h2>
        </FadeUp>
        <FadeUp delay={100}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, fontWeight: 300, color: T.muted,
            lineHeight: 1.75, margin: 0, maxWidth: 520,
          }}>
            Gestionamos tu inversión publicitaria con estrategia, creativos y optimización constante para maximizar el retorno en cada peso invertido.
          </p>
        </FadeUp>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px", background: T.border,
      }}>
        {SERVICES.map((s, i) => (
          <FadeUp key={i} delay={i * 70}>
            <ServiceCard {...s} />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ icon, title, desc, bullets, featured = false }: {
  icon: string; title: string; desc: string; bullets: string[]; featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: featured ? T.navy : (hovered ? "#0d0d0d" : T.black),
        padding: "48px 40px",
        position: "relative", overflow: "hidden",
        transition: "background 0.3s",
        borderTop: featured ? `2px solid ${T.red}` : "none",
        height: "100%",
      }}
    >
      {featured && (
        <span style={{
          display: "inline-block",
          background: T.red, color: "#fff",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
          textTransform: "uppercase", padding: "4px 12px", marginBottom: 20,
        }}>★ Diferenciador</span>
      )}
      <span style={{ fontSize: 32, display: "block", marginBottom: 24 }}>{icon}</span>
      <h3 style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 18, textTransform: "uppercase",
        letterSpacing: "0.02em", marginBottom: 12, color: "#fff",
      }}>{title}</h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: T.muted,
        lineHeight: 1.7, marginBottom: 24,
      }}>{desc}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, color: "rgba(232,228,222,0.38)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: "50%",
              background: T.red, flexShrink: 0,
            }} />
            {b}
          </li>
        ))}
      </ul>
      {/* Bottom line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        height: "1.5px", background: T.red,
        width: hovered ? "100%" : 0,
        transition: "width 0.5s ease",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    price: "2.850.000",
    period: "Fee mensual · Pauta desde 1.5M COP",
    features: [
      { text: "1 plataforma (Meta o Google)", ok: true },
      { text: "Campañas ilimitadas", ok: true },
      { text: "Configuración de pixel y públicos", ok: true },
      { text: "Guiones estratégicos", ok: true },
      { text: "1 reunión mensual de seguimiento", ok: true },
      { text: "Plan de métricas básico", ok: true },
      { text: "Contenido AI con HeyGen", ok: false },
      { text: "TikTok Ads", ok: false },
    ],
    cta: "Empezar ahora",
    href: "https://wa.me/573104460407?text=Hola,%20me%20interesa%20el%20plan%20Starter",
  },
  {
    name: "Growth",
    price: "4.500.000",
    period: "Fee mensual · Pauta desde 3M COP",
    featured: true,
    features: [
      { text: "Meta Ads + Google Ads", ok: true },
      { text: "Campañas ilimitadas", ok: true },
      { text: "AI Content con HeyGen (5 videos/mes)", ok: true },
      { text: "Configuración técnica completa", ok: true },
      { text: "Guiones + arquitectura creativa", ok: true },
      { text: "2 reuniones mensuales", ok: true },
      { text: "Reportes detallados con métricas", ok: true },
      { text: "A/B testing de creativos", ok: true },
    ],
    cta: "Quiero este plan",
    href: "https://wa.me/573104460407?text=Hola,%20me%20interesa%20el%20plan%20Growth",
  },
  {
    name: "Scale",
    price: "A consultar",
    period: "Proyectos grandes · Pauta +15M COP",
    features: [
      { text: "Meta + Google + TikTok Ads", ok: true },
      { text: "Campañas ilimitadas multicanal", ok: true },
      { text: "AI Content ilimitado (HeyGen)", ok: true },
      { text: "Estrategia de contenido completa", ok: true },
      { text: "Team dedicado", ok: true },
      { text: "Reuniones semanales", ok: true },
      { text: "Dashboard personalizado", ok: true },
      { text: "Consultoría de crecimiento mensual", ok: true },
    ],
    cta: "Hablemos →",
    href: "https://wa.me/573104460407?text=Hola,%20quiero%20hablar%20del%20plan%20Scale",
  },
];

function PricingSection() {
  return (
    <section id="pricing" style={{ padding: "120px 64px", background: T.black }}>
      <FadeUp>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <SectionTag>Inversión</SectionTag>
          <h2 style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "clamp(36px,4.5vw,68px)",
            lineHeight: 1, textTransform: "uppercase",
            letterSpacing: "-0.01em", margin: "0 0 12px", color: "#fff",
          }}>
            Planes de servicio
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontStyle: "italic", color: T.muted,
          }}>
            Mínimo 3 meses de trabajo para escalar resultados y consolidar la estrategia.
          </p>
        </div>
      </FadeUp>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px", background: T.border,
        maxWidth: 1100, margin: "0 auto",
      }}>
        {PLANS.map((p, i) => (
          <FadeUp key={i} delay={i * 100}>
            <PricingCard {...p} />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function PricingCard({ name, price, period, features, cta, href, featured = false }: typeof PLANS[0] & { featured?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      background: featured ? T.gray : T.black,
      padding: "52px 44px",
      position: "relative",
      display: "flex", flexDirection: "column",
      borderTop: featured ? `2px solid ${T.red}` : "2px solid transparent",
      height: "100%",
    }}>
      {featured && (
        <div style={{
          position: "absolute", top: -13, left: 44,
          background: T.red, color: "#fff",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
          textTransform: "uppercase", padding: "4px 14px",
        }}>Más popular</div>
      )}

      <div style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
        textTransform: "uppercase", color: T.red, marginBottom: 20,
      }}>{name}</div>

      <div style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: price.includes("consultar") ? 32 : 52,
        lineHeight: 1, marginBottom: 6, color: "#fff",
      }}>
        {price.includes("consultar") ? price : (
          <>{price}<span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, fontWeight: 300, color: T.muted,
          }}> COP</span></>
        )}
      </div>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12, color: T.muted, marginBottom: 36,
      }}>{period}</div>

      <div style={{ height: 1, background: T.border, marginBottom: 32 }} />

      <ul style={{
        listStyle: "none", margin: 0, padding: 0,
        display: "flex", flexDirection: "column", gap: 14, flex: 1,
        marginBottom: 40,
      }}>
        {features.map((f, i) => (
          <li key={i} style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: f.ok ? "rgba(232,228,222,0.65)" : "rgba(232,228,222,0.2)",
            textDecoration: f.ok ? "none" : "line-through",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{
              color: f.ok ? T.red : "rgba(232,228,222,0.18)",
              fontWeight: 700, flexShrink: 0, fontSize: 12,
            }}>{f.ok ? "✓" : "—"}</span>
            {f.text}
          </li>
        ))}
      </ul>

      <a
        href={href} target="_blank" rel="noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "block", textAlign: "center", padding: 16,
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", textDecoration: "none",
          background: featured || hovered ? T.red : "transparent",
          color: featured || hovered ? "#fff" : T.red,
          border: `1px solid ${featured ? T.red : "rgba(230,59,46,0.4)"}`,
          transition: "all 0.2s",
        }}
      >{cta}</a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────────────────────────
const RESULTS = [
  {
    industry: "Odontología · USA",
    headline: "ROI", accent: "proyectado 10X",
    desc: "Clínica de diseños de sonrisa en Miami. Campañas de mensajes en Meta durante 7 meses con segmentación bilingual en FL, TX, GA y Puerto Rico.",
    metrics: [
      { end: 78,   prefix: "$", suffix: "K",   label: "USD invertidos" },
      { end: 7069, suffix: "+",                 label: "Conversaciones" },
      { end: 12,   prefix: "$", suffix: ".52",  label: "CPL promedio" },
    ],
  },
  {
    industry: "Restaurante · Medellín",
    headline: "ROAS", accent: "promedio 23X",
    desc: "Restaurante con domicilios. Campañas de ventas web en Meta durante 7 meses. Campañas individuales llegaron hasta 34X de retorno.",
    metrics: [
      { end: 21,    prefix: "$", suffix: ".7M COP", label: "COP invertidos" },
      { end: 10900, suffix: "+",                     label: "Compras web" },
      { end: 34,    suffix: "X",                     label: "ROAS máximo" },
    ],
  },
  {
    industry: "Real Estate · Colombia & USA",
    headline: "3.5M", accent: "cuentas únicas",
    desc: "Grupo inmobiliario con múltiples proyectos. 150+ campañas simultáneas en 15 meses posicionando en Colombia y Estados Unidos.",
    metrics: [
      { end: 118, prefix: "$", suffix: "M COP", label: "COP gestionados" },
      { end: 12,  suffix: ".5M impr.",           label: "Impresiones" },
      { end: 150, suffix: "+",                   label: "Campañas activas" },
    ],
  },
  {
    industry: "Estética · USA",
    headline: "107K", accent: "cuentas alcanzadas",
    desc: "Centro de estética en Estados Unidos. 32 campañas con mensajes IG, lead forms y tráfico al perfil. Segmentación LAL 1%–2%.",
    metrics: [
      { end: 8,  prefix: "$", suffix: ".4K USD", label: "USD invertidos" },
      { end: 107, suffix: "K",                   label: "Cuentas únicas" },
      { end: 32,                                  label: "Campañas activas" },
    ],
  },
];

function ResultsSection() {
  return (
    <section id="results" style={{ padding: "120px 64px", background: "#0A0A0A" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 60, alignItems: "end", marginBottom: 72,
      }}>
        <FadeUp>
          <SectionTag>Casos de éxito</SectionTag>
          <h2 style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "clamp(36px,4.5vw,68px)",
            lineHeight: 1, textTransform: "uppercase",
            letterSpacing: "-0.01em", margin: 0, color: "#fff",
          }}>
            Resultados<br />reales
          </h2>
        </FadeUp>
        <FadeUp delay={100}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, fontWeight: 300, color: T.muted,
            lineHeight: 1.75, margin: 0,
          }}>
            No vendemos promesas. Cada número viene con pantalla del Ads Manager incluida.
          </p>
        </FadeUp>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1px", background: T.border,
      }}>
        {RESULTS.map((r, i) => (
          <FadeUp key={i} delay={i * 90}>
            <ResultCard {...r} />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function ResultCard({ industry, headline, accent, desc, metrics }: typeof RESULTS[0]) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#080808" : T.black,
        padding: "56px 52px",
        position: "relative", overflow: "hidden",
        transition: "background 0.3s",
        borderLeft: hovered ? `2px solid rgba(230,59,46,0.3)` : "2px solid transparent",
      }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 160, height: 160,
        background: "radial-gradient(circle at top right, rgba(28,26,74,0.25), transparent 70%)",
        pointerEvents: "none",
      }} />

      <span style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
        textTransform: "uppercase", color: T.red,
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 24,
      }}>
        <span style={{ width: 22, height: 1, background: T.red }} />
        {industry}
      </span>

      <h3 style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: "clamp(36px,4vw,52px)",
        lineHeight: 1, textTransform: "uppercase",
        marginBottom: 12, color: "#fff",
      }}>
        {headline}<br />
        <span style={{ color: T.red }}>{accent}</span>
      </h3>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: T.muted,
        lineHeight: 1.7, marginBottom: 36,
      }}>{desc}</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
      }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            borderTop: `1px solid rgba(230,59,46,0.25)`,
            paddingTop: 16,
          }}>
            <div style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: 28, color: T.red, lineHeight: 1, marginBottom: 6,
            }}>
              <Counter end={m.end} prefix={m.prefix} suffix={m.suffix} duration={1800} />
            </div>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(232,228,222,0.3)",
            }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEYGEN SECTION
// ─────────────────────────────────────────────────────────────
const HG_STATS = [
  { end: 70,  suffix: "%", label: "reducción en costos de producción" },
  { end: 80,  suffix: "%", label: "más conversión con AI video" },
  { end: 50,  suffix: "/día", label: "videos generados vs 1-2/año" },
  { end: 175, suffix: "+", label: "idiomas con lip-sync perfecto" },
];

const HG_FEATS = [
  "Avatares AI con tu imagen — sin cámara, sin estudio, sin costos de producción",
  "UGC-style ads que convierten 3-5x mejor que anuncios de marca pulidos",
  "10 variaciones de hook diferentes en menos de una hora",
  "Videos en 175+ idiomas con sincronización de labios perfecta",
  "Export directo a Meta Ads Manager y TikTok en los formatos correctos",
  "Escala de 5 ads por semana a 50 sin aumentar el equipo de producción",
];

function HeyGenSection() {
  return (
    <section id="heygen" style={{
      padding: "80px 64px",
      background: T.navy,
      borderTop: `1px solid rgba(28,26,74,0.8)`,
      borderBottom: `1px solid rgba(28,26,74,0.8)`,
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "center",
      }}>
        <div>
          <FadeUp>
            <SectionTag>Diferenciador</SectionTag>
            <h2 style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: "clamp(36px,4.5vw,64px)",
              lineHeight: 1, textTransform: "uppercase",
              letterSpacing: "-0.01em", marginBottom: 20, color: "#fff",
            }}>
              Contenido AI<br />con HeyGen
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, fontWeight: 300, color: T.muted,
              lineHeight: 1.75, marginBottom: 40,
            }}>
              Producimos videos publicitarios con avatares AI de alta calidad para escalar tus creativos sin contratar actores ni producción física.
            </p>
          </FadeUp>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16,
          }}>
            {HG_STATS.map((s, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div style={{
                  background: "rgba(0,0,0,0.3)",
                  border: `1px solid rgba(232,228,222,0.08)`,
                  padding: 24,
                }}>
                  <div style={{
                    fontFamily: "'Archivo Black', sans-serif",
                    fontSize: 38, color: T.red, lineHeight: 1, marginBottom: 4,
                  }}>
                    <Counter end={s.end} suffix={s.suffix} />
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, color: T.muted,
                  }}>{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        <FadeUp delay={150}>
          <ul style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "flex", flexDirection: "column", gap: 18,
          }}>
            {HG_FEATS.map((f, i) => (
              <li key={i} style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: "rgba(232,228,222,0.7)",
                display: "flex", alignItems: "flex-start", gap: 12, lineHeight: 1.55,
              }}>
                <span style={{ color: T.red, fontWeight: 700, flexShrink: 0 }}>→</span>
                {f}
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// VERTICALS
// ─────────────────────────────────────────────────────────────
const VERTICALS = [
  { icon: "🏠", name: "Real Estate",        desc: "Proyectos de vivienda nueva en Colombia y USA con campañas de leads y mensajes." },
  { icon: "🦷", name: "Odontología",        desc: "Turismo dental, diseños de sonrisa y clínicas estéticas en mercados hispanohablantes." },
  { icon: "👙", name: "Moda & D2C",         desc: "E-commerce con ROAS escalable para marcas de consumo y moda." },
  { icon: "🍽️", name: "Restaurantes",       desc: "Campañas de domicilios con ROAS superior a 23X comprobado en Meta Ads." },
  { icon: "💆", name: "Estética y Belleza", desc: "Captación de clientes para centros estéticos en Colombia y Estados Unidos." },
  { icon: "📚", name: "Infoproductos",      desc: "Cursos, mentorías y programas con funnels de alta conversión." },
  { icon: "🏗️", name: "Construcción",      desc: "Constructoras e ingeniería con segmentación de inversores en múltiples ciudades." },
  { icon: "❤️", name: "Fundaciones & ONGs", desc: "Campañas de impacto social, donaciones y vinculación de voluntarios." },
];

function VerticalsSection() {
  return (
    <section style={{ padding: "120px 64px", background: T.black }}>
      <FadeUp>
        <SectionTag>Industrias</SectionTag>
        <h2 style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: "clamp(36px,4.5vw,68px)",
          lineHeight: 1, textTransform: "uppercase",
          letterSpacing: "-0.01em", marginBottom: 64, color: "#fff",
        }}>
          Verticales donde<br />somos expertos
        </h2>
      </FadeUp>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1px", background: T.border,
      }}>
        {VERTICALS.map((v, i) => (
          <FadeUp key={i} delay={i * 50}>
            <VerticalItem {...v} />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function VerticalItem({ icon, name, desc }: { icon: string; name: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(28,26,74,0.22)" : T.black,
        padding: "40px 32px", transition: "background 0.2s",
      }}
    >
      <span style={{ fontSize: 26, display: "block", marginBottom: 14 }}>{icon}</span>
      <div style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
        textTransform: "uppercase", marginBottom: 8, color: "#fff",
      }}>{name}</div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12, color: T.muted, lineHeight: 1.6,
      }}>{desc}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA FINAL
// ─────────────────────────────────────────────────────────────
const CONTACT_ITEMS = [
  { label: "WhatsApp", value: "+57 310 446 0407",            href: "https://wa.me/573104460407" },
  { label: "Email",    value: "juanhenao@nowadsagency.com",   href: "mailto:juanhenao@nowadsagency.com" },
  { label: "Instagram",value: "@juanhenaoads",                href: "https://instagram.com/juanhenaoads" },
  { label: "YouTube",  value: "Juan Henao",                   href: "https://youtube.com/@juanhenao" },
];

function CTASection() {
  return (
    <section id="cta" style={{
      padding: "160px 64px",
      background: T.gray,
      textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(232,228,222,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,228,222,0.03) 1px, transparent 1px)`,
        backgroundSize: "80px 80px", pointerEvents: "none",
      }} />
      {/* Red glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 900, height: 900,
        background: "radial-gradient(circle, rgba(230,59,46,0.07) 0%, transparent 62%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <FadeUp>
          <h2 style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "clamp(52px,8vw,116px)",
            lineHeight: 0.93, textTransform: "uppercase",
            letterSpacing: "-0.01em", margin: "0 0 28px", color: "#fff",
          }}>
            ¿Listo para<br />
            <span style={{ color: T.red }}>escalar?</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18, fontWeight: 300, color: T.muted,
            margin: "0 auto 52px", maxWidth: 480, lineHeight: 1.7,
          }}>
            Agenda una llamada gratuita de 30 minutos. Te mostramos exactamente qué haríamos con tu presupuesto publicitario.
          </p>
        </FadeUp>

        <FadeUp delay={100}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Btn href="https://wa.me/573104460407?text=Hola%20Juan,%20quiero%20agendar%20una%20asesor%C3%ADa%20gratuita">
              Agenda llamada gratuita →
            </Btn>
            <Btn href="mailto:juanhenao@nowadsagency.com" variant="ghost">
              Escribir por email
            </Btn>
          </div>

          <div style={{
            display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap",
          }}>
            {CONTACT_ITEMS.map((c, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 9, fontWeight: 600, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "rgba(232,228,222,0.25)",
                }}>{c.label}</span>
                <a href={c.href} target="_blank" rel="noreferrer" style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14, fontWeight: 600, color: T.red, textDecoration: "none",
                }}>{c.value}</a>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      padding: "36px 64px",
      background: T.black,
      borderTop: `1px solid ${T.border}`,
      display: "flex", justifyContent: "space-between",
      alignItems: "center", flexWrap: "wrap", gap: 20,
    }}>
      <div style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff",
      }}>
        JUAN HENAO <span style={{ color: T.red }}>ADS</span>
      </div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12, color: "rgba(232,228,222,0.25)",
      }}>
        © 2025 Juan Henao Ads · Medellín, Colombia · nowadsagency.com
      </span>
      <div style={{ display: "flex", gap: 28 }}>
        {["Servicios", "Resultados", "Planes", "Contacto"].map((l, i) => (
          <a key={i}
            href={l === "Contacto" ? "https://wa.me/573104460407" : `#${["services","results","pricing",""][i]}`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, color: "rgba(232,228,222,0.3)",
              textDecoration: "none", transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = T.red)}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,228,222,0.3)")}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES (inyectadas en <head>)
// ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Montserrat:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #000; color: #E8E4DE; overflow-x: hidden; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @media (max-width: 1024px) {
    .nav-links-desktop { display: none !important; }
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #000; }
  ::-webkit-scrollbar-thumb { background: #E63B2E; }
`;

// ─────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <MarqueeBand />
      <MethodSection />
      <ServicesSection />
      <PricingSection />
      <ResultsSection />
      <HeyGenSection />
      <VerticalsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
