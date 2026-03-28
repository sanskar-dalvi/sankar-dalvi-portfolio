import React, { useState, useRef, useContext, createContext, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

// shared mouse position
const MouseContext = createContext({ x: 0, y: 0 });

// individual icon with magnetic effect
function DockIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mouse = useContext(MouseContext);
  const distance = useMotionValue(Infinity);

  useEffect(() => {
    if (!ref.current || mouse.x === 0) {
      distance.set(Infinity);
      return;
    }
    const iconRect = ref.current.getBoundingClientRect();
    const containerRect = ref.current.parentElement!.getBoundingClientRect();
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const mouseXAbsolute = containerRect.left + mouse.x;
    distance.set(Math.abs(mouseXAbsolute - iconCenterX));
  }, [mouse, distance]);

  const width = useTransform(distance, [0, 100], [60, 48]);
  const springW = useSpring(width, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      style={{ width: springW, height: springW }}
      className="rounded-full bg-white/10 hover:bg-white/20 border border-white/10 grid place-items-center text-white/70 hover:text-white cursor-pointer transition-colors"
      data-hover
    >
      {icon}
    </motion.a>
  );
}

// main dock
export default function MagneticDock() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left } = currentTarget.getBoundingClientRect();
    setPos({ x: clientX - left, y: 0 });
  };

  const onMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <MouseContext.Provider value={pos}>
      <div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="flex items-end gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 h-20 shadow-2xl backdrop-blur-md"
      >
        <DockIcon href="https://github.com/Sanskar-Dalvi" icon={<Github size={24} />} />
        <DockIcon href="https://linkedin.com/in/sanskar-dalvi" icon={<Linkedin size={24} />} />
        <DockIcon href="https://twitter.com/in/sanskar-dalvi" icon={<Twitter size={24} />} />
        <DockIcon href="mailto:sanskardvi26@gmail.com" icon={<Mail size={24} />} />
      </div>
    </MouseContext.Provider>
  );
}
