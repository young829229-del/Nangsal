import React from "react";
import { useApp } from "./AppContext";

export const TermsView: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <section className="bg-white py-24 md:py-36 min-h-screen text-left">
      <div className="max-w-[800px] mx-auto px-6 md:px-12 font-mono">
        {/* Title */}
        <div className="border-b border-neutral-100 pb-8 mb-12">
          <span className="text-[10px] tracking-[0.3em] text-neutral-400 block mb-2 uppercase">
            REGULAR UPDATED: JUNE 2026
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-black uppercase">
            TERMS & CONDITIONS
          </h1>
        </div>

        {/* Sections layout */}
        <div className="space-y-12 text-[11px] md:text-xs tracking-wider text-gray-500 leading-relaxed uppercase">
          
          <div className="space-y-4">
            <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px]">
              01_ GENERAL TERMS
            </h3>
            <p>
              BY ACCESSING OR USING OUR SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS. OUR STORE IS HOSTED ON A SECURE PLATFORM THAT ALLOWS US TO SELL OUR PRODUCTS AND SERVICES TO YOU.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px]">
              02_ SHIPPING & DELIVERY
            </h3>
            <p>
              ALL ORDERS ARE PROCESSED WITHIN 1-2 BUSINESS DAYS. STANDARD SHIPPING TYPICALLY TAKES 3-5 BUSINESS DAYS. YOU WILL RECEIVE A CONFIRMATION EMAIL WITH TRACKING INFORMATION ONCE YOUR ORDER SHIPS.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px]">
              03_ RETURNS & REFUNDS
            </h3>
            <p>
              WE ACCEPT RETURNS WITHIN 30 DAYS OF PURCHASE FOR ITEMS IN THEIR ORIGINAL, UNWORN CONDITION WITH ALL TAGS ATTACHED. REFUNDS WILL BE ISSUED TO THE ORIGINAL PAYMENT METHOD.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px]">
              04_ PRIVACY POLICY
            </h3>
            <p>
              YOUR PRIVACY IS IMPORTANT TO US. WE ONLY COLLECT ESSENTIAL INFORMATION REQUIRED TO PROCESS YOUR ORDERS AND IMPROVE YOUR SHOPPING EXPERIENCE. YOUR DATA IS ENCRYPTED AND NEVER SOLD TO THIRD PARTIES.
            </p>
          </div>

          <div className="space-y-4 pb-8">
            <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px]">
              05_ ACCURACY OF INFORMATION
            </h3>
            <p>
              WE STRIVE TO DISPLAY OUR PRODUCTS AS ACCURATELY AS POSSIBLE. HOWEVER, WE CANNOT GUARANTEE THAT YOUR DEVICE'S DISPLAY OF ANY COLOR WILL BE PERFECTLY ACCURATE.
            </p>
          </div>

        </div>

        {/* Back page trigger button */}
        <div className="border-t border-neutral-100 pt-10 mt-12 flex justify-start">
          <button
            onClick={() => {
              setActiveTab("HOME");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-black text-white px-8 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] hover:bg-neutral-800 transition-colors uppercase cursor-pointer"
          >
            RETURN TO HOME
          </button>
        </div>
      </div>
    </section>
  );
};
