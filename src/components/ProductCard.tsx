import React, { useState } from "react";
import { Product } from "../types";
import { useApp } from "./AppContext";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  isDragging?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isDragging = false }) => {
  const { formatPrice, setSelectedProductForModal, addToCart } = useApp();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    setSelectedProductForModal(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col w-full relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIdx(0);
      }}
    >
      {/* Product Image Frame */}
      <div
        id={`product-frame-${product.id}`}
        className="w-full aspect-[4/5] bg-transparent relative overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300"
        onClick={handleCardClick}
      >
        <img
          src={product.images[currentImageIdx]}
          alt={product.imageAlt || product.name}
          style={product.imageStyle}
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

        {/* Quick slide active image swipe overlay bars */}
        {(!product.isSoldOut && product.stock !== 0) && product.images.length > 1 && (
          <div className="absolute inset-x-0 top-0 h-full flex z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.images.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-full cursor-pointer"
                onMouseEnter={() => setCurrentImageIdx(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Control Layer (Between frame and info): Sizes list on Hover */}
      <div id={`product-dots-row-${product.id}`} className="py-2 px-1 flex flex-col items-center justify-center min-h-[42px] sm:min-h-[46px] w-full relative">
        <div className="flex flex-col items-center gap-2 transition-all duration-300 w-full">
          {(!product.isSoldOut && product.stock !== 0) && isHovered && product.sizes.length > 0 && product.sizes[0] !== "ONE SIZE" ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 w-full"
            >
              {/* Sizes Row */}
              <div className="flex items-center justify-center gap-2 sm:gap-3.5 flex-wrap max-w-full px-1">
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
              </div>
            </motion.div>
          ) : (
            <div className="h-[20px] sm:h-[24px]" />
          )}
        </div>
      </div>

      {/* Product Details Info (Left aligned name & vertical stack price) */}
      <div className="flex flex-col items-start px-0.5 cursor-pointer select-none mt-1 sm:mt-2" onClick={handleCardClick}>
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
