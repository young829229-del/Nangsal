import React from "react";
import { useApp } from "./AppContext";

export const Hero: React.FC = () => {
  const { siteSettings } = useApp();

  const isVideo = siteSettings.heroImage?.toLowerCase().includes(".mp4") || 
                  siteSettings.heroImage?.includes("/videos/") || 
                  siteSettings.heroImage?.toLowerCase().includes(".webm");

  return (
    <section
      id="hero-section"
      className="relative w-full h-screen h-[100dvh] bg-neutral-900 overflow-hidden flex items-end select-none"
    >
      {/* Editorial Campaign Background Image/Video with Grainy Raw Overlay */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
        {isVideo ? (
          <video
            src={siteSettings.heroImage}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-[50%_40%] contrast-[1.01] brightness-[1.01] saturate-[1.01]"
          />
        ) : (
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
        )}

        {/* Tactile Grain & Nostalgic Noise Texture Overlay */}
        <div 
          className="absolute inset-0 w-full h-full opacity-[0.24] mix-blend-overlay pointer-events-none z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Minimal gradients to match screenshot */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/25 to-transparent z-10" />
      </div>
    </section>
  );
};
