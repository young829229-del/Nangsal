import React, { useState } from "react";
import { useApp } from "./AppContext";
import { ArrowUpRight, ChevronUp, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Vectors aligned strictly to design mockup
const WhatsAppIcon = () => (
  <svg className="w-4 h-4 hover:opacity-75 transition-opacity cursor-pointer text-black" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.987 4.479-9.987 9.987 0 1.763.46 3.42 1.262 4.876L2 22l5.289-1.385a9.92 9.92 0 0 0 4.722 1.196c5.503 0 9.988-4.478 9.988-9.987v-.003C22 6.482 17.519 2 12.012 2zm4.339 12.449c-.238.674-1.384 1.246-1.921 1.306-.479.053-.984.079-2.736-.642-2.24-.925-3.665-3.197-3.778-3.348-.112-.15-.918-1.218-.918-2.324 0-1.106.58-1.648.785-1.874.207-.225.45-.282.6-.282.15 0 .3 0 .431.007.135.006.315-.052.495.383.18.435.615 1.5.668 1.609.053.112.083.244.008.394-.075.15-.113.244-.225.375-.113.131-.237.293-.338.394-.113.112-.232.233-.1.458.131.226.581.957 1.25 1.553.859.768 1.583.999 1.808 1.111.225.112.356.094.488-.056.131-.15.562-.656.712-.881.151-.225.3-.188.506-.112.207.075 1.306.615 1.531.728.225.113.375.169.431.263.056.094.056.544-.182 1.218z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 hover:opacity-75 transition-opacity cursor-pointer text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4 hover:opacity-75 transition-opacity cursor-pointer text-black" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.94.94 2.19 1.48 3.49 1.59v3.62c-1.35-.17-2.61-.75-3.62-1.63-.07.82-.02 1.64-.02 2.45 0 2.24-.76 4.38-2.14 6.1-2.15 2.48-5.32 3.8-8.56 3.65-3.32-.15-6.32-2.14-7.85-5.11-1.74-3.53-1.12-7.98 1.51-10.83 1.95-1.95 4.67-2.91 7.39-2.6.22-1.15.52-2.28.89-3.39V12.7c-.51.15-.99.46-1.37.85-.82.82-1.15 2.05-.88 3.19.26 1.13.99 2.08 2.01 2.56.96.43 2.1.35 2.97-.22.88-.63 1.39-1.67 1.39-2.76.01-4.08-.01-8.17.02-12.25l-.29-.05z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg className="w-4 h-4 hover:opacity-75 transition-opacity cursor-pointer text-black" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.289 2C6.617 2 2 6.617 2 12.289c0 4.305 2.648 7.977 6.422 9.531-.094-.805-.18-2.039.039-2.922.195-.836 1.258-5.328 1.258-5.328s-.32-.641-.32-1.586c0-1.492.867-2.602 1.938-2.602.914 0 1.359.688 1.359 1.508 0 .914-.586 2.297-.883 3.57-.25 1.07.531 1.938 1.586 1.938 1.906 0 3.375-2.008 3.375-4.914 0-2.57-1.844-4.367-4.484-4.367-3.055 0-4.844 2.289-4.844 4.648 0 .922.352 1.914.805 2.461.086.109.102.203.078.297-.086.359-.281 1.141-.32 1.297-.055.219-.18.3-.414.188-1.531-.711-2.484-2.945-2.484-4.734 0-3.852 2.797-7.391 8.07-7.391 4.234 0 7.531 3.016 7.531 7.055 0 4.211-2.648 7.594-6.328 7.594-1.234 0-2.398-.641-2.797-1.398l-.758 2.922c-.273 1.055-1.008 2.375-1.492 3.172 1.125.336 2.32.516 3.555.516 5.672 0 10.289-4.617 10.289-10.289C22.289 6.617 17.672 2 12.289 2z"/>
  </svg>
);

const ButterflyLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-auto" }) => (
  <img
    src="https://i.ibb.co/JwSCMGR5/IMG-20260728-WA0007.jpg"
    alt="Nangsal Apparel Decal"
    className={`${className} object-contain`}
    referrerPolicy="no-referrer"
  />
);

