import React from "react";
import { useApp } from "./AppContext";

export const BrandStatement: React.FC = () => {
  const { siteSettings } = useApp();

  return (
    <section className="relative w-full py-14 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden select-none bg-black text-white flex items-center justify-center min-h-[360px] sm:min-h-[460px]">
      {/* Full-width video background */}
      <video
        src={siteSettings.aboutBrandVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 pointer-events-none"
      />

      {/* Dark overlay for optimal text contrast and high-end aesthetic */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] z-0" />

      {/* Content wrapper */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10">
        
        {/* Main Title Header */}
        <div className="space-y-2.5 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#ff7139] uppercase leading-tight font-sans drop-shadow-md break-words px-2">
            WE ARE LUXURY<br className="hidden sm:inline" /> STREETWEAR
          </h2>
          <p className="text-[11px] sm:text-sm font-medium text-neutral-200 tracking-wide pt-1 px-2">
            Every product from <span className="text-[#ff7139] font-bold">NANGSAL APPAREL</span> is made with care.
          </p>
        </div>

        {/* Narrative Paragraphs */}
        <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto text-neutral-100 font-serif text-xs sm:text-base md:text-[18px] leading-relaxed tracking-wide font-light px-2">
          <p>
            We are not traditional luxury and we are not traditional streetwear.
          </p>
          <p>
            We are a fusion of both and we bring together a contrast of styles, materials and colours that celebrate your uniqueness.
          </p>
        </div>

        {/* Bottom Tagline */}
        <div className="pt-2 sm:pt-4">
          <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.35em] text-[#ff7139] uppercase font-sans">
            MADE IN NEPAL
          </span>
        </div>

      </div>
    </section>
  );
};
