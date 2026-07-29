import React from "react";
import { useApp } from "./AppContext";

export const MoreThanClothesBanner: React.FC = () => {
  const { siteSettings } = useApp();

  return (
    <section className="w-full bg-white py-12 md:py-20 px-6 md:px-12 lg:px-20 border-b border-neutral-100 select-none">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl border border-neutral-200/80 p-8 sm:p-12 md:p-16 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Text & Cursive Script Title */}
          <div className="space-y-6 md:space-y-8 text-left order-1">
            
            {/* Handwriting / Script Headline */}
            <h2 className="text-4xl sm:text-5xl md:text-6xl text-[#e56834] tracking-wide font-normal lowercase" style={{ fontFamily: '"Caveat", cursive, sans-serif' }}>
              more than clothes
            </h2>

          </div>

          {/* Right Column: Featured Image ("Instead of camo hoodie") and Video side-by-side */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-center order-2">
            
            {/* Brand Image Card */}
            <div className="w-full aspect-square bg-neutral-50 rounded-lg border border-neutral-200/80 p-4 flex items-center justify-center relative shadow-sm overflow-hidden group">
              <img
                src={siteSettings.aboutBrandImage}
                alt="Nangsal Apparel Featured Look"
                className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Brand Video Card */}
            <div className="w-full aspect-square bg-black rounded-lg border border-neutral-200/80 flex items-center justify-center relative shadow-sm overflow-hidden">
              <video
                src={siteSettings.aboutBrandVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
