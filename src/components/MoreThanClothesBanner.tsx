import React from "react";

export const MoreThanClothesBanner: React.FC = () => {
  return (
    <section className="w-full bg-white py-10 md:py-16 px-4 sm:px-8 md:px-12 select-none">
      {/* Outer Soft Rounded Container */}
      <div className="max-w-[1320px] mx-auto bg-white rounded-2xl md:rounded-[32px] border border-neutral-200/80 p-6 sm:p-10 md:p-12 shadow-sm">
        
        {/* 3-Column Layout: Left Images, Center Manifesto Text, Right Images */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 lg:gap-10 items-center">
          
          {/* Left Column: Stack 2 images vertically */}
          <div className="md:col-span-4 flex flex-col gap-6 md:gap-8 order-2 md:order-1">
            {/* Left Top: Hoodie back (camo "17") */}
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-neutral-200/70 bg-neutral-50">
              <img
                src="https://user19304.na.imgto.link/public/20260730/1000067144.avif"
                alt="Camo 17 Hoodie Back"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Left Bottom: Black & white photo holding the cat */}
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-neutral-200/70 bg-neutral-50">
              <img
                src="https://user19304.na.imgto.link/public/20260730/1000067145.avif"
                alt="Editorial Portrait with Cat"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Center Column: Exact Text Manifesto from Reference */}
          <div className="md:col-span-4 text-center px-2 sm:px-4 py-4 order-1 md:order-2 flex flex-col items-center justify-center">
            {/* Main Header in Orange Bold Upper Case */}
            <h2 className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold uppercase tracking-tight text-[#e56834] leading-[1.1] mb-6 md:mb-8">
              MORE THAN<br />CLOTHES
            </h2>

            {/* Subtitle / Manifesto Text */}
            <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm md:text-base text-neutral-800 leading-relaxed font-medium max-w-xs mx-auto">
              <p>
                It&apos;s a mindset.<br />
                A way of living.
              </p>

              <p>
                We design for those<br />
                who move different,<br />
                think different,<br />
                and dress to express<br />
                what words can&apos;t.
              </p>

              <p>
                This is not just<br />
                what you wear.
              </p>

              <p className="font-bold text-black">
                This is who you are.
              </p>
            </div>

            {/* Brand Footer in Orange Uppercase */}
            <div className="mt-8 md:mt-10 text-xs sm:text-sm font-bold tracking-[0.25em] text-[#e56834] uppercase">
              NANGSAL APPAREL
            </div>
          </div>

          {/* Right Column: Stack 2 images vertically */}
          <div className="md:col-span-4 flex flex-col gap-6 md:gap-8 order-3 md:order-3">
            {/* Right Top: Red jacket lying on the floor */}
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-neutral-200/70 bg-neutral-50">
              <img
                src="https://user19304.na.imgto.link/public/20260730/1000067146.avif"
                alt="Red Statement Jacket"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Bottom: Runway denim model */}
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-neutral-200/70 bg-neutral-50">
              <img
                src="https://user19304.na.imgto.link/public/20260730/1000067147.avif"
                alt="Runway Denim Model"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

