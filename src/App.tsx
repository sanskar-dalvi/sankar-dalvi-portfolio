/**
 * Sanskar Dalvi — Portfolio (v3)
 * ─ Black & white palette only
 * ─ No Projects section
 * ─ Fixed layout / alignment
 * ─ Spline watermark hidden via CSS + pointer-events override
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "motion/react";
import {
  GraduationCap,
  Award,
  Mail,
  Github,
  Linkedin,
  ChevronDown,
  User,
  Briefcase,
  Code,
  Cpu,
} from "lucide-react";

import MagneticDock from "./components/ui/magnetic-dock";
import RadialOrbitalTimeline from "./components/ui/radial-orbital-timeline";

// ─── Lazy Spline ───
const Spline = lazy(() => import("@splinetool/react-spline"));
const SPLINE_URL = "https://prod.spline.design/RtfGXygWv012syZM/scene.splinecode";

function canLoadSpline() {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 768) return false;
  if (navigator.hardwareConcurrency <= 2) return false;
  const c = document.createElement("canvas");
  return !!(c.getContext("webgl2") || c.getContext("webgl"));
}

// Remove Spline "Built with Spline" badge injected into DOM
function useRemoveSplineWatermark() {
  useEffect(() => {
    const remove = () => {
      // Spline injects a fixed-position div at document level
      document.querySelectorAll<HTMLElement>('div[style*="position: fixed"]').forEach(el => {
        const style = el.getAttribute("style") || "";
        // Badge is always bottom-right with z-index
        if (
          (style.includes("bottom") || style.includes("right")) &&
          style.includes("fixed") &&
          el.innerHTML.toLowerCase().includes("spline")
        ) {
          el.remove();
        }
      });
      // Also try by checking innerText
      document.querySelectorAll<HTMLElement>('div[style]').forEach(el => {
        if (el.innerText?.toLowerCase().includes("built with spline")) {
          el.style.display = "none";
          el.remove();
        }
      });
    };
    const interval = setInterval(remove, 500);
    remove();
    return () => clearInterval(interval);
  }, []);
}

// ════════════════════════════════════════════════════════
// STAR + SHOOTING STAR CANVAS
// ════════════════════════════════════════════════════════
function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let frame = 0;

    type Star = { x: number; y: number; r: number; a: number; spd: number };
    type Shooter = { x: number; y: number; vx: number; vy: number; len: number; a: number; life: number; maxLife: number };

    const stars: Star[] = [];
    const shooters: Shooter[] = [];

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function initStars() {
      stars.length = 0;
      const n = Math.floor((window.innerWidth * window.innerHeight) / 3500);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.3 + 0.2,
          a: Math.random() * 0.8 + 0.15,
          spd: Math.random() * 0.012 + 0.003,
        });
      }
    }

    function spawnShooter() {
      const sx = Math.random() * canvas!.width * 0.6;
      const sy = Math.random() * canvas!.height * 0.4;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
      const spd = 9 + Math.random() * 9;
      shooters.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        len: 90 + Math.random() * 110,
        a: 0,
        life: 0,
        maxLife: 45 + Math.random() * 30,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Twinkling stars
      for (const s of stars) {
        s.a += s.spd * (Math.random() > 0.5 ? 1 : -1);
        s.a = Math.max(0.08, Math.min(0.9, s.a));
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx!.fill();
      }

      // Spawn
      if (frame % 100 === 0 && Math.random() < 0.65) spawnShooter();

      // Shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.life++;
        const prog = s.life / s.maxLife;
        if (prog < 0.1) s.a = prog / 0.1;
        else if (prog > 0.75) s.a = 1 - (prog - 0.75) / 0.25;
        else s.a = 1;

        const mag = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / mag) * s.len;
        const ty = s.y - (s.vy / mag) * s.len;
        const grad = ctx!.createLinearGradient(tx, ty, s.x, s.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.6, `rgba(220,220,255,${s.a * 0.4})`);
        grad.addColorStop(1, `rgba(255,255,255,${s.a})`);
        ctx!.beginPath();
        ctx!.moveTo(tx, ty);
        ctx!.lineTo(s.x, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.4;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx!.fill();

        s.x += s.vx;
        s.y += s.vy;
        if (s.life >= s.maxLife) shooters.splice(i, 1);
      }

      frame++;
      raf = requestAnimationFrame(draw);
    }

    resize();
    initStars();
    draw();
    const onResize = () => { resize(); initStars(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={ref} className="stars-canvas" />;
}

// ════════════════════════════════════════════════════════
// CUSTOM CURSOR (desktop)
// ════════════════════════════════════════════════════════
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf: number;

    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    };
    const loop = () => {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      raf = requestAnimationFrame(loop);
    };
    const enter = () => ring.classList.add("hover");
    const leave = () => ring.classList.remove("hover");

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a,button,[data-hover]").forEach(el => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

// ════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════
const NAV = ["About", "Skills", "Contact"];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center pt-6"
    >
      <div className={`nav-pill flex items-center gap-1 px-4 py-2 rounded-full ${scrolled ? "shadow-xl" : ""}`}>
        {NAV.map(link => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            data-hover
            className="px-4 py-1.5 text-sm font-medium text-white/55 hover:text-white rounded-full hover:bg-white/8 transition-all duration-200"
          >
            {link}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}

// ════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════
function Hero() {
  const [splineReady, setSplineReady] = useState(false);
  const [loadSpline]                  = useState(canLoadSpline);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* ── Name: absolute bottom-left ── */}
      <div className="absolute bottom-12 left-8 md:left-16 z-30 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <h1
            className="font-bold leading-none tracking-tighter text-white"
            style={{ fontSize: "clamp(3.2rem, 9vw, 7.5rem)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SANSKAR
          </h1>
          <p
            className="text-white/65 font-medium"
            style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.6rem)", letterSpacing: "0.4em" }}
          >
            DALVI
          </p>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-3 text-white/35 text-sm tracking-wider"
          >
            Full-stack Developer &amp; Creative Technologist
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            className="mt-7 flex gap-4 pointer-events-auto"
          >
            <MagneticDock />
          </motion.div>
        </motion.div>
      </div>

      {/* ── 3D Spline (desktop & mobile) ── */}
      <div className="absolute inset-0 md:left-[38%] overflow-hidden pointer-events-none md:pointer-events-auto mix-blend-screen -z-10 opacity-30 md:opacity-100">
        {loadSpline && (
          <Suspense fallback={null}>
            <div
              style={{ opacity: splineReady ? 1 : 0, transition: "opacity 1s ease", width: "100%", height: "100%" }}
            >
              <Spline
                scene={SPLINE_URL}
                onLoad={() => setSplineReady(true)}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Suspense>
        )}
        {/* loading placeholder glow */}
        {!splineReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-72 h-72 rounded-full opacity-20 animate-pulse"
              style={{ background: "radial-gradient(circle at 35% 35%, #666, #111 70%)" }}
            />
          </div>
        )}
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 z-20"
      >
        <span className="text-xs font-mono tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ════════════════════════════════════════════════════════