export const Footer: React.FC = () => {
  const { setActiveTab, siteSettings } = useApp();
  const [showHelp, setShowHelp] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const scrollToTopAndSetTab = (tab: "HOME" | "SHOP" | "TERMS" | "ADMIN") => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="app-footer" className="w-full bg-white border-t border-neutral-100 select-none">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          {/* Column 1: Brand details and statement */}
          <div className="md:col-span-2 space-y-6">
            <span className="flex items-center select-none">
              <img
                src="https://i.ibb.co/HphLbYyj/nangsal-logo-white-bg.png"
                alt="NANGSAL Logo"
                className="h-8 md:h-10 object-contain mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </span>
            <p className="text-[11px] font-mono tracking-wider text-gray-400 uppercase max-w-sm leading-relaxed">
              NANGSAL APPAREL IS AN AVANT-GARDE STREETWEAR LABEL PRODUCING LIMITED EDITION UNISEX APPAREL INSPIRED BY YOUTH CULTURE AND CREATIVE FREEDOM.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-[0.2em] text-black font-extrabold uppercase">
              RESOURCES_
            </h4>
            <ul className="space-y-2 text-[10px] md:text-[11px] font-mono tracking-widest text-gray-500 uppercase">
              <li>
                <button
                  id="footer-lnk-home"
                  onClick={() => scrollToTopAndSetTab("HOME")}
                  className="hover:text-black transition-colors cursor-pointer flex items-center gap-1 hover:font-bold"
                >
                  HOME [CORE_0] <ArrowUpRight size={10} />
                </button>
              </li>
              <li>
                <button
                  id="footer-lnk-shop"
                  onClick={() => {
                    scrollToTopAndSetTab("SHOP");
                    setTimeout(() => {
                      const el = document.getElementById("shop-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 200);
                  }}
                  className="hover:text-black transition-colors cursor-pointer flex items-center gap-1 hover:font-bold"
                >
                  SHOP [PRODUCTS] <ArrowUpRight size={10} />
                </button>
              </li>
              <li>
                <button
                  id="footer-lnk-terms"
                  onClick={() => scrollToTopAndSetTab("TERMS")}
                  className="hover:text-black transition-colors cursor-pointer flex items-center gap-1 hover:font-bold"
                >
                  TERMS DEPOSIT_ <ArrowUpRight size={10} />
                </button>
              </li>
              <li>
                <button
                  id="footer-lnk-admin"
                  onClick={() => scrollToTopAndSetTab("ADMIN")}
                  className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                >
                  ADMIN TERMINAL // <ArrowUpRight size={10} />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* SHOP ALL & CUSTOM UTILITY FOOTER BAR AS REQUESTED */}
        <div className="mt-16 md:mt-24 pt-8 border-t border-neutral-100 flex flex-col items-center justify-center w-full">
          
          {/* SHOP ALL Centered Pill Button with Butterfly Logo */}
          <button
            id="footer-shop-all-pill"
            onClick={() => {
              setActiveTab("SHOP");
              setTimeout(() => {
                const el = document.getElementById("shop-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 150);
            }}
            className="group mb-10 bg-orange-500 text-white hover:bg-orange-600 transition-all font-mono font-bold uppercase text-[10px] tracking-[0.25em] px-8 py-3.5 rounded-full flex items-center justify-center gap-3.5 shadow-md shadow-orange-500/20 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <ButterflyLogo className="w-5 h-5 rounded-full object-cover transition-transform group-hover:rotate-12" />
            <span>SHOP ALL</span>
          </button>

          {/* Interactive Help Desk Drawer */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full bg-neutral-50 border border-neutral-200/60 rounded-2xl p-6 md:p-8 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-[#1a1a1a]"
              >
                {/* Drawer Part 1 */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-[0.2em] font-black text-black uppercase">
                    CUSTOMER SUPPORT
                  </h5>
                  <p className="text-[10px] font-mono tracking-wider text-neutral-500 leading-relaxed uppercase">
                    FOR ANY INQUIRIES, ORDER UPDATES, OR GENERAL ASSISTANCE, PLEASE CONTACT OUR SUPPORT TEAM.
                  </p>
                  <p className="text-[10px] font-mono font-bold tracking-widest text-black">
                    EMAIL: <a href="mailto:yourgmail@gmail.com" className="underline hover:text-neutral-500">YOURGMAIL@GMAIL.COM</a>
                  </p>
                </div>
                {/* Drawer Part 2 */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-[0.2em] font-black text-black uppercase">
                    SIZING GUIDE
                  </h5>
                  <p className="text-[10px] font-mono tracking-wider text-neutral-500 leading-relaxed uppercase">
                    EXPLORE OUR COMPREHENSIVE SIZING GUIDE FOR JACKETS, HOODIES, TECH TROUSERS, AND TRI-MESH SHORTS.
                  </p>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[9px] bg-black text-white px-4 py-2 font-mono tracking-widest hover:bg-neutral-800 transition-colors uppercase cursor-pointer rounded-sm"
                  >
                    VIEW SIZING CHART
                  </button>
                </div>
                {/* Drawer Part 3 */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-mono tracking-[0.2em] font-black text-black uppercase">
                    SHIPPING & DELIVERY
                  </h5>
                  <p className="text-[10px] font-mono tracking-wider text-neutral-500 leading-relaxed uppercase">
                    ORDERS ARE PROCESSED WITHIN 1-2 BUSINESS DAYS. EXPRESS SHIPPING IS AVAILABLE FOR ALL DOMESTIC AND INTERNATIONAL ORDERS.
                  </p>
                  <span className="text-[9px] font-mono tracking-widest text-neutral-400 block uppercase">
                    SYSTEM STATUS: ALL SYSTEMS NORMAL
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sizing Coordinator Modal Popover */}
          <AnimatePresence>
            {showSizeGuide && (
              <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-neutral-100 p-6 md:p-8 rounded-lg max-w-lg w-full text-black space-y-5 shadow-lg select-text"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-xs font-mono font-extrabold tracking-[0.2em] uppercase">
                      SS26 DEPLOYMENT CHART
                    </h3>
                    <button
                      onClick={() => setShowSizeGuide(false)}
                      className="p-1 hover:bg-neutral-100 rounded-full cursor-pointer transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                        TRI-MESH SHORTS SPEC (WAIST INCHES)
                      </p>
                      <div className="grid grid-cols-6 gap-2 text-center text-[10px] font-mono">
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">XS</span>28-29"</div>
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">S</span>30-31"</div>
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">M</span>32-33"</div>
                        <div className="bg-neutral-50 p-2 border border-[#eaeaea] opacity-60"><span className="block font-black line-through">L</span>34-35"</div>
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">XL</span>36-37"</div>
                        <div className="bg-neutral-50 p-2 border border-[#eaeaea] opacity-60"><span className="block font-black line-through">XXL</span>38-40"</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                        UPPER BODY APPAREL SPEC (CHEST INCHES)
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">S</span>36-38"</div>
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">M</span>38-40"</div>
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">L</span>40-42"</div>
                        <div className="bg-neutral-50 p-2 border border-neutral-100"><span className="block font-black">XL</span>42-44"</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase leading-relaxed text-center">
                    CHOPPED STREET SLIDE VOLUMETRIC CROPS. IF BETWEEN SYSTEM SPECIFICATIONS, SELECT NEAREST SEGMENT UPWARD.
                  </p>

                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="w-full bg-black text-white text-[10px] py-3.5 font-mono tracking-widest font-extrabold hover:bg-neutral-800 transition-colors uppercase cursor-pointer rounded-sm"
                  >
                    CONFIRM & CLOSE MATRIX
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* EXACT PREMIUM GREY FOOTER BAR DESIGN FROM MOCKUP */}
          <div
            id="custom-footer-grey-bar"
            className="w-full bg-[#f4f4f4] text-black border border-neutral-200/40 rounded-xl md:rounded-full py-4.5 px-6 md:px-10 flex flex-row items-center justify-between gap-4 select-none mb-6 shadow-sm relative"
          >
            {/* Left Wing: Social networks */}
            <div className="flex items-center gap-4 text-black">
              <a href={`https://wa.me/${(siteSettings?.whatsappNumber || "9779847459808").replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href={siteSettings?.instagramUrl || "https://www.instagram.com/by_nangsal?igsh=aWpldjB4anIwd3gz"} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={siteSettings?.tiktokUrl || "https://www.tiktok.com/@nangsal_apparel?_r=1&_t=ZS-98PVmr7Eg2H"} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TikTokIcon />
              </a>
            </div>

            {/* Middle Wing: Brand Title */}
            <div className="flex items-center justify-center text-black font-black font-sans tracking-widest text-xs uppercase">
              NANGSAL APPAREL
            </div>

            {/* Right Wing: Interactive NEED HELP controller dropdown */}
            <div className="flex items-center">
              <button
                id="footer-need-help-btn"
                onClick={() => setShowHelp(!showHelp)}
                className="group text-[10px] md:text-[11px] font-mono tracking-[0.2em] font-extrabold text-black uppercase flex items-center gap-1.5 hover:opacity-75 cursor-pointer select-none"
              >
                <span>NEED HELP?</span>
                <ChevronUp
                  size={12}
                  className={`text-black font-black transition-transform duration-300 ${
                    showHelp ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] md:text-[10px] font-mono tracking-wider text-[#999999] uppercase mt-2.5 pb-2">
            <p>© 2026 NANGSAL APPAREL. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-6">
              <span>BOUDHA, KATHMANDU, NEPAL</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
