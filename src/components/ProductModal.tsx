import React, { useState, useEffect, useRef } from "react";
import { useApp } from "./AppContext";
import { X, Plus, Minus, Check, AlertCircle, ArrowLeft, User, Phone, MapPin, Compass, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { QRCodeSVG } from "qrcode.react";

export const ProductModal: React.FC = () => {
  const { 
    selectedProductForModal, 
    setSelectedProductForModal, 
    addToCart, 
    formatPrice,
    userProfile,
    updateProfileDetails,
    siteSettings,
    saveOrderToHistory,
    setIsCartOpen
  } = useApp();

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedConfirm, setAddedConfirm] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState("");

  const [userHeight, setUserHeight] = useState("");
  const [userWeight, setUserWeight] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  // Order states
  const [showDirectCheckout, setShowDirectCheckout] = useState(false);
  const [showDirectCheckoutQr, setShowDirectCheckoutQr] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<"fonepay" | "cod">("fonepay");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  
  // Detailed full address fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const isTransitioningRef = useRef(false);

  const product = selectedProductForModal;

  const getCombinedAddress = () => {
    return city ? `${address.trim()}, ${city.trim()}` : address.trim();
  };

  const isInsideKtm = city.toLowerCase().includes("kathmandu") || city.toLowerCase().includes("ktm") || city.toLowerCase().includes("lalitpur") || city.toLowerCase().includes("bhaktapur") || address.toLowerCase().includes("kathmandu") || address.toLowerCase().includes("ktm") || address.toLowerCase().includes("lalitpur") || address.toLowerCase().includes("bhaktapur");
  const deliveryCharge = isInsideKtm ? (siteSettings?.deliveryInsideKtm ?? 120) : (siteSettings?.deliveryOutsideKtm ?? 200);

  const calculateSubtotal = () => {
    if (!product) return 0;
    return product.price * quantity;
  };

  const calculateDiscount = () => {
    if (siteSettings?.promoCode && siteSettings?.promoDiscountPercent && promoCodeInput.trim().toUpperCase() === siteSettings.promoCode.toUpperCase()) {
      return (calculateSubtotal() * siteSettings.promoDiscountPercent) / 100;
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + deliveryCharge;
  };

  // Reset states on product change
  useEffect(() => {
    setActiveImgIdx(0);
    isTransitioningRef.current = false;
    setQuantity(1);
    setAddedConfirm(false);
    setErrorPrompt("");
    setShowDirectCheckout(false);
    setShowDirectCheckoutQr(false);
    setCheckoutComplete(false);
    setCheckoutLoading(false);

    if (userProfile) {
      setGuestName(userProfile.name || "");
      setGuestPhone(userProfile.phone || "");
      setAddress(userProfile.address || "");
    } else {
      setAddress("");
    }

    if (selectedProductForModal) {
      // Default select first size
      if (selectedProductForModal.sizes.length === 1) {
        setSelectedSize(selectedProductForModal.sizes[0]);
      } else {
        setSelectedSize("");
      }
      setOrderNumber(`MRT-SS26-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      setOrderNumber("");
    }
  }, [selectedProductForModal, userProfile]);

  if (!selectedProductForModal || !product) return null;

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!product || !product.images || product.images.length <= 1) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setActiveImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 300);
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!product || !product.images || product.images.length <= 1) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setActiveImgIdx((prev) => (prev + 1) % product.images.length);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 300);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!product || !product.images || product.images.length <= 1) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 25) return;
    if (isTransitioningRef.current) return;

    if (delta > 0) {
      handleNextImage();
    } else {
      handlePrevImage();
    }
  };

  const handleAddQty = () => setQuantity((prev) => prev + 1);
  const handleSubQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToBagSubmit = () => {
    if (product.isSoldOut) return;

    let finalSize = selectedSize;
    if (!finalSize) {
      if (userHeight || userWeight) {
        finalSize = `CUSTOM (${userHeight ? 'HT: ' + userHeight : ''}${userHeight && userWeight ? ', ' : ''}${userWeight ? 'WT: ' + userWeight : ''})`;
        setSelectedSize(finalSize);
      } else {
        setErrorPrompt("PLEASE CHOOSE A SIZE OR ENTER YOUR HEIGHT & WEIGHT");
        setTimeout(() => setErrorPrompt(""), 3000);
        return;
      }
    }

    addToCart(product, finalSize, quantity, userHeight, userWeight);
    setAddedConfirm(true);
    setTimeout(() => {
      setAddedConfirm(false);
      setSelectedProductForModal(null); // Close modal
    }, 1000);
  };

  const handleBuyItNow = () => {
    if (product.isSoldOut) return;

    let finalSize = selectedSize;
    if (!finalSize) {
      if (userHeight || userWeight) {
        finalSize = `CUSTOM (${userHeight ? 'HT: ' + userHeight : ''}${userHeight && userWeight ? ', ' : ''}${userWeight ? 'WT: ' + userWeight : ''})`;
        setSelectedSize(finalSize);
      } else {
        setErrorPrompt("PLEASE CHOOSE A SIZE OR ENTER YOUR HEIGHT & WEIGHT");
        setTimeout(() => setErrorPrompt(""), 3000);
        return;
      }
    }

    setShowDirectCheckout(true);
  };

  const handleDirectCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !address || !city) {
      setErrorPrompt("PLEASE FILL ALL REQUIRED FIELDS");
      return;
    }
    
    if (!paymentScreenshot) {
      setShowDirectCheckoutQr(true);
      return;
    }

    setCheckoutLoading(true);
    setErrorPrompt("");
    
    try {
      const combinedAddress = getCombinedAddress();
      await updateProfileDetails(guestName, guestPhone, combinedAddress);
      await saveOrderToHistory(
        guestName, 
        guestPhone, 
        combinedAddress, 
        calculateTotal(), 
        paymentScreenshot || undefined, 
        [{
          productId: product.id,
          selectedSize: selectedSize,
          quantity: quantity,
          price: product.price,
          name: product.name,
          image: product.images[0],
          userHeight, userWeight
        }]
      );
      setCheckoutComplete(true);
    } catch (err) {
      console.error(err);
      setErrorPrompt("ORDER FAILED. PLEASE TRY AGAIN.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorPrompt("PLEASE UPLOAD A VALID IMAGE (JPG, PNG).");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 600; // Compress strongly for 1MB Firestore limit

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64String = canvas.toDataURL('image/jpeg', 0.6); // 60% quality JPEG
            setPaymentScreenshot(base64String);
            setErrorPrompt("");
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <AnimatePresence>
      <div id="product-modal-backdrop" className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-6 lg:p-12 overflow-y-auto">
        
        {/* Animated Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setSelectedProductForModal(null);
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative w-full max-w-[1200px] h-auto md:h-[680px] bg-white border border-gray-100 shadow-2xl rounded-none md:rounded-sm z-50 overflow-hidden flex flex-col md:flex-row my-auto"
        >
          {/* Close trigger */}
          <button
            id="close-product-modal-btn"
            onClick={() => {
              setSelectedProductForModal(null);
            }}
            className="absolute top-4 right-4 text-black hover:text-gray-500 transition-colors z-40 p-2 border border-gray-100 bg-white rounded-full cursor-pointer shadow-md"
          >
            <X size={18} />
          </button>

          {/* Left: Interactive Multi-Image Slideshow */}
          <div className={`flex-1 md:h-full bg-white relative flex flex-col items-center justify-center p-6 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0 flex`}>
            
            {/* Big active preview with single-step swipe & wheel gesture support */}
            <div 
              className="w-full h-[320px] md:h-[450px] relative flex items-center justify-center select-none touch-none overflow-hidden cursor-grab active:cursor-grabbing"
              onWheel={handleWheel}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImgIdx}
                  src={product.images[activeImgIdx] || "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop"}
                  alt={product.imageAlt || product.name}
                  drag={product.images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    if (isTransitioningRef.current) return;
                    const swipeThreshold = 25;
                    const velocityThreshold = 150;
                    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
                      handleNextImage();
                    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
                      handlePrevImage();
                    }
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={product.imageStyle}
                  className="max-h-full max-w-full object-contain object-center pointer-events-auto"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop";
                  }}
                />
              </AnimatePresence>

              {/* Subtle Left/Right Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => handlePrevImage(e)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black border border-gray-200 flex items-center justify-center shadow-md transition-all opacity-90 hover:opacity-100 z-30 cursor-pointer active:scale-95"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} className="text-black" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleNextImage(e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black border border-gray-200 flex items-center justify-center shadow-md transition-all opacity-90 hover:opacity-100 z-30 cursor-pointer active:scale-95"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} className="text-black" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Dot Bar (Only if multiple images) */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 select-none overflow-x-auto max-w-full py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTransitioningRef.current) return;
                      isTransitioningRef.current = true;
                      setActiveImgIdx(idx);
                      setTimeout(() => {
                        isTransitioningRef.current = false;
                      }, 300);
                    }}
                    className={`w-14 h-14 bg-white border rounded-sm p-1 transition-all overflow-hidden flex items-center justify-center cursor-pointer shrink-0 ${
                      activeImgIdx === idx ? "border-black scale-105 shadow-sm" : "border-gray-200 hover:border-black/50"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} thumbnail ${idx + 1}`} 
                      className="max-h-full max-w-full object-contain" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Technical Specs & Add to Bag Options OR Direct Checkout */}
          <div className="flex-1 p-6 md:p-12 flex flex-col h-auto md:h-full md:overflow-y-auto">
            {!showDirectCheckout ? (
              <>
                <div className="flex-1 flex flex-col justify-between">
                  {/* Header Product and category */}
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.3em] text-gray-400 block mb-1 uppercase">
                      {product.category} — SS26
                    </span>
                    <h1 className="text-xl md:text-2xl font-mono tracking-widest text-black uppercase font-bold leading-normal">
                      {product.name}
                    </h1>
                    <p className="text-lg md:text-xl font-mono tracking-widest text-black mt-2 font-bold mb-3">
                      {formatPrice(product.price)}
                    </p>

                    <div id="product-inquiry-badge" className="flex items-center gap-2 mb-6 select-none">
                      <span className="text-[9px] font-mono tracking-[0.2em] font-extrabold text-[#25D366] bg-emerald-50 border border-emerald-100/80 px-2.5 py-1 rounded-sm uppercase">
                        ORDER REFERENCE: #{orderNumber}
                      </span>
                    </div>

                    {/* Size Select Option bar */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-gray-500">
                        <span>SELECT SIZE</span>
                        {selectedSize && <span className="text-black font-bold">SIZE: {selectedSize}</span>}
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {product.sizes.map((sz) => {
                          const isActive = selectedSize === sz;
                          return (
                            <button
                              key={sz}
                              id={`modal-size-btn-${sz}`}
                              onClick={() => {
                                setSelectedSize(sz);
                                setErrorPrompt("");
                              }}
                              disabled={product.isSoldOut}
                              className={`min-w-[48px] h-12 text-xs font-mono tracking-widest uppercase flex items-center justify-center border transition-all cursor-pointer ${
                                isActive
                                  ? "bg-black text-white border-black font-semibold"
                                  : "bg-white text-black border-gray-200 hover:border-black active:scale-95"
                              } disabled:opacity-30 disabled:pointer-events-none`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity selector */}
                    {!product.isSoldOut && (
                      <div className="space-y-3 mb-6">
                        <span className="text-[11px] font-mono tracking-widest text-gray-500 block">
                          QUANTITY
                        </span>
                        <div className="flex items-center gap-1 w-32 border border-gray-200 bg-gray-55">
                          <button
                            id="modal-qty-sub-btn"
                            onClick={handleSubQty}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="flex-1 text-center font-mono text-xs text-black font-bold select-none">
                            {quantity}
                          </span>
                          <button
                            id="modal-qty-add-btn"
                            onClick={handleAddQty}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Night Weight toggle */}
                    {!product.isSoldOut && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5 uppercase">
                            HEIGHT (CM/FT)
                          </label>
                          <input 
                            type="text" 
                            value={userHeight} 
                            onChange={(e) => setUserHeight(e.target.value)} 
                            className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors uppercase" 
                            placeholder="E.G. 5'10" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5 uppercase">
                            WEIGHT (KG/LBS)
                          </label>
                          <input 
                            type="text" 
                            value={userWeight} 
                            onChange={(e) => setUserWeight(e.target.value)} 
                            className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors uppercase" 
                            placeholder="E.G. 70KG" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Size Chart */}
                    {product.sizeChartUrl && (
                      <div className="mb-6">
                        <span className="text-[11px] font-mono tracking-widest text-black font-black block mb-3 uppercase">
                          SIZE CHART
                        </span>
                        <img 
                          src={product.sizeChartUrl} 
                          alt="Size Chart" 
                          className="w-full h-auto border border-gray-200" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Technical Specifications specs */}
                    <div className="border-t border-gray-100 pt-6">
                      <span className="text-[11px] font-mono tracking-widest text-black font-black block mb-3 uppercase">
                        TECHNICAL DESCRIPTION
                      </span>
                      <ul className="space-y-2 list-none">
                        {product.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-[10px] md:text-[11px] font-mono tracking-wider text-gray-500 leading-normal">
                            <span className="text-black font-bold pt-0.5">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Error notifications & action button bottom */}
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <AnimatePresence>
                      {errorPrompt && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mb-4 bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-red-500 font-mono text-[10px] tracking-widest"
                        >
                          <AlertCircle size={14} />
                          {errorPrompt}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {(product.isSoldOut || product.stock === 0) ? (
                      <button
                        disabled
                        className="w-full bg-[#f3f3f3] text-gray-400 text-xs font-mono tracking-[0.2em] py-4.5 text-center font-bold uppercase rounded-sm border border-gray-200 select-none cursor-not-allowed"
                      >
                        SOLD OUT FOR THIS MATCH
                      </button>
                    ) : (
                      <div id="product-action-grid" className="flex flex-col gap-3">
                        <button
                          id="add-to-bag-submit-btn"
                          onClick={handleAddToBagSubmit}
                          className={`w-full py-4 text-xs font-mono tracking-[0.25em] text-center font-bold uppercase transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer ${
                            addedConfirm
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-black text-white hover:bg-neutral-900 border border-black hover:scale-[1.01] active:scale-95"
                          }`}
                        >
                          {addedConfirm ? (
                            <>
                              <Check size={16} /> ADDED TO BAG_0
                            </>
                          ) : (
                            "ADD TO BAG"
                          )}
                        </button>
                        <button
                          id="buy-it-now-btn"
                          onClick={handleBuyItNow}
                          className="w-full py-4 text-xs font-mono tracking-[0.25em] text-center font-bold uppercase transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer bg-white text-black border border-black hover:bg-gray-50 active:scale-95"
                        >
                          BUY IT NOW
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : checkoutComplete ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <CheckCircle2 size={48} className="text-green-500 mb-4" />
                <h3 className="text-xl font-mono tracking-widest font-bold">ORDER CONFIRMED</h3>
                <p className="text-xs text-gray-500 font-mono">YOUR ORDER REFERENCE IS #{orderNumber}</p>
                <button
                  onClick={() => setSelectedProductForModal(null)}
                  className="mt-6 px-8 py-3 bg-black text-white text-xs font-mono tracking-widest uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setShowDirectCheckout(false)} className="text-gray-400 hover:text-black transition-colors cursor-pointer">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-lg font-mono tracking-widest font-bold uppercase">DIRECT CHECKOUT</h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-20">
                  <div className="flex items-center gap-4 border border-gray-100 p-3 bg-gray-50">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-contain mix-blend-multiply" />
                    <div className="font-mono text-xs uppercase">
                      <p className="font-bold">{product.name}</p>
                      <p className="text-gray-500 mt-1">SIZE: {selectedSize} | QTY: {quantity}</p>
                      <p className="font-bold mt-1">{formatPrice(product.price * quantity)}</p>
                    </div>
                  </div>

                  {/* Customer Info Form */}
                  <form id="direct-checkout-form" onSubmit={handleDirectCheckoutSubmit} className="space-y-4 font-mono text-xs uppercase">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
                          <User size={12} /> NAME *
                        </label>
                        <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} required className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors" placeholder="YOUR NAME" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
                          <Phone size={12} /> PHONE *
                        </label>
                        <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors" placeholder="98XXXXXXXX" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
                          <MapPin size={12} /> CITY *
                        </label>
                        <select required value={city} onChange={(e) => setCity(e.target.value)} className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors uppercase">
                          <option value="">SELECT CITY</option>
                          <option value="Kathmandu">Kathmandu</option>
                          <option value="Lalitpur">Lalitpur</option>
                          <option value="Bhaktapur">Bhaktapur</option>
                          <option value="Pokhara">Pokhara</option>
                          <option value="Biratnagar">Biratnagar</option>
                          <option value="Birgunj">Birgunj</option>
                          <option value="Dharan">Dharan</option>
                          <option value="Bharatpur">Bharatpur</option>
                          <option value="Butwal">Butwal</option>
                          <option value="Hetauda">Hetauda</option>
                          <option value="Nepalgunj">Nepalgunj</option>
                          <option value="Itahari">Itahari</option>
                          <option value="Janakpur">Janakpur</option>
                          <option value="Dhangadhi">Dhangadhi</option>
                          <option value="Bhairahawa">Bhairahawa</option>
                          <option value="Birtamod">Birtamod</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
                          ADDRESS *
                        </label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors uppercase" placeholder="STREET, NEIGHBORHOOD" />
                      </div>
                    </div>

                    {siteSettings?.promoCode && siteSettings.promoDiscountPercent ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
                          DISCOUNT CODE (OPTIONAL)
                        </label>
                        <input type="text" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} className="w-full border-b border-gray-200 focus:border-black py-1.5 px-1 focus:outline-none transition-colors" placeholder="ENTER DISCOUNT CODE" />
                      </div>
                    ) : null}

                    {/* Payment Details */}
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-xs md:text-sm font-bold tracking-widest text-gray-500 mb-4">PAYMENT METHOD *</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPaymentMethod("fonepay")} className={`py-4 md:py-5 px-2 border flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${paymentMethod === "fonepay" ? "border-black bg-gray-50" : "border-gray-200 hover:border-black/50"}`}>
                          <span className="font-bold text-sm">FONEPAY</span>
                          <span className="text-xs text-gray-500">QR CODE</span>
                        </button>
                        <button type="button" onClick={() => setPaymentMethod("cod")} className={`py-4 md:py-5 px-2 border flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-black bg-gray-50" : "border-gray-200 hover:border-black/50"}`}>
                          <span className="font-bold text-sm">COD</span>
                          <span className="text-xs text-gray-500">CASH ON DELIVERY</span>
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showDirectCheckoutQr && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-6 overflow-hidden">
                          <div className="bg-gray-50 border border-gray-200 p-6 flex flex-col items-center text-center">
                            <h4 className="text-lg md:text-xl font-black mb-4 uppercase tracking-wider">SCAN TO PAY</h4>
                            
                            {/* Bank QR & eSewa QR Side-by-Side Display */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
                              {/* Bank QR Card */}
                              <div className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col items-center shadow-sm">
                                <span className="text-xs font-bold font-mono tracking-widest text-black mb-2 uppercase">BANK QR TRANSFER</span>
                                <div className="w-36 h-36 bg-neutral-100 flex items-center justify-center rounded overflow-hidden mb-2">
                                  <img src={siteSettings.bankQrImage} alt="Bank QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-[11px] font-mono font-black text-black uppercase">A/C NAME: {siteSettings.bankAccountName}</span>
                              </div>

                              {/* eSewa QR Card */}
                              <div className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col items-center shadow-sm">
                                <span className="text-xs font-bold font-mono tracking-widest text-black mb-2 uppercase">eSEWA QR TRANSFER</span>
                                <div className="w-36 h-36 bg-neutral-100 flex items-center justify-center rounded overflow-hidden mb-2">
                                  <img src={siteSettings.esewaQrImage} alt="eSewa QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-[11px] font-mono font-black text-black uppercase">HOLDER: {siteSettings.esewaHolderName}</span>
                              </div>
                            </div>

                            <p className="text-lg md:text-xl text-black font-black mb-1">AMOUNT: {formatPrice(paymentMethod === "cod" ? deliveryCharge : calculateTotal())}</p>
                            <p className="text-sm md:text-base text-gray-500 font-bold mb-4">
                              {paymentMethod === "cod" ? "DELIVERY CHARGE ONLY" : "FULL AMOUNT"}
                            </p>

                            {/* WhatsApp Direct Order Button */}
                            <a
                              href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello Nangsal Apparel! I want to order ${product.name} (Size: ${selectedSize}, Qty: ${quantity}). Total: ${formatPrice(calculateTotal())}. Order #${orderNumber}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mb-4 bg-[#25D366] text-white py-3 px-4 rounded text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow"
                            >
                              Order via WhatsApp ({siteSettings.whatsappNumber})
                            </a>

                            <div className="w-full space-y-2 bg-yellow-50/50 p-4 border-2 border-yellow-400 rounded-sm">
                              <label className="block text-sm md:text-base font-black text-black text-left bg-yellow-200 inline-block px-1">UPLOAD SCREENSHOT (SS) *</label>
                              <input type="file" accept="image/*" onChange={handleQrUpload} className="block w-full text-sm md:text-base text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:border-0 file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer transition-colors border border-gray-300 bg-white rounded-sm shadow-sm" />
                              {paymentScreenshot && (
                                <div className="mt-2 flex items-center gap-2 text-green-600 text-xs font-bold">
                                  <CheckCircle2 size={16} /> SCREENSHOT ATTACHED
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {errorPrompt && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-50 border border-red-200 p-3 text-red-500 flex items-center gap-2 text-[10px] mt-4">
                          <AlertCircle size={14} /> {errorPrompt}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>

                <div className="pt-6 border-t border-gray-100 bg-white sticky bottom-0 z-10 space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-gray-500">
                     <span>SUBTOTAL</span>
                     <span>{formatPrice(calculateSubtotal())}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-gray-500">
                     <span>DELIVERY</span>
                     <span>{formatPrice(deliveryCharge)}</span>
                   </div>
                   {calculateDiscount() > 0 && (
                     <div className="flex justify-between items-center text-[10px] font-mono font-bold tracking-widest text-emerald-500">
                       <span>DISCOUNT ({siteSettings?.promoDiscountPercent}%)</span>
                       <span>- {formatPrice(calculateDiscount())}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-xs font-mono font-bold tracking-widest pt-2 border-t border-gray-100">
                     <span>TOTAL</span>
                     <span>{formatPrice(calculateTotal())}</span>
                   </div>
                  <button
                    onClick={handleDirectCheckoutSubmit}
                    disabled={checkoutLoading || (showDirectCheckoutQr && !paymentScreenshot)}
                    className="w-full py-4 text-xs font-mono tracking-widest text-center font-bold uppercase transition-all bg-black text-white hover:bg-neutral-900 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? "PROCESSING..." : "CONFIRM ORDER"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