// ABOUT
// ════════════════════════════════════════════════════════
const ABOUT_SKILLS = ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Supabase", "Docker", "Figma"];

function About() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const stats = [
    { v: "2+",  l: "Years Coding" },
    { v: "15+", l: "Projects" },
    { v: "5+",  l: "Tech Stacks" },
  ];

  const timelineData: any[] = [
    {
      id: 1,
      title: "About Me",
      date: "Present",
      content: "Final year diploma student in Computer Technology passionate about elegant UIs and intelligent systems.",
      category: "Personal",
      icon: User,
      relatedIds: [2, 5],
      status: "in-progress" as const,
      energy: 100,
    },
    {
      id: 2,
      title: "Education",
      date: "2023 - Present",
      content: "Diploma in Computer Tech at Government Polytechnic. Focus on SWE, DSA & database design.",
      category: "Education",
      icon: GraduationCap,
      relatedIds: [1, 5],
      status: "in-progress" as const,
      energy: 85,
    },
    {
      id: 3,
      title: "Experience",
      date: "2022 - Present",
      content: "Freelance & open source contributions. Building digital experiences where design meets engineering.",
      category: "Experience",
      icon: Briefcase,
      relatedIds: [4, 5],
      status: "completed" as const,
      energy: 90,
    },
    {
      id: 4,
      title: "Projects",
      date: "15+ Projects",
      content: "Full-stack apps, AI integrations, portfolio websites, and scalable system architectures.",
      category: "Projects",
      icon: Code,
      relatedIds: [3, 5],
      status: "completed" as const,
      energy: 95,
    },
    {
      id: 5,
      title: "Tech Stack",
      date: "5+ Stacks",
      content: "React, TypeScript, Node.js, Python, PostgreSQL, Supabase, Tailwind, & Docker.",
      category: "Tech",
      icon: Cpu,
      relatedIds: [1, 2, 3, 4],
      status: "completed" as const,
      energy: 100,
    },
  ];

  return (
    <section id="about" ref={ref} className="min-h-screen flex items-center py-24">
      <div className="section-inner">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-white/30 font-mono text-xs tracking-widest uppercase mb-12"
        >
          // About me
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
          {/* ── Left: personal intro ── */}
          <motion.div style={{ y }} className="lg:w-[45%]">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white"
            >
              Hello,&nbsp;I'm
              <br />
              <span className="text-white/60">Sanskar.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="text-white/50 leading-relaxed text-base mb-8"
            >
              Final year <strong className="text-white">Computer Technology</strong> diploma student
              based in India. I love crafting experiences where design meets engineering — building
              interfaces that feel alive and backends that just work.
            </motion.p>

            {/* Skill chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.22 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {ABOUT_SKILLS.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.08 }}
                  className="px-3 py-1 rounded-full text-xs font-mono border border-white/10 text-white/45 bg-white/[0.03] hover:border-white/30 hover:text-white/80 transition-all duration-200 cursor-default"
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.32 }}
              className="flex gap-10 pt-6 border-t border-white/8"
            >
              {stats.map(s => (
                <div key={s.l}>
                  <div className="text-3xl font-bold text-white">{s.v}</div>
                  <div className="text-white/30 text-xs uppercase tracking-widest mt-1">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Orbital Timeline ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="w-full lg:w-[50%] h-[550px] relative pointer-events-auto"
          >
            <RadialOrbitalTimeline timelineData={timelineData} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


// ════════════════════════════════════════════════════════
// SKILLS / PLANETS
// ════════════════════════════════════════════════════════
const PLANETS = [
  { label: "React / TS",   grad: ["#67e8f9","#3b82f6","#1e3a8a"],   glow: "rgba(59,130,246,0.55)",  size: 96,  ring: false, desc: "Interactive UIs & SPAs" },
  { label: "Node.js",      grad: ["#86efac","#22c55e","#14532d"],    glow: "rgba(34,197,94,0.5)",    size: 78,  ring: false, desc: "Server-side JS & APIs" },
  { label: "Python",       grad: ["#fde68a","#f59e0b","#92400e"],    glow: "rgba(245,158,11,0.55)",  size: 116, ring: true,  desc: "ML, scripting & data" },
  { label: "PostgreSQL",   grad: ["#a5b4fc","#6366f1","#312e81"],    glow: "rgba(99,102,241,0.5)",   size: 70,  ring: false, desc: "Relational databases" },
  { label: "Tailwind CSS", grad: ["#7dd3fc","#0ea5e9","#0c4a6e"],    glow: "rgba(14,165,233,0.5)",   size: 84,  ring: false, desc: "Rapid modern styling" },
  { label: "Supabase",     grad: ["#6ee7b7","#10b981","#064e3b"],    glow: "rgba(16,185,129,0.5)",   size: 74,  ring: false, desc: "BaaS — auth & realtime" },
  { label: "Docker",       grad: ["#93c5fd","#3b82f6","#1e3a8a"],    glow: "rgba(59,130,246,0.45)",  size: 64,  ring: false, desc: "Containers & deploys" },
  { label: "Figma",        grad: ["#f9a8d4","#ec4899","#831843"],    glow: "rgba(236,72,153,0.55)",  size: 88,  ring: true,  desc: "UI/UX prototyping" },
];

function PlanetCard({ p, i }: { p: typeof PLANETS[0]; i: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-hover
    >
      <motion.div
        animate={{ y: hovered ? -14 : [0, -9, 0] }}
        transition={
          hovered
            ? { duration: 0.3 }
            : { duration: 5.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative"
        style={{ width: p.size, height: p.size }}
      >
        {/* Saturn-style ring */}
        {p.ring && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[4px] border-white/15 rounded-[100%]"
            style={{ width: p.size * 1.65, height: p.size * 0.27, rotate: "-25deg", zIndex: 10 }}
          />
        )}
        <div
          className="planet-body w-full h-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${p.grad[0]}, ${p.grad[1]} 55%, ${p.grad[2]})`,
            boxShadow: `0 0 ${hovered ? 50 : 22}px ${p.glow}, inset -10px -12px 22px rgba(0,0,0,0.6)`,
            transition: "box-shadow 0.3s",
          }}
        >
          {/* Band texture */}
          <div className="absolute inset-0 overflow-hidden rounded-full opacity-25 flex flex-col justify-around">
            <div style={{ height:"8%", background:"rgba(255,255,255,0.18)", transform:"rotate(2deg)" }} />
            <div style={{ height:"12%", background:"rgba(0,0,0,0.25)", transform:"rotate(-1.5deg)" }} />
            <div style={{ height:"5%", background:"rgba(255,255,255,0.08)", transform:"rotate(3deg)" }} />
          </div>
        </div>
      </motion.div>

      <div className="text-center">
        <div className="text-xs font-mono uppercase tracking-[0.28em] text-white/50 group-hover:text-white/90 transition-colors duration-200">
          {p.label}
        </div>
        <AnimatePresence>
          {hovered && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              className="text-white/30 text-xs mt-1 max-w-[110px] leading-snug whitespace-nowrap"
            >
              {p.desc}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SolarSystemContainer() {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Scale down dynamically, clamping to min 0.35 to keep it readable and swipeable on mobile
      setZoom(Math.max(0.35, Math.min(1, window.innerWidth / 1350)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ORBIT_SIZES = [400, 520, 640, 760, 880, 1000, 1130, 1260];
  const ORBIT_SPEEDS = [20, 30, 45, 60, 80, 105, 130, 160];

  return (
    <div 
      className="relative w-full overflow-x-auto overflow-y-hidden flex justify-center lg:justify-center items-center py-10 custom-scrollbar"
      style={{ minHeight: `${1300 * zoom}px` }}
    >
      <div 
        className="relative flex-shrink-0"
        style={{ 
          width: "1300px", 
          height: "1300px", 
          transform: `scale(${zoom})`, 
          transformOrigin: "center" 
        }}
      >
        {/* Sun */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="w-56 h-56 rounded-full bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_150px_rgba(245,158,11,0.8)] animate-pulse" />
          <div className="absolute top-full mt-6 text-white/80 font-mono tracking-widest text-base uppercase">Me</div>
        </div>

        {/* Orbits and Planets */}
        {PLANETS.map((p, i) => {
          const diameter = ORBIT_SIZES[i];
          const speed = ORBIT_SPEEDS[i];
          const delay = -(i * 17.5 + 4); // staggered starting angles

          return (
            <div key={p.label}>
              {/* Orbit Ring */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
                style={{ width: diameter, height: diameter }}
              />

              {/* Planet Wrapper (Rotating) */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-spin"
                style={{ 
                  width: diameter, 
                  height: diameter, 
                  animationDuration: `${speed}s`, 
                  animationDelay: `${delay}s` 
                }}
              >
                {/* Planet Container (Counter-Rotating) */}
                <div 
                  className="absolute top-1/2 left-full animate-orbit-anti-spin"
                  style={{
                    animationDuration: `${speed}s`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <div className="flex items-center justify-center -ml-16">
                    <PlanetCard p={p} i={i} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Skills() {
  return (
    <section id="skills" className="min-h-screen flex flex-col items-center justify-center py-24">
      <div className="section-inner flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <p className="text-white/35 font-mono text-xs tracking-widest uppercase mb-4">// Skills</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            My Tech <span className="text-white/45">Universe</span>
          </h2>
          <p className="text-white/30 mt-3 text-sm max-w-xs mx-auto leading-relaxed">
            Hover to explore. 
            <br />
            Bigger world = deeper expertise.
          </p>
        </motion.div>

        <SolarSystemContainer />
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════
// CONTACT
// ════════════════════════════════════════════════════════
const CONTACTS = [
  { icon: <Mail size={18} />,    label: "Email",    href: "mailto:darshan2kk3@gmail.com", val: "darshan2kk3@gmail.com" },
  { icon: <Github size={18} />,  label: "GitHub",   href: "https://github.com/",          val: "github.com/sanskar" },
  { icon: <Linkedin size={18} />, label: "LinkedIn", href: "https://linkedin.com/",        val: "linkedin.com/in/sanskar" },
];

function Contact() {
  return (
    <section id="contact" className="min-h-screen flex items-center py-24">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-white/35 font-mono text-xs tracking-widest uppercase mb-4">// Contact</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Let's <span className="text-white/50">Connect</span>
          </h2>
          <p className="text-white/35 mb-14 text-base max-w-md mx-auto">
            Open to freelance, internship opportunities and interesting collaborations.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {CONTACTS.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                whileHover={{ y: -6, scale: 1.02 }}
                data-hover
                className="mono-card flex flex-col items-center gap-3 p-7 rounded-2xl transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-white/60">
                  {c.icon}
                </div>
                <div className="text-white font-semibold text-sm">{c.label}</div>
                <div className="text-white/30 text-xs">{c.val}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="py-8 border-t border-white/[0.05] text-center">
      <p className="text-white/18 font-mono text-xs uppercase tracking-widest">
        © 2026 Sanskar Dalvi &nbsp;·&nbsp; Crafted with purpose
      </p>
    </footer>
  );
}

// ════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════
export default function App() {
  useRemoveSplineWatermark();
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20">
      {/* Space background */}
      <StarCanvas />

      {/* Custom cursor — desktop only */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      <Nav />

      <main>
        <Hero />
        <About />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
