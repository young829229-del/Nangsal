import React, { useState } from "react";
import { useApp } from "./AppContext";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LOOKBOOK_HIGHLIGHTS = [
  {
    image: "https://iili.io/Cqhwqb9.md.png",
    title: "MERTRA SS26 VISION",
    spec: "TACTICAL SHIELD_01",
    desc: "MERTRA AVANT-GARDE MOUNTED TECH UTILITY PARADIGM SHIELD, DESIGNED WITH COMPACT ZIPPER ASSEMBLIES AND REINFORCED STYLING DESIGNATIONS."
  },
  {
    image: "https://iili.io/CqhgCzl.md.png",
    title: "SAGE EXPLORER VEST",
    spec: "TACTICAL CARRIER_02",
    desc: "SAGE GREEN RIPSTOP REINFORCED SHELL, FEATURING SHIELD SNAP BUTTON CLOSURES AND MAGNETIC STRAP ADJUST SYSTEMS."
  },
  {
    image: "https://iili.io/CqhNR4f.md.png",
    title: "OFF-WHITE CARGO FRAME",
    spec: "BOTTOM STRUCTURE_03",
    desc: "TRIPLE-WEAVE WEATHERPROOF SHIELD JOGGERS FIT FOR MODERN METROPOLITAN COMBAT ENVIRONMENTS."
  }
];

export const LookbookBanner: React.FC = () => {
  const { setActiveTab, setSelectedCategory } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);

  const handleExplore = (category: string) => {
    setSelectedCategory(category.toUpperCase());
    setActiveTab("SHOP");
    const elem = document.getElementById("shop-section");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="lookbook-banner-section"
      className="w-full bg-[#fafafa] py-16 md:py-24 px-4 md:px-12 lg:px-20 select-none border-y border-neutral-100"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Lookbook section heading */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-neutral-200 pb-6 mb-12">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.4em] text-neutral-400 uppercase font-black">
              m e r t r a // s s 2 6
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-widest text-black uppercase font-sans">
              EDITORIAL LOOKBOOK
            </h2>
          </div>
          <p className="text-[10px] md:text-xs font-mono tracking-widest text-neutral-500 max-w-sm mt-4 md:mt-0 leading-relaxed uppercase md:text-right">
            A HIGH-CONTRAST CHRONICLE HIGHLIGHTING TECHNICAL VOLUME CONSTRUCTION AND MULTI-VIEW METRIC GARMENTS.
          </p>
        </div>

        {/* 2-Column Lookbook interactive layout */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Side: Editorial Slider Display (Interactive Lookbook Highlights) */}
          <div className="flex-grow w-full bg-white relative aspect-square sm:max-h-[500px] sm:max-w-[500px] md:max-h-[550px] md:max-w-[550px] border border-neutral-100 overflow-hidden group flex items-center justify-center">
            
            {/* Multi image display with seamless fade transitions */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIdx}
                src={LOOKBOOK_HIGHLIGHTS[activeIdx].image}
                alt={LOOKBOOK_HIGHLIGHTS[activeIdx].title}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="max-h-[90%] max-w-[90%] object-contain"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Inverted Logo Decal Overlay as requested! */}
            <div className="absolute top-4 right-4 text-[10px] bg-black text-white px-3 py-1 font-mono tracking-widest font-black uppercase rounded-sm z-10 pointer-events-none shadow-md">
              MERTRA STUDIO
            </div>

            {/* Quick left/right navigators */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev > 0 ? prev - 1 : LOOKBOOK_HIGHLIGHTS.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black border border-neutral-200 flex items-center justify-center shadow-md transition-all z-20 cursor-pointer active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev < LOOKBOOK_HIGHLIGHTS.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black border border-neutral-200 flex items-center justify-center shadow-md transition-all z-20 cursor-pointer active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Right Side: Technical details, spec switching, tabs info */}
          <div className="flex-1 w-full flex flex-col justify-center space-y-8 lg:pl-6 text-left">
            
            {/* Highlights Tabs List */}
            <div className="flex flex-col gap-4 border-l border-neutral-200 pl-6">
              {LOOKBOOK_HIGHLIGHTS.map((hl, index) => {
                const isActive = activeIdx === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveIdx(index)}
                    className="group flex flex-col items-start text-left relative focus:outline-none cursor-pointer"
                  >
                    <span className={`text-[10px] font-mono tracking-widest transition-colors ${isActive ? 'text-black font-bold' : 'text-neutral-400 group-hover:text-black'}`}>
                      {hl.spec}
                    </span>
                    <span className={`text-lg md:text-xl font-bold tracking-widest transition-all mt-1 ${isActive ? 'text-black translate-x-2' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                      {hl.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Specification narrative block */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 pt-4 border-t border-neutral-100"
              >
                <p className="text-xs font-mono tracking-widest text-neutral-500 leading-relaxed uppercase">
                  {LOOKBOOK_HIGHLIGHTS[activeIdx].desc}
                </p>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      if (activeIdx === 0) handleExplore("TOPS");
                      else if (activeIdx === 1) handleExplore("VESTS");
                      else handleExplore("BOTTOMS");
                    }}
                    className="px-6 py-3.5 bg-black text-white text-[10px] font-mono tracking-[0.25em] font-bold hover:bg-neutral-800 transition-colors uppercase rounded-none"
                  >
                    ACQUIRE PIECE
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
