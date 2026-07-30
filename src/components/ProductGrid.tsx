import React from "react";
import { ProductCard } from "./ProductCard";
import { useApp } from "./AppContext";
import { motion, AnimatePresence } from "motion/react";

// Categorized Headers metadata mapping to requested Landscape Editorial Backgrounds
const CATEGORY_HEADERS: Record<string, { image: string; quote: string; desc: string }> = {
  ALL: {
    image: "https://iili.io/C3yY64S.jpg",
    quote: "CORE DEPLOYMENT CATALOGUE",
    desc: "THE COMPLETE METROPOLIS COMBAT MATRIX PRELOADED WITH PREMIUM WATER-RESISTANT VESTS, UTILITY INDUSTRIAL CARGOS, AND RAW COTTON FLEECE LAYERS."
  },
  TOPS: {
    image: "https://iili.io/CFjLIqv.md.jpg",
    quote: "UPPER BODY SPECIFICATION SYSTEMS",
    desc: "RESPONSIVE COTTON SWEATSHIRTS AND HEAVYWEIGHT KNITS DESIGNED WITH RIGID HIGH-COLLARS AND OVERSIZED ANATOMICAL STREETWEAR CUTS."
  },
  BOTTOMS: {
    image: "https://iili.io/CFjLoXa.md.jpg",
    quote: "BOTTOM SEGMENT GEOMETRIC LAYOUTS",
    desc: "DOUBLE-KNEE ARTICULATION PARACHUTES, SIX-POCKET FUNCTIONAL CARGOS, AND DEEP DROP-CROTCH INDUCTORS IN WEAR-RESISTANT RIPSTOP CANVAS."
  },
  VESTS: {
    image: "https://iili.io/CFjLxLJ.md.jpg",
    quote: "CORE SHIELD WEB CARRIERS",
    desc: "MOLLE SYSTEM TACTICAL WEB HARNESSES, SECURED STRAP COMPARTMENT VESTS, AND MILITARY-SPEC RIPSTOP COMBAT BODY ARMORS."
  },
  OUTERWEAR: {
    image: "https://iili.io/CFjL7et.md.jpg",
    quote: "EXTERNAL THERMOREGULATION MEMBRANES",
    desc: "HEAVYWEATHER WEATHER-RESISTANT PUFFERS AND METROPOLIS SHELLS ENGINEERED TO PROTECT AGAINST RUGGED HIGH WIND ATMOSPHERES."
  },
  ESSENTIALS: {
    image: "https://iili.io/CFjLRdN.md.jpg",
    quote: "DAILY MONOTROPIC CALIBRATIONS",
    desc: "RAW MINIMALIST DAMP FLEECE HOODIES, HEAVY COMBED COTTON SHIRTS, AND RAW LOOSE LAYERS FOR REPETITIVE URBAN COMFORT CONFIGURATION."
  }
};

export const ProductGrid: React.FC = () => {
  const { searchQuery, setActiveTab, selectedCategory, setSelectedCategory, products } = useApp();

  // Extract unique categories based on products
  const uniqueCategories: string[] = Array.from(new Set(products.map(p => p.category.toUpperCase())));
  const categories: string[] = ["ALL", ...uniqueCategories];

  // Filter products based on search term and category selection
  const filteredProducts = products.filter((p) => {
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === "ALL"
      ? true
      : p.category.toUpperCase() === selectedCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  // Extract unique sections dynamically from filteredProducts
  const sections: string[] = Array.from(new Set(filteredProducts.map(p => p.section.toUpperCase())));

  const handleViewAllSection = (sectionName: string) => {
    setActiveTab("SHOP");
    const elem = document.getElementById(`section-grid-${sectionName}`);
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const activeHeader = CATEGORY_HEADERS[selectedCategory] || CATEGORY_HEADERS["ALL"];

  // Count items per category for label decorators
  const getProductCount = (cat: string) => {
    if (cat === "ALL") return products.length;
    return products.filter((p) => p.category.toUpperCase() === cat).length;
  };

  return (
    <div id="shop-section" className="w-full bg-white pb-12 md:pb-20">

      {/* Elegant Horizontal Category Filter Selector Row */}
      <div className="sticky top-[78px] md:top-[90px] z-30 bg-white border-b border-neutral-100 py-2.5 sm:py-3 px-3 sm:px-4 md:px-12 flex items-center justify-between overflow-x-auto select-none scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-start md:justify-center gap-4 sm:gap-6 md:gap-10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 sm:py-2 px-1 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] transition-all relative flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap select-none hover:opacity-75 ${
                  isActive ? "text-black" : "text-neutral-400"
                }`}
              >
                {cat}
                <span className="font-mono text-[7px] sm:text-[8px] text-neutral-400 font-medium">
                  ({getProductCount(cat)})
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBorder"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto mt-8 sm:mt-12">
        {filteredProducts.length === 0 ? (
          <div className="py-16 sm:py-24 text-center max-w-xl mx-auto font-mono px-4">
            <p className="text-xs sm:text-sm tracking-widest text-gray-400 uppercase">
              NO SYSTEM MATCHES FOUND UNDER "{selectedCategory}"
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
              }}
              className="mt-6 px-6 py-2.5 bg-black text-white text-[10px] tracking-widest hover:bg-gray-900 transition-colors uppercase"
            >
              RESET CATALOGUE FILTER
            </button>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16 md:space-y-24">
            {sections.map((sectionName) => {
              const sectionProducts = filteredProducts.filter(p => p.section.toUpperCase() === sectionName);
              if (sectionProducts.length === 0) return null;

              return (
                <div key={sectionName} id={`section-container-${sectionName}`} className="px-3 sm:px-6 md:px-8 lg:px-12 scroll-mt-36">
                  {/* Header row */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3 sm:pb-5 mb-5 sm:mb-8 md:mb-10 gap-3">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-[0.15em] sm:tracking-[0.2em] text-neutral-800 uppercase truncate">
                      {sectionName}
                    </h2>
                    <button
                      onClick={() => handleViewAllSection(sectionName)}
                      className="bg-black text-white px-4 sm:px-6 py-1.5 sm:py-2 pb-2 sm:pb-2.5 rounded-full text-[8px] sm:text-[9px] font-bold tracking-[0.15em] sm:tracking-[0.2em] hover:bg-neutral-800 transition-colors cursor-pointer leading-none shrink-0"
                    >
                      VIEW ALL
                    </button>
                  </div>

                  {/* Responsive Grid */}
                  <div
                    id={`section-grid-${sectionName}`}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-8 gap-y-6 sm:gap-y-8 md:gap-y-12 animate-fade-in"
                  >
                    {sectionProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
