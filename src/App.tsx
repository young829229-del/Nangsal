import { SignUpSection } from "./components/SignUpSection";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { AppProvider, useApp } from "./components/AppContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { CartDrawer } from "./components/CartDrawer";
import { ProductModal } from "./components/ProductModal";
import { TermsView } from "./components/TermsView";
import { AdminPanel } from "./components/AdminPanel";
import { StudioSpecs } from "./components/StudioSpecs";
import { BrandStatement } from "./components/BrandStatement";
import { MoreThanClothesBanner } from "./components/MoreThanClothesBanner";
import { Footer } from "./components/Footer";

import { LoginView } from "./components/LoginView";
// Internal wrapper to access the useApp state hooks cleanly
const AppContent: React.FC = () => {
  const { activeTab, searchQuery, selectedCategory } = useApp();
  const [heroHeight, setHeroHeight] = React.useState("100vh");

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const updateHeight = () => {
      // Freeze height on mobile to prevent URL bar scroll jumping/zoom glitch
      if (window.innerWidth < 768) {
        setHeroHeight(`${window.innerHeight}px`);
      } else {
        setHeroHeight("100vh");
      }
    };
    
    updateHeight();
    
    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        updateHeight();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let title = "Nangsal Apparel | Luxury Streetwear & Essentials";
    let desc = "Discover Nangsal Apparel's latest drops, unisex tees, jackets, and premium streetwear. Shop the new collection today.";
    
    if (activeTab === "TERMS") {
      title = "Terms & Policies | Nangsal Apparel";
      desc = "Read the terms and conditions for Nangsal Apparel streetwear purchases.";
    } else if (activeTab === "ADMIN") {
      title = "System Admin | Nangsal Apparel";
    } else if (activeTab === "LOGIN") {
      title = "Login | Nangsal Apparel";
    } else if (searchQuery) {
      title = `Search: ${searchQuery} | Nangsal Apparel`;
    } else if (activeTab === "SHOP") {
      title = selectedCategory !== "ALL" ? `${selectedCategory} | Shop Nangsal` : "Shop All | Nangsal Apparel";
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", desc);
    }
  }, [activeTab, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-black font-sans relative antialiased flex flex-col justify-between">
      <div>
        {/* Header (Contains top announcement bar & main navbar) */}
        <Header />

        {/* Core Screen Layout router */}
        <main className="w-full">
          {activeTab === "TERMS" ? (
            <div className="pt-[82px] md:pt-[100px]">
              <TermsView />
            </div>
          ) : activeTab === "ADMIN" ? (
            <div className="pt-[82px] md:pt-[100px]">
              <AdminPanel />
            </div>
          ) : activeTab === "LOGIN" ? (
            <div className="pt-[82px] md:pt-[100px]">
              <LoginView />
            </div>
          ) : searchQuery ? (
            <div className="pt-[110px] md:pt-[140px] px-6 md:px-12">
              <ProductGrid />
            </div>
          ) : (
            <div className="w-full">
              {/* STICKY HERO WRAPPER FOR SHUTTER SLIDE REVEAL */}
              <div className="relative w-full">
                {/* Sticky viewport-locked Hero */}
                <div className="md:sticky md:top-0 w-full z-0 overflow-hidden" style={{ height: heroHeight }}>
                  <Hero />
                </div>

                {/* Shutter physical content section */}
                <div className="relative z-10 bg-white border-t-0 md:border-t-[8px] border-black shadow-none md:shadow-[0_-30px_60px_rgba(0,0,0,0.2)]">
                  <MoreThanClothesBanner />
                  <BrandStatement />
                  <ProductGrid />
                  <StudioSpecs />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Cart Slider Drawers */}
      <CartDrawer />

      {/* Active Product Popups Modals */}
      <ProductModal />

      {/* Footer information blocks */}
      <SignUpSection />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
