import React, { useState } from "react";
import { Product } from "../types";
import { useApp } from "./AppContext";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  isDragging?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { formatPrice, setSelectedProductForModal, addToCart } = useApp();
  const [currentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCardClick = () => {
    setSelectedProductForModal(product);
  };

  const currentImgSrc = imgError || !product.images?.[currentImageIdx] 
    ? "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop"
    : product.images[currentImageIdx];

  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col w-full relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div
        id={`product-frame-${product.id}`}
        className="w-full aspect-[4/5] bg-transparent relative overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300"
        onClick={handleCardClick}
      >
        <img
          key={`${product.id}-${currentImageIdx}`}
          src={currentImgSrc}
          alt={product.imageAlt || product.name}
          loading="lazy"
          decoding="async"
          style={product.imageStyle}
          onError={() => setImgError(true)}
          className={`w-full h-full ${
            ["parachute-pants", "tri-mesh-sport-shorts", "utility-drop-crotch"].includes(product.id)
              ? "object-contain p-6 md:p-8"
              : "object-cover md:object-contain md:p-2"
          } object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
          referrerPolicy="no-referrer"
        />
        {(product.isSoldOut || product.stock === 0) && (
          <div className="absolute top-4 left-4 bg-black text-white text-[9px] font-mono font-bold tracking-widest px-3 py-1.5 uppercase z-20">
            SOLD OUT
          </div>
        )}
      </div>

      {/* Control Layer (Between frame and info): Sizes list on Hover (Fixed height h-8 to prevent scroll jump) */}
      <div id={`product-dots-row-${product.id}`} className="h-8 py-1 px-1 flex items-center justify-center w-full relative">
        {(!product.isSoldOut && product.stock !== 0) && isHovered && product.sizes.length > 0 && product.sizes[0] !== "ONE SIZE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-full px-1"
          >
            {product.sizes.map((sz) => {
              const isUnavailable = product.unavailableSizes?.includes(sz);
              if (isUnavailable) {
                return (
                  <div
                    key={sz}
                    className="relative text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-neutral-300 pointer-events-none select-none flex items-center justify-center min-w-[14px] h-4"
                  >
                    {sz}
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-[110%] h-[1px] bg-neutral-300 transform rotate-[30deg] scale-125" />
                    </span>
                  </div>
                );
              }
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, sz, 1);
                  }}
                  className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-neutral-800 hover:text-black transition-colors hover:scale-110 cursor-pointer"
                >
                  {sz}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Product Details Info (Left aligned name & vertical stack price) */}
      <div className="flex flex-col items-start px-0.5 cursor-pointer select-none mt-1" onClick={handleCardClick}>
        <h3 className="text-[10px] sm:text-[11px] font-bold tracking-wider mb-0.5 text-black uppercase hover:opacity-50 transition-all line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
};
