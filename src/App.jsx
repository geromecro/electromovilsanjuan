import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Battery, Zap, Lightbulb, Wrench, Phone, Mail, MapPin, ChevronRight, MessageCircle, Package, CreditCard, Cog, SearchCheck, ShieldCheck, Clock, Truck, HardHat } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const WHATSAPP = 'https://wa.me/5492646227950'

function trackWhatsAppConversion() {
  if (typeof gtag === 'function') {
    gtag('event', 'conversion', {
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
        <img src="/logo.webp" alt="Electromóvil" className="h-8 md:h-10 w-auto" />
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
            <div className="hero-fade-in mt-6 flex items-center gap-3 text-ivory/50 text-sm md:text-base font-light tracking-widest uppercase" style={{animationDelay: '0.42s'}}>
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
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={22} className="text-yellow-brand mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-ivory/90 font-light text-base md:text-lg leading-snug">{text}</span>
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
                  <div className="text-ivory/40 text-xs uppercase tracking-widest mt-1">{s.label}</div>
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
          <span className="text-ivory/30 text-xs font-mono uppercase tracking-widest">Deslizar</span>
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
      <p className="text-ivory/40 text-sm">Identificamos fallas antes de que se conviertan en problemas mayores.</p>
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
                <div className="font-mono text-xs text-ivory/40">{item.status}</div>
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
  const messages = [
    'Batería 12V/100Ah — Stock disponible',
    'Alternador Bosch 90A — Garantía 1 año',
    'Arranque Ford Falcon — Revisado y listo',
    '+30 marcas en depósito',
    'Envio mismo día — S/C consulte',
    'Disponibilidad inmediata confirmada',
  ]
  const [msgIndex, setMsgIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const current = messages[msgIndex]
    if (charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1))
        setCharIndex((c) => c + 1)
      }, 45)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setMsgIndex((m) => (m + 1) % messages.length)
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
      <p className="text-ivory/40 text-sm">+30 marcas. Disponibilidad al instante. Sin esperas.</p>
      <div className="mt-2 bg-black/60 rounded-2xl p-4 border border-white/5 min-h-[80px]">
        <div className="font-mono text-xs text-yellow-brand/60 mb-2">$ stock_check --live</div>
        <div className="font-mono text-sm text-ivory leading-relaxed">
          {displayed}
          <span className="cursor-blink text-yellow-brand">▌</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <span className="font-mono text-xs text-ivory/30">Sistema activo</span>
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
        <span className="font-mono text-xs text-ivory/40 uppercase tracking-widest">// Turnos</span>
      </div>
      <h3 className="font-heading font-bold text-xl text-ivory">Reparación de Arranques y Alternadores</h3>
      <p className="text-ivory/40 text-sm">Servicio técnico especializado. Agendá tu turno fácil.</p>

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
            <span className={`text-xs font-mono ${activeDay === i ? 'text-black font-bold' : 'text-ivory/30'}`}>{d}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${activeDay === i ? 'bg-black' : 'bg-white/10'}`} />
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={() => { trackWhatsAppConversion(); window.open(WHATSAPP + '?text=Quiero%20agendar%20un%20turno', '_blank'); }}
        className={`mt-2 py-2.5 rounded-full font-heading font-bold text-sm transition-all duration-500 ${saved
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
    const ctx = gsap.context(() => {
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
    return () => ctx.revert()
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
        <h2 className="font-heading font-black text-4xl md:text-5xl text-ivory mt-3">
          Todo lo que tu vehículo
          <br />
          <span className="text-gradient-yellow">necesita</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="feature-card order-3 md:order-1"><ShufflerCard /></div>
        <div className="feature-card order-1 md:order-2"><TypewriterCard /></div>
        <div className="feature-card order-2 md:order-3"><SchedulerCard /></div>
      </div>

      {/* Product categories */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4">
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
    </section>
  )
}

// ─── PHILOSOPHY ─────────────────────────────────────────────────────────────────
function Philosophy() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    return () => ctx.revert()
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

          <div className="manifesto-line mt-8 max-w-2xl mx-auto text-ivory/50 text-base md:text-lg leading-relaxed font-light">
            Electromóvil San Juan es una empresa autopartista con más de 40 años de trayectoria.
            Contamos con el más completo y variado stock de repuestos del automotor en San Juan.
          </div>
        </div>

        {/* Feature cards */}
        <div className="manifesto-line grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {[
            { icon: Package, title: 'Stock completo', desc: 'Baterías, alternadores, arranques, lámparas y más' },
            { icon: Wrench, title: 'Reparación', desc: 'Servicio técnico de arranques y alternadores' },
            { icon: SearchCheck, title: 'Diagnóstico gratis', desc: 'Revisamos tu batería sin costo' },
            { icon: HardHat, title: 'Equipo minero', desc: 'Equipamiento especializado para minería' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 md:p-6 hover:border-yellow-brand/30 transition-colors">
              <Icon size={28} className="text-yellow-brand mb-4" strokeWidth={1.5} />
              <h3 className="font-heading font-semibold text-ivory text-base md:text-lg">{title}</h3>
              <p className="text-ivory/40 text-sm mt-2 leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─── PRODUCT GALLERY ─────────────────────────────────────────────────────────
function ProductGallery() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    return () => ctx.revert()
  }, [])

  const products = [
    {
      name: 'Baterías',
      desc: 'Amplio stock de baterías para autos, camionetas y maquinaria. Las mejores marcas con garantía.',
      img: '/productos/baterias.webp',
      alt: 'Baterías para vehículos en San Juan',
    },
    {
      name: 'Alternadores',
      desc: 'Alternadores nuevos y reparados. Diagnóstico gratuito para verificar el estado del tuyo.',
      img: '/productos/alternadores.webp',
      alt: 'Alternadores para autos en San Juan',
    },
    {
      name: 'Arranques',
      desc: 'Motores de arranque de todas las marcas. Servicio de reparación en el momento.',
      img: '/productos/arranques.webp',
      alt: 'Motores de arranque para vehículos',
    },
    {
      name: 'Pértigas',
      desc: 'Equipamiento especializado para minería y trabajo en altura. Consulte disponibilidad.',
      img: '/productos/pertigas.webp',
      alt: 'Pértigas y equipamiento minero',
    },
    {
      name: 'Faros y Ópticas',
      desc: 'Ópticas completas y faros para todas las marcas y modelos. Consultá disponibilidad.',
      img: '/productos/opticas.webp',
      alt: 'Faros y ópticas para vehículos',
    },
    {
      name: 'Lámparas',
      desc: 'Lámparas LED y halógenas de alta calidad. Mejorá la visibilidad de tu vehículo.',
      img: '/productos/lamparas.webp',
      alt: 'Lámparas LED para autos',
    },
  ]

  return (
    <section id="products" ref={sectionRef} className="py-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="font-mono text-xs text-yellow-brand uppercase tracking-widest">// Nuestros Productos</span>
        <h2 className="font-heading font-black text-4xl md:text-5xl text-ivory mt-3">
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
              <p className="text-ivory/40 text-sm mt-2 leading-relaxed font-light">{product.desc}</p>
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
    const ctx = gsap.context(() => {
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
    return () => ctx.revert()
  }, [])

  const tiers = [
    {
      name: 'Consulta',
      desc: 'Asesoramiento por WhatsApp sobre tu repuesto o falla.',
      price: 'Gratis',
      features: ['Respuesta rápida', 'Asesor especializado', 'Sin compromiso'],
      cta: 'Consultar',
      href: WHATSAPP,
      accent: false,
    },
    {
      name: 'Diagnóstico',
      desc: 'Traé tu auto y te hacemos el diagnóstico completo sin costo.',
      price: 'Gratis',
      features: ['Batería + Alternador + Arranque', 'Tecnología especializada', 'Informe detallado'],
      cta: 'Agendar Turno',
      href: `${WHATSAPP}?text=Quiero%20agendar%20un%20turno%20para%20diagn%C3%B3stico`,
      accent: true,
    },
    {
      name: 'Reparación',
      desc: 'Reparamos arranques y alternadores en nuestro taller.',
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
        <h2 className="font-heading font-black text-4xl md:text-5xl text-ivory mt-3">
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
            <p className={`text-sm mb-6 ${tier.accent ? 'text-black/70' : 'text-ivory/40'}`}>{tier.desc}</p>
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
            <img src="/logo.webp" alt="Electromóvil" className="h-12 w-auto" />
          </div>
          <p className="text-ivory/30 text-sm leading-relaxed max-w-xs">
            Repuestos eléctricos del automotor con más de 40 años de trayectoria en San Juan.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
            <span className="font-mono text-xs text-ivory/30">SISTEMA OPERATIVO</span>
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
              { label: 'Contacto', href: '#footer' },
            ].map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-ivory/30 text-sm hover:text-yellow-brand nav-link py-2 inline-block"
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
            <li className="flex items-start gap-2 text-ivory/30 text-sm">
              <MapPin size={14} className="text-yellow-brand mt-0.5 shrink-0" />
              Av. Guillermo Rawson 158 Sur, San Juan
            </li>
            <li>
              <a
                href="tel:2646227950"
                className="flex items-center gap-2 text-ivory/30 text-sm hover:text-yellow-brand nav-link"
              >
                <Phone size={14} className="text-yellow-brand" />
                (0264) 6227950
              </a>
            </li>
            <li>
              <a
                href="mailto:electromoviladm@gmail.com"
                className="flex items-center gap-2 text-ivory/30 text-sm hover:text-yellow-brand nav-link"
              >
                <Mail size={14} className="text-yellow-brand" />
                electromoviladm@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono text-xs text-ivory/20">
          © {new Date().getFullYear()} Electromóvil San Juan. Todos los derechos reservados.
        </span>
        <span className="font-mono text-xs text-ivory/20">
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
        <ProductGallery />
        <CTASection />
      </main>
      <Footer />
      <FloatingWA />
    </div>
  )
}
