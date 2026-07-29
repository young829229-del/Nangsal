import React, { useState } from "react";
import { Shield, Truck, Sparkles, RefreshCw, Layers, ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  tag: string;
}

const FAQS: FAQItem[] = [
  {
    tag: "SIZING",
    q: "HOW DO NANGSAL APPAREL GARMENTS FIT?",
    a: "OUR GARMENTS GENERALLY FEATURE A RELAXED, OVERSIZED FIT. WE RECOMMEND STICKING TO YOUR USUAL SIZE FOR OUR SIGNATURE LOOK, OR SIZING DOWN FOR A MORE STANDARD, CLOSER FIT.",
  },
  {
    tag: "SHIPPING",
    q: "HOW LONG DOES SHIPPING TAKE?",
    a: "WE TYPICALLY PROCESS AND SHIP ALL ORDERS WITHIN 24-48 HOURS. ONCE DISPATCHED, DELIVERY USUALLY TAKES 1-3 DAYS ACROSS NEPAL.",
  },
  {
    tag: "RESTOCKS",
    q: "WILL SOLD OUT ITEMS EVER BE RESTOCKED?",
    a: "NANGSAL APPAREL FOCUSES ON EXCLUSIVE, LIMITED-RUN COLLECTIONS TO KEEP OUR PIECES UNIQUE. ONCE A SPECIFIC ITEM IS COMPLETELY SOLD OUT, IT IS VERY RARELY BROUGHT BACK OR RESTOCKED.",
  },
  {
    tag: "MATERIALS",
    q: "WHAT KIND OF MATERIALS DO YOU USE?",
    a: "WE PRIDE OURSELVES ON USING PREMIUM, HIGH-QUALITY FABRICS THAT LAST. OUR COLLECTIONS TYPICALLY FEATURE HEAVYWEIGHT COTTON BLENDS, STURDY DENIMS, AND DURABLE TECHNICAL MATERIALS.",
  }
];

export const StudioSpecs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeChart, setActiveChart] = useState<"TOPS" | "BOTTOMS">("TOPS");

  return (
    <section id="studio-specifications" className="w-full bg-white py-16 md:py-24 border-t border-neutral-150">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* Head Intro */}
        <div className="border-b border-neutral-100 pb-8 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] text-[#767676] uppercase block mb-1">
              SYSTEM_0 ARCHIVE DOCUMENT
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-widest text-black uppercase">
              STUDIO ARCHIVES_
            </h2>
          </div>
          <p className="text-[11px] text-[#8c8c8c] font-mono tracking-wider max-w-sm uppercase leading-relaxed text-left md:text-right">
            REVIEW SYSTEM SPECIFICATIONS AND STRUCTURAL SIZING ARRAYS BEFORE CONFIRMING CART DEPOSITS.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8 text-left">
            <h3 className="text-[12px] font-extrabold tracking-[0.25em] text-black uppercase">
              01 // FAQ ACCORDION SCHEMES
            </h3>
            <div className="divide-y divide-neutral-200 border-b border-t border-neutral-200">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;;
                return (
                  <div key={index} className="py-4">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] bg-neutral-100 text-[#555555] px-2 py-1 font-mono tracking-widest font-bold">
                          {faq.tag}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-semibold text-black tracking-wider uppercase group-hover:opacity-60 transition-all font-mono">
                          {faq.q}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-neutral-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="mt-4 pl-4 text-[10px] md:text-[11px] text-[#666666] leading-relaxed tracking-wider uppercase font-mono border-l-2 border-black animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3-Core Cards Footer (Secure / Speed / Sustainable) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 border-t border-neutral-100 pt-16">
          <div className="flex flex-col items-start text-left space-y-3">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm">
              <Shield size={16} className="text-black" />
            </div>
            <h4 className="text-[11px] font-extrabold tracking-widest text-black uppercase">
              SECURE DEPOSIT ESCROWS
            </h4>
            <p className="text-[10px] font-mono tracking-wider text-[#767676] uppercase leading-relaxed">
              TRANSACTIONS ARE FULLY TOKENS-ENCRYPTED DIRECTLY COOPERATING CORES WITH STRIPE INTEGRATIONS.
            </p>
          </div>

          <div className="flex flex-col items-start text-left space-y-3">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm">
              <Truck size={16} className="text-black" />
            </div>
            <h4 className="text-[11px] font-extrabold tracking-widest text-black uppercase">
              DHL COURIERS DELIVERY
            </h4>
            <p className="text-[10px] font-mono tracking-wider text-[#767676] uppercase leading-relaxed">
              DECLARED COMPOSITIONS ARE DISPATCHED WITHIN 48H SECURING FASTEST GLOBAL DELIVERIES.
            </p>
          </div>

          <div className="flex flex-col items-start text-left space-y-3">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-sm">
              <RefreshCw size={16} className="text-black" />
            </div>
            <h4 className="text-[11px] font-extrabold tracking-widest text-black uppercase">
              EXCHANGE CLAIMS INTACT
            </h4>
            <p className="text-[10px] font-mono tracking-wider text-[#767676] uppercase leading-relaxed">
              WE ACCEPT HIGH-CONFORM TRANSIT RETURNS TO PRESERVE ENVELOPE DESIGN INTEG-RITY.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
