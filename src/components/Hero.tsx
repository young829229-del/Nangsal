import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useApp } from "./AppContext";

export const Hero: React.FC = () => {
  const { siteSettings } = useApp();

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(siteSettings.targetDate));

  function calculateTimeLeft(targetDateStr: string) {
    const targetTime = new Date(targetDateStr).getTime();
    let diff = targetTime - Date.now();
    if (diff <= 0) {
      // If target has passed, provide a dynamic 2-day rolling target so the timer is always ticking down elegantly
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 2);
      diff = fallback.getTime() - Date.now();
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(siteSettings.targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [siteSettings.targetDate]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <section
      id="hero-section"
      className="relative w-full h-full bg-neutral-900 overflow-hidden flex items-end select-none"
    >
      {/* Editorial Campaign Background Image with Grainy Raw Overlay */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
        <img
          src={siteSettings.heroImage}
          alt="Nangsal Apparel Campaign Background"
          className="absolute inset-0 w-full h-full object-cover object-[50%_40%] contrast-[1.01] brightness-[1.01] saturate-[1.01]"
          style={{ 
            imageRendering: "auto",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden"
          }}
          referrerPolicy="no-referrer"
        />

        {/* Tactile Grain & Nostalgic Noise Texture Overlay */}
        <div 
          className="absolute inset-0 w-full h-full opacity-[0.24] mix-blend-overlay pointer-events-none z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Minimal gradients to match screenshot, letting the pristine colors shine */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/25 to-transparent z-10" />
      </div>

      {/* Hero Content Overlay Grid */}
      <div className="relative w-full z-20 max-w-[1600px] mx-auto px-6 md:px-12 pb-12 sm:pb-16 md:pb-24 flex flex-col md:flex-row justify-between items-end gap-10 md:gap-6">
        {/* Bottom-left: Headline specification tag */}
        <div className="flex flex-col items-start gap-0.5">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-white/90 uppercase font-black"
          >
            NEW DROP LIVE NOW.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-7xl sm:text-8xl md:text-[8rem] lg:text-[11rem] font-sans font-black tracking-normal text-white leading-none uppercase select-none drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            SS26
            <span className="sr-only"> - Nangsal Apparel Streetwear Collection</span>
          </motion.h1>
        </div>

        {/* Bottom-right: Sleek countdown timer matching screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-start md:items-end gap-1.5"
        >
          {/* Numbers block */}
          <div className="flex items-center gap-6 md:gap-10 text-white font-sans">
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl md:text-7xl font-sans font-black leading-none tracking-tight">
                {formatNumber(timeLeft.days)}
              </span>
              <span className="text-[9px] md:text-[11px] font-mono tracking-[0.25em] text-white/90 font-black uppercase mt-3.5 text-center select-none">
                DAYS
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl md:text-7xl font-sans font-black leading-none tracking-tight">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="text-[9px] md:text-[11px] font-mono tracking-[0.25em] text-white/90 font-black uppercase mt-3.5 text-center select-none">
                HOURS
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl md:text-7xl font-sans font-black leading-none tracking-tight">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="text-[9px] md:text-[11px] font-mono tracking-[0.25em] text-white/90 font-black uppercase mt-3.5 text-center select-none">
                MINUTES
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl md:text-7xl font-sans font-black leading-none tracking-tight text-white">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="text-[9px] md:text-[11px] font-mono tracking-[0.25em] text-white/90 font-black uppercase mt-3.5 text-center select-none">
                SECONDS
              </span>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
};
