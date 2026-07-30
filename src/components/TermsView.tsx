import React from "react";
import { useApp } from "./AppContext";

export const TermsView: React.FC = () => {
  const { setActiveTab, siteSettings } = useApp();

  return (
    <section className="bg-white py-24 md:py-36 min-h-screen text-left">
      <div className="max-w-[850px] mx-auto px-6 md:px-12 font-mono">
        {/* Title */}
        <div className="border-b border-neutral-100 pb-8 mb-12">
          <span className="text-[10px] tracking-[0.3em] text-neutral-400 block mb-2 uppercase">
            LAST UPDATED: JULY 2026 — NANGSAL APPAREL POLICIES
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-black uppercase">
            TERMS & CONDITIONS
          </h1>
        </div>

        {/* Custom Terms from Admin Panel if set */}
        {siteSettings.customTerms ? (
          <div className="space-y-6 text-[11px] md:text-xs tracking-wider text-neutral-600 leading-relaxed uppercase whitespace-pre-line pb-8">
            {siteSettings.customTerms}
          </div>
        ) : (
          /* Default Nangsal Terms & Conditions */
          <div className="space-y-12 text-[11px] md:text-xs tracking-wider text-gray-500 leading-relaxed uppercase">
            
            <div className="space-y-4">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                01_ GENERAL AGREEMENT & BRAND POLICIES
              </h3>
              <p>
                BY ACCESSING AND PLACING AN ORDER WITH NANGSAL APPAREL, YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS. OUR APPAREL PIECES ARE LIMITED-RELEASE ARCHIVAL STREETWEAR DROPS PRODUCED IN FINITE QUANTITIES. ALL PURCHASES ARE SUBJECT TO PRODUCT AVAILABILITY AND ORDER VERIFICATION.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                02_ ORDERS & PAYMENT VERIFICATION
              </h3>
              <p>
                WE ACCEPT DIRECT BANK TRANSFERS AND DIGITAL WALLET (ESEWA) PAYMENTS. FOR ALL QR PAYMENT ORDERS, CUSTOMERS MUST UPLOAD A LEGIBLE PAYMENT RECEIPT/SCREENSHOT DURING CHECKOUT. ORDERS ARE RESERVED AND DISPATCHED ONLY UPON SUCCESSFUL VERIFICATION OF FUNDS. UNVERIFIED OR INCOMPLETE PAYMENT SUBMISSIONS WILL BE CANCELLED AUTOMATICALLY AFTER 24 HOURS.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                03_ SHIPPING, DELIVERY & DISPATCH
              </h3>
              <p>
                - INSIDE KATHMANDU VALLEY: STANDARD DISPATCH WITHIN 24-48 HOURS. FLAT DELIVERY CHARGE OF RS. {siteSettings.deliveryInsideKtm || 100}.<br />
                - OUTSIDE KATHMANDU VALLEY / REGIONAL: EXPRESS COURIER DISPATCH WITHIN 2-4 BUSINESS DAYS. DELIVERY CHARGE OF RS. {siteSettings.deliveryOutsideKtm || 150} - RS. 200.<br />
                CUSTOMERS ARE RESPONSIBLE FOR PROVIDING AN ACCURATE PHONE NUMBER AND DELIVERY ADDRESS AT CHECKOUT TO PREVENT LOGISTICS DELAYS.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                04_ RETURNS, EXCHANGES & REFUNDS POLICY
              </h3>
              <p>
                WE ACCEPT SIZE EXCHANGES AND RETURNS WITHIN 7 DAYS OF DELIVERY, PROVIDED THE ITEM IS UNWORN, UNWASHED, FREE OF DEFECTS, AND ACCOMPANIED BY ORIGINAL PACKAGING AND TAGS. DUE TO LIMITED DROP QUANTITIES, EXCHANGES DEPEND ON REAL-TIME STOCK AVAILABILITY. REFUNDS ARE PROCESSED BACK TO THE ORIGINAL PAYMENT METHOD UPON INSPECTION.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                05_ PRODUCT ACCURACY & SIZING
              </h3>
              <p>
                WE MAKE EVERY EFFORT TO ACCURATELY DISPLAY PRODUCT COLORS, TEXTURES, CUTS, AND FIT FITMENT GUIDES. HOWEVER, ACTUAL COLORS MAY VARY SLIGHTLY DEPENDING ON YOUR DEVICE DISPLAY SETTINGS. WE RECOMMEND CONSULTING OUR SPECIFIC SIZE CHARTS BEFORE PLACING AN ORDER.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                06_ PRIVACY & DATA SECURITY
              </h3>
              <p>
                YOUR PRIVACY IS PARAMOUNT. CUSTOMER ADDRESSES, PHONE NUMBERS, AND ORDER HISTORIES ARE SECURELY STORED AND USED STRICTLY FOR ORDER FULFILLMENT, DELIVERY LOGISTICS, AND DIRECT CUSTOMER SUPPORT. WE NEVER SELL, RENT, OR SHARE YOUR INFORMATION WITH UNAUTHORIZED THIRD PARTIES.
              </p>
            </div>

            <div className="space-y-4 pb-8">
              <h3 className="text-black font-black tracking-widest text-[12px] md:text-[13px] border-b border-neutral-100 pb-2">
                07_ CUSTOMER SUPPORT & INQUIRIES
              </h3>
              <p>
                FOR ANY INQUIRIES REGARDING YOUR ORDER STATUS, DISPATCH, OR PRODUCT EXCHANGES, REACH OUT TO OUR DIRECT CUSTOMER CARE AT WHATSAPP ({siteSettings.whatsappNumber || "+977 9800000000"}) OR INSTAGRAM (@{siteSettings.instagramUrl ? siteSettings.instagramUrl.replace(/https?:\/\/(www\.)?instagram\.com\/?/, "") : "nangsal_apparel"}).
              </p>
            </div>

          </div>
        )}

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

