import { useEffect, useRef, useState } from 'react'
import { Battery, Zap, Lightbulb, Wrench, Phone, Mail, MapPin, ChevronRight, MessageCircle, Package, CreditCard, Cog, SearchCheck, ShieldCheck, Clock, Truck, HardHat } from 'lucide-react'

let gsap, ScrollTrigger
const gsapReady = import('gsap').then(m => {
  gsap = m.gsap
  return import('gsap/ScrollTrigger')
}).then(m => {
  ScrollTrigger = m.ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)
})

const WHATSAPP = 'https://wa.me/5492646227950'
const TYPEWRITER_MESSAGES = [
  'Batería 12V/100Ah — Stock disponible',
  'Alternador Bosch 90A — Garantía 1 año',
  'Arranque Ford Falcon — Revisado y listo',
  '+30 marcas en depósito',
  'Envio mismo día — S/C consulte',
  'Disponibilidad inmediata confirmada',
]

function trackWhatsAppConversion() {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      'send_to': 'AW-16873673665/vUk2CJ7s2P0bEMGn_-0-',
    })
  }
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Inicio', href: '#hero' },
    { label: 'Servicios', href: '#features' },
    { label: 'Nosotros', href: '#philosophy' },
    { label: 'Guías', href: '#guias-seo' },
    { label: 'Contacto', href: '#footer' },
  ]

  return (
    <nav
      ref={navRef}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[calc(100%-2rem)] max-w-5xl rounded-full px-6 py-3 flex items-center justify-between ${scrolled
          ? 'glass-dark border-yellow-subtle glow-yellow'
          : 'bg-black/30 backdrop-blur-sm'
        }`}
    >
      {/* Logo */}
      <a href="#hero" className="flex items-center group">
        <img src="/logo.webp" alt="Electromóvil" className="h-8 md:h-10 w-auto" width="192" height="36" />
      </a>

      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="nav-link text-sm font-medium text-ivory/70 hover:text-yellow-brand">
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        id="nav-cta"
        onClick={trackWhatsAppConversion}
        className="hidden md:flex btn-magnetic items-center gap-2 bg-yellow-brand text-black font-bold text-sm px-5 py-2 rounded-full"
      >
        <span className="btn-bg-slide bg-yellow-light rounded-full" />
        <MessageCircle size={14} className="relative z-10" />
        <span className="relative z-10">Contactar</span>
      </a>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-ivory p-3 -mr-3"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menú"
      >
        <div className="space-y-1.5">
          <span className={`block h-0.5 bg-yellow-brand transition-all duration-300 ${menuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
          <span className={`block h-0.5 bg-ivory transition-all duration-300 ${menuOpen ? 'opacity-0' : 'w-4'}`} />
          <span className={`block h-0.5 bg-yellow-brand transition-all duration-300 ${menuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
        </div>
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-full mt-3 left-0 right-0 glass-dark border-subtle rounded-3xl p-4 flex flex-col gap-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-ivory/80 font-medium py-2 px-4 rounded-2xl hover:bg-yellow-brand/10 hover:text-yellow-brand transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-brand text-black font-bold text-center py-2.5 rounded-full mt-1"
            onClick={() => { trackWhatsAppConversion(); setMenuOpen(false); }}
          >
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </nav>
  )
}

// ─── HERO ───────────────────────────────────────────────────────────────────────
function Hero() {
  const heroRef = useRef(null)

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-end pb-24 md:pb-32 overflow-hidden"
      style={{
        backgroundImage: `url('/hero-alternator.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: '40% 92%',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Electric glow accent */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-yellow-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="grid md:grid-cols-[1fr_1fr] gap-10 md:gap-16 items-end">
          {/* Left column */}
          <div>
            {/* Badge */}
            <div className="hero-fade-in inline-flex items-center gap-2 border-yellow-subtle rounded-full px-4 py-1.5 mb-6 glass-dark" style={{animationDelay: '0.3s'}}>
              <span className="w-2 h-2 rounded-full bg-yellow-brand pulse-dot" />
              <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">+40 Años de Trayectoria</span>
            </div>

            {/* Headline */}
            <h1 className="max-w-3xl">
              <div className="font-heading font-medium text-4xl md:text-6xl lg:text-7xl text-ivory leading-tight tracking-tight">
                Repuestos del automotor
              </div>
              <div className="font-heading font-medium text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
                en <span className="text-gradient-yellow">San Juan.</span>
              </div>
            </h1>

            {/* Subline */}
            <div className="hero-fade-in mt-6 flex items-center gap-3 text-ivory/50 text-sm md:text-base font-normal tracking-widest uppercase" style={{animationDelay: '0.42s'}}>
              <span>Calidad</span>
              <span className="w-1 h-1 rounded-full bg-yellow-brand" />
              <span>Asesoramiento</span>
              <span className="w-1 h-1 rounded-full bg-yellow-brand" />
              <span>Compromiso</span>
            </div>

            {/* CTAs */}
            <div className="hero-fade-in flex flex-wrap gap-4 mt-10" style={{animationDelay: '0.54s'}}>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-cta-primary"
                onClick={trackWhatsAppConversion}
                className="btn-magnetic inline-flex items-center gap-3 bg-yellow-brand text-black font-bold px-8 py-4 rounded-full text-base"
              >
                <span className="btn-bg-slide bg-yellow-light rounded-full" />
                <MessageCircle size={18} className="relative z-10" />
                <span className="relative z-10">Consultanos por WhatsApp</span>
                <ChevronRight size={16} className="relative z-10" />
              </a>
            </div>
          </div>

          {/* Right column — Services grid */}
          <div className="gsap-hidden hidden md:flex md:flex-col relative">
            <div className="absolute -inset-8 rounded-3xl bg-black/30 backdrop-blur-sm border border-white/[0.04]" />
            <div className="relative z-10 grid grid-cols-2 gap-x-12 gap-y-10 py-2">
              {[
                { icon: Package, text: 'Venta de repuestos' },
                { icon: Zap, text: 'Disponibilidad inmediata' },
                { icon: Lightbulb, text: 'Calidad y variedad' },
                { icon: CreditCard, text: 'Formas de financiación' },
                { icon: Cog, text: 'Reparación de arranques y alternadores' },
                { icon: SearchCheck, text: 'Diagnóstico de baterías gratuito' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon size={22} className="text-yellow-brand mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-ivory/90 font-normal text-base md:text-lg leading-snug">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Stats Row — below list */}
            <div className="relative z-10 flex gap-12 mt-10">
              {[
                { n: '+150', label: 'Reseñas' },
                { n: '+100', label: 'Productos' },
                { n: '+30', label: 'Marcas' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-mono font-bold text-4xl text-yellow-brand">{s.n}</div>
                  <div className="text-ivory/60 text-xs uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="gsap-hidden mt-12 flex items-center gap-3">
          <div className="w-6 h-10 rounded-full border border-ivory/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-yellow-brand rounded-full animate-bounce" />
          </div>
          <span className="text-ivory/50 text-xs font-mono uppercase tracking-widest">Deslizar</span>
        </div>
      </div>
    </section>
  )
}

// ─── FEATURES ──────────────────────────────────────────────────────────────────
// Card 1: Diagnostic Shuffler — Battery / Alternator / Starter
function ShufflerCard() {
  const [items, setItems] = useState([
    { icon: Battery, label: 'Batería', status: 'Diagnóstico en 5 min', color: 'text-yellow-brand' },
    { icon: Zap, label: 'Alternador', status: 'Carga correcta', color: 'text-yellow-light' },
    { icon: Wrench, label: 'Arranque', status: 'Sin desgaste', color: 'text-yellow-dark' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev]
        next.unshift(next.pop())
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card-surface rounded-4xl p-7 flex flex-col gap-4 glow-yellow relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Diagnóstico</span>
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full pulse-dot" />
      </div>
      <h3 className="font-heading font-bold text-xl text-ivory">Gratuito & Preciso</h3>
      <p className="text-ivory/60 text-sm">Identificamos fallas antes de que se conviertan en problemas mayores.</p>
      <div className="relative h-36 mt-2">
        {items.map((item, i) => {
          const Icon = item.icon
          const offsets = [0, 56, 112]
          return (
            <div
              key={item.label}
              className="absolute left-0 right-0 flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl px-4 py-3"
              style={{
                top: offsets[i],
                opacity: i === 0 ? 1 : i === 1 ? 0.6 : 0.3,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 3 - i,
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-yellow-brand/10 flex items-center justify-center">
                <Icon size={16} className={item.color} />
              </div>
              <div>
                <div className="font-heading font-semibold text-sm text-ivory">{item.label}</div>
                <div className="font-mono text-xs text-ivory/60">{item.status}</div>
              </div>
              {i === 0 && (
                <span className="ml-auto font-mono text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">OK</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Card 2: Typewriter — Live repuestos feed
function TypewriterCard() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const current = TYPEWRITER_MESSAGES[msgIndex]
    if (charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1))
        setCharIndex((c) => c + 1)
      }, 45)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setMsgIndex((m) => (m + 1) % TYPEWRITER_MESSAGES.length)
        setDisplayed('')
        setCharIndex(0)
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [charIndex, msgIndex])

  return (
    <div className="card-surface rounded-4xl p-7 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-yellow-brand pulse-dot" />
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">Live Feed</span>
      </div>
      <h3 className="font-heading font-bold text-xl text-ivory">Repuestos Inmediatos</h3>
      <p className="text-ivory/60 text-sm">+30 marcas. Disponibilidad al instante. Sin esperas.</p>
      <div className="mt-2 bg-black/60 rounded-2xl p-4 border border-white/5 min-h-[80px]">
        <div className="font-mono text-xs text-yellow-brand/60 mb-2">$ stock_check --live</div>
        <div className="font-mono text-sm text-ivory leading-relaxed">
          {displayed}
          <span className="cursor-blink text-yellow-brand">▌</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="font-mono text-xs text-ivory/50">Sistema activo</span>
      </div>
    </div>
  )
}

// Card 3: Scheduler — Weekly appointment grid
function SchedulerCard() {
  const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  const [activeDay, setActiveDay] = useState(null)
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState(0) // 0=idle, 1=selecting, 2=saving, 3=done

  useEffect(() => {
    const sequence = async () => {
      await delay(1000)
      setStep(1)
      setActiveDay(1) // Monday
      await delay(800)
      setActiveDay(3) // Wednesday
      await delay(800)
      setStep(2)
      await delay(600)
      setSaved(true)
      setStep(3)
      await delay(2000)
      setActiveDay(null)
      setSaved(false)
      setStep(0)
    }
    const interval = setInterval(sequence, 5000)
    sequence()
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card-surface rounded-4xl p-7 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs text-ivory/60 uppercase tracking-widest">// Turnos</span>
      </div>
      <h3 className="font-heading font-bold text-xl text-ivory">Reparación de Arranques y Alternadores</h3>
      <p className="text-ivory/60 text-sm">Servicio técnico especializado. Agendá tu turno fácil.</p>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2 mt-2">
        {days.map((d, i) => (
          <div
            key={d}
            className={`flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all duration-500 ${activeDay === i
                ? 'bg-yellow-brand scale-95'
                : 'bg-black/40 border border-white/5'
              }`}
          >
            <span className={`text-xs font-mono ${activeDay === i ? 'text-black font-bold' : 'text-ivory/50'}`}>{d}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${activeDay === i ? 'bg-black' : 'bg-white/10'}`} />
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={() => { trackWhatsAppConversion(); window.open(WHATSAPP + '?text=Quiero%20agendar%20un%20turno', '_blank'); }}
        className={`mt-2 py-2.5 min-h-[44px] rounded-full font-heading font-bold text-sm transition-all duration-500 ${saved
            ? 'bg-green-500 text-white scale-95'
            : step === 2
              ? 'bg-yellow-brand/50 text-black/50 scale-95'
              : 'bg-yellow-brand text-black hover:bg-yellow-light'
          }`}
      >
        {saved ? '✓ Turno agendado' : 'Agendar Turno'}
      </button>
    </div>
  )
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

function Features() {
  const sectionRef = useRef(null)

  useEffect(() => {
    let ctx
    gsapReady.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.feature-card',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        )
      }, sectionRef)
    })
    return () => ctx?.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="relative py-28 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
      {/* Subtle product texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/alternator-exploded.jpg')`,
          backgroundSize: '600px auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Section header */}
      <div className="mb-16 text-center">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Nuestros Servicios</span>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-ivory mt-3">
          Todo lo que tu vehículo
          <br />
          <span className="text-gradient-yellow">necesita</span>
        </h2>
      </div>

      {/* Product categories */}
      <div className="mb-16 grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Battery, label: 'Baterías' },
          { icon: Zap, label: 'Alternadores' },
          { icon: Wrench, label: 'Arranques' },
          { icon: Lightbulb, label: 'Ópticas y Faros' },
          { icon: Lightbulb, label: 'Lámparas' },
        ].map((p) => {
          const Icon = p.icon
          return (
            <a
              key={p.label}
              href={`${WHATSAPP}?text=${encodeURIComponent(`Hola, consulto por ${p.label}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppConversion}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] py-6 px-4 hover:border-yellow-brand/40 hover:bg-yellow-brand/5 transition-all"
            >
              <Icon size={32} className="text-yellow-brand group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="text-ivory/80 font-medium text-sm md:text-base group-hover:text-ivory transition-colors">{p.label}</span>
            </a>
          )
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="feature-card order-3 md:order-1"><ShufflerCard /></div>
        <div className="feature-card order-1 md:order-2"><TypewriterCard /></div>
        <div className="feature-card order-2 md:order-3"><SchedulerCard /></div>
      </div>
    </section>
  )
}

// ─── PHILOSOPHY ─────────────────────────────────────────────────────────────────
function Philosophy() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    let ctx
    gsapReady.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.manifesto-line',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
        gsap.to('.philosophy-bg', {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }, sectionRef)
    })
    return () => ctx?.revert()
  }, [])

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative overflow-hidden py-36 px-6 md:px-12"
      style={{ background: '#0A0A0A' }}
    >
      {/* Parallax background texture */}
      <div
        className="philosophy-bg absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url('/bg-mountains.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      {/* Yellow glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-brand/5 rounded-full blur-[100px] pointer-events-none" />

      <div ref={textRef} className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <span className="manifesto-line font-mono text-xs text-yellow-brand uppercase tracking-widest">// Quiénes Somos</span>

          <h2 className="manifesto-line mt-6 font-drama italic text-4xl md:text-6xl lg:text-7xl text-ivory leading-tight">
            La solución integral
            <br />
            <span className="text-gradient-yellow">para tu vehículo.</span>
          </h2>

          <div className="manifesto-line mt-8 max-w-2xl mx-auto text-ivory/70 text-base md:text-lg leading-relaxed">
            Electromóvil San Juan es una empresa autopartista con más de 40 años
            de trayectoria, fundada en 1985. Desde nuestro local en Av. Guillermo Rawson 158 Sur,
            en pleno centro de San Juan, atendemos a miles de clientes que confían
            en nuestra experiencia y variedad de stock.
          </div>
          <div className="manifesto-line mt-4 max-w-2xl mx-auto text-ivory/70 text-base md:text-lg leading-relaxed">
            Contamos con el más completo surtido de repuestos eléctricos del automotor
            en la provincia: baterías de las marcas Moura, Reymax y Sermat,
            alternadores, motores de arranque, lámparas LED y halógenas, ópticas
            completas y equipamiento eléctrico para minería. Nuestro compromiso
            es ofrecer productos de calidad con asesoramiento técnico real.
          </div>
          <div className="manifesto-line mt-4 max-w-2xl mx-auto text-ivory/70 text-base md:text-lg leading-relaxed">
            Lo que nos diferencia es nuestro servicio integral: diagnóstico gratuito
            de baterías en 5 minutos, reparación de arranques y alternadores en
            nuestro propio taller con garantía de trabajo, y un equipo que conoce
            cada pieza porque lleva décadas en el rubro. No solo vendemos repuestos
            — te ayudamos a encontrar la solución correcta para tu vehículo.
          </div>
        </div>

        {/* Feature cards */}
        <div className="manifesto-line grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {[
            { icon: Package, title: 'Stock completo', desc: 'Baterías, alternadores, arranques, lámparas y más' },
            { icon: Wrench, title: 'Reparación', desc: 'Servicio técnico de arranques y alternadores' },
            { icon: SearchCheck, title: 'Diagnóstico gratis', desc: 'Revisamos tu batería sin costo' },
            { icon: HardHat, title: 'Equipo minero', desc: 'Equipamiento especializado para minería' },
          ].map((item) => (
            <div key={item.title} className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6 hover:border-yellow-brand/30 transition-colors">
              <item.icon size={28} className="text-yellow-brand mb-4" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-ivory text-base md:text-lg">{item.title}</h3>
              <p className="text-ivory/60 text-sm mt-2 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
function Testimonials() {
  const sectionRef = useRef(null)

  useEffect(() => {
    let ctx
    gsapReady.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.testimonial-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
            },
          }
        )
      }, sectionRef)
    })
    return () => ctx?.revert()
  }, [])

  const reviews = [
    {
      name: 'Ariel Andres Brizuela',
      rating: 5,
      text: 'Tienen muy buenos precios, compré un campo de arranque que en otros lados me salía 25000 más caros. Gracias por tener precios económicos! Sigan así!',
    },
    {
      name: 'Gabriel Burgoa',
      rating: 5,
      text: 'Muy buena atención... Desde el dueño hasta sus empleados... Y los precios son excelentes!',
    },
    {
      name: 'Gonzalo Andersen',
      rating: 5,
      text: 'Excelente atención, todos los muchachos muy buenas personas y muy recomendable en precios y calidad.',
    },
    {
      name: 'Miguel Castillo',
      rating: 5,
      text: 'Tienen buen precio en baterías y variedad.',
    },
  ]

  return (
    <section ref={sectionRef} className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Reseñas</span>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-ivory mt-3">
          Lo que dicen nuestros <span className="text-gradient-yellow">clientes</span>
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-5 h-5 text-yellow-brand" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-ivory/70 text-sm font-semibold">4.5/5</span>
          <span className="text-ivory/50 text-sm">— 173 reseñas en Google</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {reviews.map((review) => (
          <div
            key={review.name}
            className="testimonial-card rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col gap-4 hover:border-yellow-brand/20 transition-colors"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: review.rating }, (_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-brand" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-ivory/70 text-sm leading-relaxed flex-1">"{review.text}"</p>
            <div className="font-heading font-semibold text-ivory text-sm">{review.name}</div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <a
          href="https://www.google.com/maps/place/Electrom%C3%B3vil+San+Juan/@-31.5353451,-68.5172776,17z/data=!3m1!4b1!4m6!3m5!1s0x96816a85cd8d9f15:0xe18bcfafa1dcfb6e!8m2!3d-31.5353497!4d-68.5147027!16s%2Fg%2F11g6xwv814"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-yellow-brand font-mono text-sm hover:underline"
        >
          Ver las 173 reseñas en Google <ChevronRight size={14} />
        </a>
      </div>
    </section>
  )
}

// ─── PRODUCT GALLERY ─────────────────────────────────────────────────────────
function ProductGallery() {
  const sectionRef = useRef(null)

  useEffect(() => {
    let ctx
    gsapReady.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.product-card',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      }, sectionRef)
    })
    return () => ctx?.revert()
  }, [])

  const products = [
    {
      name: 'Baterías',
      desc: 'Trabajamos con las marcas líderes del mercado: Moura, Reymax y Sermat. Tenemos baterías para autos, camionetas, utilitarios, maquinaria pesada y motos. El clima extremo de San Juan exige baterías de alta resistencia térmica — por eso seleccionamos productos que garantizan rendimiento y durabilidad en temperaturas elevadas. Todas nuestras baterías vienen con garantía de fábrica y te hacemos el diagnóstico gratuito antes de la compra para asegurarnos de que realmente necesitás un cambio.',
      img: '/productos/baterias.webp',
      alt: 'Baterías Moura, Reymax y Sermat para vehículos en San Juan',
    },
    {
      name: 'Alternadores',
      desc: 'Alternadores nuevos y reparados para todas las marcas y modelos. Contamos con banco de pruebas para verificar carga y estado antes de la instalación. Si tu alternador tiene fallas, nuestro equipo técnico lo evalúa sin costo y te ofrece la mejor solución: reparación en nuestro taller o reemplazo por uno nuevo con garantía.',
      img: '/productos/alternadores.webp',
      alt: 'Alternadores para autos y camionetas en San Juan',
    },
    {
      name: 'Arranques',
      desc: 'Motores de arranque de todas las marcas nacionales e importadas. Nuestro taller especializado realiza reparaciones con repuestos originales y garantía de trabajo. Si tu vehículo no enciende o el arranque gira lento, traélo para un diagnóstico sin cargo — te damos una solución rápida y confiable.',
      img: '/productos/arranques.webp',
      alt: 'Motores de arranque para vehículos en San Juan',
    },
    {
      name: 'Pértigas',
      desc: 'Equipamiento especializado para minería y trabajo en altura. San Juan es una de las principales provincias mineras de Argentina, y proveemos pértigas y accesorios eléctricos para la industria. Consultá disponibilidad y especificaciones técnicas por WhatsApp.',
      img: '/productos/pertigas.webp',
      alt: 'Pértigas y equipamiento eléctrico minero en San Juan',
    },
    {
      name: 'Faros y Ópticas',
      desc: 'Ópticas completas, faros delanteros y traseros para todas las marcas y modelos. Trabajamos con líneas originales y alternativas de calidad. Una óptica en buen estado es fundamental para la seguridad vial — si la tuya tiene fisuras o empañamiento, te asesoramos sobre la mejor opción de reemplazo.',
      img: '/productos/opticas.webp',
      alt: 'Faros y ópticas completas para autos en San Juan',
    },
    {
      name: 'Lámparas',
      desc: 'Lámparas LED, halógenas y xenón de alta calidad para todo tipo de vehículo. Mejorá la visibilidad y la seguridad de manejo nocturno con nuestras lámparas de primeras marcas. Tenemos opciones para faros principales, luces de posición, giro, freno y marcha atrás.',
      img: '/productos/lamparas.webp',
      alt: 'Lámparas LED y halógenas para autos en San Juan',
    },
  ]

  return (
    <section id="products" ref={sectionRef} className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Nuestros Productos</span>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-ivory mt-3">
          Repuestos con{' '}
          <span className="text-gradient-yellow">garantía</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <a
            key={product.name}
            href={`${WHATSAPP}?text=${encodeURIComponent(`Hola, consulto por ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackWhatsAppConversion}
            className="product-card group relative rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-yellow-brand/30 transition-all duration-300"
          >
            {/* Image area */}
            <div className="relative h-52 md:h-64 bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden">
              <img
                src={product.img}
                alt={product.alt}
                loading="lazy"
                width={600}
                height={400}
                className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              {/* Fallback icon when no image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Package size={48} className="text-yellow-brand/20" strokeWidth={1} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4">
              <h3 className="font-heading font-bold text-xl text-ivory group-hover:text-yellow-brand transition-colors">
                {product.name}
              </h3>
              <p className="text-ivory/60 text-sm mt-2 leading-relaxed font-normal">{product.desc}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-yellow-brand font-mono text-sm group-hover:gap-3 transition-all">
                Consultar <ChevronRight size={14} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── CTA SECTION ────────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useRef(null)
  useEffect(() => {
    let ctx
    gsapReady.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.cta-content',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 75%' },
          }
        )
      }, ref)
    })
    return () => ctx?.revert()
  }, [])

  const tiers = [
    {
      name: 'Consulta',
      desc: 'Escribinos por WhatsApp y te asesoramos sobre el repuesto que necesitás. Nuestro equipo con más de 40 años de experiencia te orienta sobre compatibilidad, marcas y disponibilidad sin compromiso.',
      price: 'Gratis',
      features: ['Respuesta rápida', 'Asesor especializado', 'Sin compromiso'],
      cta: 'Consultar',
      href: WHATSAPP,
      accent: false,
    },
    {
      name: 'Diagnóstico',
      desc: 'Traé tu vehículo y en 5 minutos te hacemos un diagnóstico completo de batería, alternador y arranque con equipamiento profesional. Detectamos fallas antes de que se conviertan en un problema mayor.',
      price: 'Gratis',
      features: ['Batería + Alternador + Arranque', 'Tecnología especializada', 'Informe detallado'],
      cta: 'Agendar Turno',
      href: `${WHATSAPP}?text=Quiero%20agendar%20un%20turno%20para%20diagn%C3%B3stico`,
      accent: true,
    },
    {
      name: 'Reparación',
      desc: 'Reparamos arranques y alternadores en nuestro propio taller con repuestos de calidad y garantía de trabajo. No tercerizamos — hacemos todo en casa para darte la mejor solución al mejor precio.',
      price: 'A consultar',
      features: ['+40 años de experiencia', 'Garantía de trabajo', 'Repuestos de calidad'],
      cta: 'Consultar Precio',
      href: `${WHATSAPP}?text=Quiero%20consultar%20precio%20de%20reparaci%C3%B3n`,
      accent: false,
    },
  ]

  return (
    <section ref={ref} className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16 cta-content">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Nuestros Servicios</span>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-ivory mt-3">
          Elegí cómo <span className="text-gradient-yellow">ayudarte</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`cta-content rounded-4xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${tier.accent
                ? 'bg-yellow-brand glow-yellow-strong'
                : 'card-surface border-subtle hover:border-yellow-subtle'
              }`}
          >
            <div className={`font-heading font-bold text-xs uppercase tracking-widest mb-2 ${tier.accent ? 'text-black/60' : 'text-yellow-brand'}`}>
              {tier.name}
            </div>
            <div className={`font-drama italic text-4xl font-bold mb-1 ${tier.accent ? 'text-black' : 'text-gradient-yellow'}`}>
              {tier.price}
            </div>
            <p className={`text-sm mb-6 ${tier.accent ? 'text-black/70' : 'text-ivory/60'}`}>{tier.desc}</p>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f} className={`flex items-center gap-2 text-sm ${tier.accent ? 'text-black/80' : 'text-ivory/60'}`}>
                  <span className={`text-base ${tier.accent ? 'text-black' : 'text-yellow-brand'}`}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWhatsAppConversion}
              className={`btn-magnetic w-full text-center py-3 rounded-full font-heading font-bold text-sm ${tier.accent
                  ? 'bg-black text-yellow-brand hover:bg-graphite'
                  : 'bg-yellow-brand text-black hover:bg-yellow-light'
                }`}
            >
              <span className="btn-bg-slide bg-yellow-light rounded-full" />
              <span className="relative z-10">{tier.cta}</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    let ctx
    gsapReady.then(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.faq-item',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
            },
          }
        )
      }, sectionRef)
    })
    return () => ctx?.revert()
  }, [])

  const faqs = [
    {
      q: '¿Cómo sé si mi batería necesita cambio?',
      a: 'Las señales más comunes son: el motor tarda en arrancar, las luces se ven más tenues de lo normal, el tablero muestra el ícono de batería, o la batería tiene más de 2-3 años de uso. En San Juan, el calor extremo del verano acorta la vida útil de las baterías. Te recomendamos traer tu vehículo para un diagnóstico gratuito — en 5 minutos te decimos el estado exacto de tu batería.',
    },
    {
      q: '¿Qué marcas de baterías trabajan?',
      a: 'Trabajamos con las tres marcas líderes del mercado argentino: Moura, Reymax y Sermat. Cada una tiene líneas específicas para autos, camionetas, utilitarios y maquinaria pesada. Te asesoramos sobre cuál es la mejor opción según tu vehículo, uso y presupuesto. Todas vienen con garantía de fábrica.',
    },
    {
      q: '¿Cuánto dura una batería en San Juan?',
      a: 'En condiciones normales, una batería dura entre 2 y 4 años. Sin embargo, el clima de San Juan — con veranos que superan los 40°C — acelera el desgaste interno de las baterías. Por eso recomendamos hacer un chequeo preventivo al menos una vez al año, especialmente antes del verano. Nuestro diagnóstico es gratuito y te ayuda a prevenir quedarte sin arranque.',
    },
    {
      q: '¿Hacen reparación de alternadores y arranques?',
      a: 'Sí, contamos con taller propio donde reparamos alternadores y motores de arranque de todas las marcas. Primero hacemos un diagnóstico sin costo para determinar si la pieza se puede reparar o si conviene reemplazarla. Todos nuestros trabajos tienen garantía y usamos repuestos de calidad.',
    },
    {
      q: '¿Cuáles son los horarios de atención?',
      a: 'Atendemos de lunes a viernes de 8:30 a 13:00 y de 16:30 a 20:00. Los sábados de 9:00 a 13:00. Estamos en Av. Guillermo Rawson 158 Sur, en el centro de San Juan. También podés consultarnos por WhatsApp fuera de horario y te respondemos a la brevedad.',
    },
    {
      q: '¿Aceptan tarjetas y transferencias?',
      a: 'Sí, aceptamos efectivo, transferencia bancaria, tarjetas de débito y tarjetas de crédito. Consultá por WhatsApp las opciones de financiación disponibles según el producto.',
    },
  ]

  return (
    <section id="faq" ref={sectionRef} className="py-28 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Preguntas Frecuentes</span>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-ivory mt-3">
          Resolvemos tus <span className="text-gradient-yellow">dudas</span>
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="faq-item rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-colors hover:border-yellow-brand/20"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left"
            >
              <h3 className="font-heading font-semibold text-ivory text-base md:text-lg pr-4">{faq.q}</h3>
              <ChevronRight
                size={20}
                className={`text-yellow-brand shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-90' : ''}`}
              />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-6 -mt-2">
                <p className="text-ivory/60 text-sm md:text-base leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── SEO LANDING LINKS ─────────────────────────────────────────────────────────
function SeoLandingLinks() {
  const guides = [
    {
      title: 'Baterías en San Juan',
      desc: 'Guía completa sobre marcas, garantía, síntomas de falla y chequeo gratuito.',
      href: '/baterias-san-juan/',
    },
    {
      title: 'Baterías de Auto en San Juan',
      desc: 'Qué batería elegir según uso, clima y tipo de vehículo.',
      href: '/baterias-de-auto-san-juan/',
    },
    {
      title: 'Precio de Batería de Auto',
      desc: 'Factores que definen el precio y cómo evitar pagar de más.',
      href: '/precio-bateria-auto-san-juan/',
    },
  ]

  return (
    <section id="guias-seo" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Guías útiles</span>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-ivory mt-3">
          Información para elegir <span className="text-gradient-yellow">mejor</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {guides.map((guide) => (
          <a
            key={guide.title}
            href={guide.href}
            className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-yellow-brand/30 transition-colors"
          >
            <h3 className="font-heading font-semibold text-xl text-ivory">{guide.title}</h3>
            <p className="text-ivory/60 text-sm mt-2 leading-relaxed">{guide.desc}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-yellow-brand font-mono text-sm">
              Ver guía <ChevronRight size={14} />
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      id="footer"
      className="bg-[#080808] rounded-t-[3rem] mt-8 px-6 md:px-12 py-16"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <img src="/logo.webp" alt="Electromóvil" className="h-12 w-auto" width="192" height="48" />
          </div>
          <p className="text-ivory/50 text-sm leading-relaxed max-w-xs">
            Repuestos eléctricos del automotor con más de 40 años de trayectoria en San Juan.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
            <span className="font-mono text-xs text-ivory/50">SISTEMA OPERATIVO</span>
          </div>
        </div>

        {/* Nav */}
        <div>
          <div className="font-mono text-xs text-yellow-brand uppercase tracking-widest mb-4">Sitio</div>
          <ul className="space-y-3">
            {[
              { label: 'Inicio', href: '#hero' },
              { label: 'Servicios', href: '#features' },
              { label: 'Nosotros', href: '#philosophy' },
              { label: 'Guías', href: '#guias-seo' },
              { label: 'Contacto', href: '#footer' },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-ivory/50 text-sm hover:text-yellow-brand nav-link py-3 inline-block"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="font-mono text-xs text-yellow-brand uppercase tracking-widest mb-4">Contacto</div>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-ivory/50 text-sm">
              <MapPin size={14} className="text-yellow-brand mt-0.5 shrink-0" />
              Av. Guillermo Rawson 158 Sur, San Juan
            </li>
            <li>
              <a
                href="tel:2644223645"
                className="flex items-center gap-2 text-ivory/50 text-sm hover:text-yellow-brand nav-link py-3 inline-flex"
              >
                <Phone size={14} className="text-yellow-brand" />
                (0264) 422-3645
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5492646227950"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-ivory/50 text-sm hover:text-yellow-brand nav-link py-3 inline-flex"
              >
                <MessageCircle size={14} className="text-yellow-brand" />
                (0264) 622-7950
              </a>
            </li>
            <li>
              <a
                href="mailto:electromoviladm@gmail.com"
                className="flex items-center gap-2 text-ivory/50 text-sm hover:text-yellow-brand nav-link py-3 inline-flex"
              >
                <Mail size={14} className="text-yellow-brand" />
                electromoviladm@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-ivory/40">
          © {new Date().getFullYear()} Electromóvil San Juan. Todos los derechos reservados.
        </span>
        <span className="font-mono text-xs text-ivory/40">
          Av. Rawson 158 Sur · San Juan · Argentina
        </span>
      </div>
    </footer>
  )
}

// ─── FLOATING WHATSAPP BUTTON ────────────────────────────────────────────────────
function FloatingWA() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      id="floating-wa"
      aria-label="WhatsApp"
      onClick={trackWhatsAppConversion}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.4)]"
    >
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  )
}

// ─── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <Testimonials />
        <ProductGallery />
        <CTASection />
        <FAQ />
        <SeoLandingLinks />
      </main>
      <Footer />
      <FloatingWA />
    </div>
  )
}
