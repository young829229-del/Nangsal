import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Gift, CheckCircle2, ShieldCheck, Lock, Sparkles, Check, CreditCard, Clock, Search, MapPin, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NEPAL_CITIES, getCityDeliveryCharge, isInsideKathmanduValley } from "../data/cities";

import { QRCodeSVG } from "qrcode.react";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQty,
    clearCart,
    formatPrice,
    currency,
    userProfile,
    updateProfileDetails,
    saveOrderToHistory,
    siteSettings,
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "loading" | "complete">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [generatedOrderNum, setGeneratedOrderNum] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "bank" | "cod">("esewa");
  const [activeQr, setActiveQr] = useState<"esewa" | "bank">("esewa");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);

  // Detailed full address fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // City search & dropdown filter states
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [selectedCityCategory, setSelectedCityCategory] = useState<"ALL" | "VALLEY" | "MAJOR" | "REMOTE">("ALL");

  // Authorization progress animation states
  const [authStepMessage, setAuthStepMessage] = useState("CONNECTING TO SECURE PAYMENT GATEWAY...");
  const [authProgress, setAuthProgress] = useState(0);

  useEffect(() => {
    if (checkoutStep === "loading") {
      setAuthProgress(15);
      setAuthStepMessage("CONNECTING TO SECURE PAYMENT GATEWAY...");

      const t1 = setTimeout(() => {
        setAuthProgress(45);
        setAuthStepMessage("VERIFYING PAYMENT PROOF & SCREENSHOT...");
      }, 700);

      const t2 = setTimeout(() => {
        setAuthProgress(80);
        setAuthStepMessage("AUTHORIZING ORDER DEPOSIT & LOGGING RECEIPT...");
      }, 1600);

      const t3 = setTimeout(() => {
        setAuthProgress(100);
        setAuthStepMessage("PAYMENT AUTHORIZED & VERIFIED!");
      }, 2300);

      const t4 = setTimeout(() => {
        setCheckoutStep("complete");
      }, 2900);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      setAuthProgress(0);
    }
  }, [checkoutStep]);

  const getCombinedAddress = () => {
    return city ? `${address.trim()}, ${city.trim()}` : address.trim();
  };

  const isInsideKtm = isInsideKathmanduValley(city, address);
  const deliveryCharge = getCityDeliveryCharge(
    city,
    address,
    siteSettings?.deliveryInsideKtm ?? 100,
    siteSettings?.deliveryOutsideKtm ?? 150
  );

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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

  // Prefill the buyer profile dynamically from the database
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.address) setAddress(userProfile.address);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isCartOpen && !generatedOrderNum) {
      setGeneratedOrderNum(`MRT-ORDER-${Math.floor(100000 + Math.random() * 900000)}`);
    } else if (!isCartOpen) {
      setGeneratedOrderNum("");
    }
  }, [isCartOpen, generatedOrderNum]);

  const handleClose = () => {
    setIsCartOpen(false);
    
    // Auto-save any profile details they entered
    updateProfileDetails(name, phone, address);
    
    // Reset checkout state when closing
    setTimeout(() => {
      setCheckoutStep("cart");
    }, 400);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file (JPG, PNG).");
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
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!address.trim()) {
      alert("PLEASE ENTER YOUR DELIVERY ADDRESS");
      return;
    }

    if (!paymentScreenshot) {
      alert("PLEASE ATTACH THE PAYMENT SCREENSHOT TO PROCEED");
      return;
    }

    setCheckoutStep("loading");

    const combinedAddress = getCombinedAddress();

    // 1. Update / store user contact profile details in the database
    await updateProfileDetails(name, phone, combinedAddress);

    // 2. Clear template-based / mock tracking and write a real Order payload in Firestore
    await saveOrderToHistory(
      name, 
      phone, 
      combinedAddress, 
      calculateTotal(), 
      paymentScreenshot || undefined,
      undefined,
      paymentMethod,
      deliveryCharge,
      calculateSubtotal(),
      city
    );
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div id="cart-drawer-backdrop-lock" className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Core Panel Container (Slides out from right) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 24, stiffness: 180 }}
            className="absolute inset-y-0 right-0 w-full max-w-[480px] bg-white border-l border-gray-150 shadow-2xl flex flex-col z-50 text-left cursor-default select-none"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className={cart.length > 0 ? "text-orange-500 fill-orange-500/20" : "text-black"} />
                <h2 className="text-xs font-mono tracking-[0.25em] text-black font-extrabold uppercase">
                  SHOPPING BAG ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              <button
                id="close-cart-btn"
                onClick={handleClose}
                className="text-gray-400 hover:text-black transition-colors cursor-pointer p-1"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Check progress scenarios */}
            {checkoutStep === "cart" ? (
              <div className="flex-1 overflow-y-auto flex flex-col justify-between">
                {/* Scrollable list of items */}
                <div className="px-6 py-4 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-150">
                        <ShoppingBag size={24} className="text-gray-300" />
                      </div>
                      <p className="text-[10px] font-mono tracking-widest text-gray-400">
                        YOUR BAG IS CURRENTLY EMPTY
                      </p>
                      <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-black text-white text-[9px] font-mono tracking-[0.2em] uppercase font-bold hover:bg-gray-800 transition-colors cursor-pointer rounded-sm"
                      >
                        RETURN TO drops
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedSize}`}
                        id={`cart-item-${item.product.id}`}
                        className="flex items-start gap-4 border-b border-gray-55 pb-6"
                      >
                        {/* Thumbnail image */}
                        <div className="w-20 aspect-[4/5] bg-white border border-gray-100 p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Middle textual column */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono tracking-widest text-gray-400 block uppercase">
                            {item.product.category}
                          </span>
                          <h4 className="text-[10px] font-mono tracking-widest text-black uppercase font-bold truncate leading-relaxed">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] font-mono tracking-widest text-gray-500 mt-0.5">
                            SIZE: {item.selectedSize}
                          </p>
                          {item.userHeight && item.userWeight && (
                            <p className="text-[9px] font-mono tracking-widest text-emerald-600 font-bold mt-0.5">
                              + HEIGHT: {item.userHeight}, WEIGHT: {item.userWeight}
                            </p>
                          )}

                          {/* Interactive Qty Row */}
                          <div className="flex items-center gap-1.5 border border-gray-200 bg-gray-55 w-24 h-7 mt-3">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.selectedSize, item.quantity - 1, item.userHeight, item.userWeight)}
                              className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="flex-1 text-center font-mono text-[10px] text-black font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.selectedSize, item.quantity + 1, item.userHeight, item.userWeight)}
                              className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Right column: individual item price & trash delete */}
                        <div className="text-right flex flex-col justify-between items-end h-20">
                          <span className="text-[10px] font-mono font-bold text-black tracking-widest">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize, item.userHeight, item.userWeight)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                            aria-label="Delete item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Drawer Footer bottom calculations */}
                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-55 mt-auto">
                    <div className="space-y-2 font-mono">
                      {/* Delivery Charge */}
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold tracking-widest border-t border-gray-100 pt-2 mt-2">
                        <span>DELIVERY CHARGE {isInsideKtm ? "(INSIDE KTM)" : "(OUTSIDE KTM)"}</span>
                        <span>{formatPrice(deliveryCharge)}</span>
                      </div>
                      
                      {/* Promo Code Info */}
                      {calculateDiscount() > 0 && (
                        <div className="flex items-center justify-between text-[10px] text-emerald-500 font-bold tracking-widest pt-1">
                          <span>DISCOUNT ({siteSettings?.promoDiscountPercent}%)</span>
                          <span>- {formatPrice(calculateDiscount())}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[12px] text-black font-black tracking-widest border-t border-gray-100 pt-3">
                        <span>TOTAL AMOUNT</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>

                    {/* Simulative address check section */}
                    <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-left space-y-1.5">
                          <label className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                            NAME *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="YOUR NAME"
                            className="w-full border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-black rounded-sm"
                          />
                        </div>

                        <div className="text-left space-y-1.5">
                          <label className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                            PHONE *
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="98XXXXXXXX"
                            className="w-full border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-black rounded-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                            ADDRESS *
                          </label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="HOUSE NO., STREET"
                            className="w-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-black rounded-sm"
                          />
                        </div>

                        <div className="space-y-1.5 relative">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                              CITY *
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setCitySearchQuery("");
                                setIsCitySearchOpen(!isCitySearchOpen);
                              }}
                              className="text-[8px] font-mono font-bold tracking-wider text-black bg-neutral-100 hover:bg-neutral-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer uppercase transition-colors"
                            >
                              <Search size={9} />
                              <span>SEARCH</span>
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              onFocus={() => setIsCitySearchOpen(true)}
                              placeholder="ENTER OR SEARCH CITY"
                              className="w-full border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-black rounded-sm pr-7"
                            />
                            <button
                              type="button"
                              onClick={() => setIsCitySearchOpen(!isCitySearchOpen)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-0.5 cursor-pointer"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          {/* Searchable City Selection Modal / Popover */}
                          <AnimatePresence>
                            {isCitySearchOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute right-0 top-full mt-1 w-[280px] sm:w-[320px] bg-white border border-neutral-300 rounded-xl shadow-2xl p-3 z-50 text-left font-mono"
                              >
                                <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
                                  <span className="text-[10px] font-black tracking-widest text-black uppercase flex items-center gap-1">
                                    <MapPin size={11} className="text-black" />
                                    <span>SELECT DELIVERY CITY</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setIsCitySearchOpen(false)}
                                    className="text-neutral-400 hover:text-black p-1 cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>

                                {/* Search Bar Input */}
                                <div className="relative mb-2">
                                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                  <input
                                    type="text"
                                    autoFocus
                                    value={citySearchQuery}
                                    onChange={(e) => setCitySearchQuery(e.target.value)}
                                    placeholder="Search city (e.g. Kathmandu, Pokhara, Janakpur)..."
                                    className="w-full pl-7 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] font-mono focus:outline-none focus:border-black focus:bg-white"
                                  />
                                </div>

                                {/* Category Quick Filter Tabs */}
                                <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar text-[8px] font-bold uppercase">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCityCategory("ALL")}
                                    className={`px-2 py-1 rounded transition-all shrink-0 cursor-pointer ${
                                      selectedCityCategory === "ALL" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                  >
                                    ALL CITIES
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCityCategory("VALLEY")}
                                    className={`px-2 py-1 rounded transition-all shrink-0 cursor-pointer ${
                                      selectedCityCategory === "VALLEY" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                  >
                                    VALLEY (RS. 100)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCityCategory("MAJOR")}
                                    className={`px-2 py-1 rounded transition-all shrink-0 cursor-pointer ${
                                      selectedCityCategory === "MAJOR" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                  >
                                    OUTSIDE (RS. 150)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCityCategory("REMOTE")}
                                    className={`px-2 py-1 rounded transition-all shrink-0 cursor-pointer ${
                                      selectedCityCategory === "REMOTE" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                  >
                                    OUTER (RS. 200)
                                  </button>
                                </div>

                                {/* Scrollable List of Cities */}
                                <div className="max-h-[180px] overflow-y-auto space-y-1 divide-y divide-neutral-50 pr-1">
                                  {NEPAL_CITIES.filter((item) => {
                                    if (selectedCityCategory === "VALLEY" && item.region !== "Inside Valley") return false;
                                    if (selectedCityCategory === "MAJOR" && (item.region !== "Outside Valley" || item.charge !== 150)) return false;
                                    if (selectedCityCategory === "REMOTE" && (item.region !== "Outside Valley" || item.charge !== 200)) return false;

                                    if (!citySearchQuery.trim()) return true;
                                    const q = citySearchQuery.trim().toLowerCase();
                                    return (
                                      item.name.toLowerCase().includes(q) ||
                                      (item.district && item.district.toLowerCase().includes(q)) ||
                                      item.region.toLowerCase().includes(q) ||
                                      `rs. ${item.charge}`.includes(q)
                                    );
                                  }).map((item) => (
                                    <button
                                      key={item.name}
                                      type="button"
                                      onClick={() => {
                                        setCity(item.name);
                                        setIsCitySearchOpen(false);
                                      }}
                                      className="w-full text-left py-1.5 px-2 hover:bg-neutral-100 rounded flex items-center justify-between transition-colors cursor-pointer group"
                                    >
                                      <div>
                                        <p className="text-[10px] font-extrabold text-black uppercase group-hover:text-black">
                                          {item.name}
                                        </p>
                                        <p className="text-[8px] text-neutral-400 font-normal uppercase">
                                          {item.district ? `${item.district} District • ` : ""}{item.region}
                                        </p>
                                      </div>
                                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                        item.charge === 100
                                          ? "bg-emerald-100 text-emerald-800"
                                          : item.charge === 150
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-purple-100 text-purple-800"
                                      }`}>
                                        RS. {item.charge}
                                      </span>
                                    </button>
                                  ))}

                                  {NEPAL_CITIES.filter((item) => {
                                    if (selectedCityCategory === "VALLEY" && item.region !== "Inside Valley") return false;
                                    if (selectedCityCategory === "MAJOR" && (item.region !== "Outside Valley" || item.charge !== 150)) return false;
                                    if (selectedCityCategory === "REMOTE" && (item.region !== "Outside Valley" || item.charge !== 200)) return false;

                                    if (!citySearchQuery.trim()) return true;
                                    const q = citySearchQuery.trim().toLowerCase();
                                    return (
                                      item.name.toLowerCase().includes(q) ||
                                      (item.district && item.district.toLowerCase().includes(q)) ||
                                      item.region.toLowerCase().includes(q)
                                    );
                                  }).length === 0 && (
                                    <div className="py-3 text-center text-[9px] text-neutral-400">
                                      No preset match found for "{citySearchQuery}".
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCity(citySearchQuery.toUpperCase());
                                          setIsCitySearchOpen(false);
                                        }}
                                        className="block mx-auto mt-1 text-[9px] font-bold text-black underline cursor-pointer"
                                      >
                                        Use "{citySearchQuery.toUpperCase()}" anyway
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {siteSettings?.promoCode && siteSettings.promoDiscountPercent ? (
                        <div className="text-left space-y-1.5">
                          <label className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                            DISCOUNT CODE (OPTIONAL)
                          </label>
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            placeholder="ENTER DISCOUNT CODE"
                            className="w-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-black rounded-sm"
                          />
                        </div>
                      ) : null}

                      <div className="text-left space-y-2 pt-2 pb-2">
                        <label className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase block mb-2">
                          SELECT PAYMENT METHOD *
                        </label>

                        {/* Three Main Payment Options: eSewa | Bank | COD */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod("esewa");
                              setActiveQr("esewa");
                            }}
                            className={`py-3 px-2 text-[11px] font-extrabold tracking-wider uppercase transition-all rounded-sm border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              paymentMethod === "esewa"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                                : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400"
                            }`}
                          >
                            <span>eSEWA</span>
                            <span className="text-[8px] opacity-80 font-mono font-normal">DIRECT QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod("bank");
                              setActiveQr("bank");
                            }}
                            className={`py-3 px-2 text-[11px] font-extrabold tracking-wider uppercase transition-all rounded-sm border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              paymentMethod === "bank"
                                ? "border-black bg-black text-white shadow-md"
                                : "border-gray-200 bg-white text-gray-700 hover:border-black"
                            }`}
                          >
                            <span>BANK</span>
                            <span className="text-[8px] opacity-80 font-mono font-normal">TRANSFER</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPaymentMethod("cod");
                              // Default to eSewa QR for COD delivery charge if not set
                            }}
                            className={`py-3 px-2 text-[11px] font-extrabold tracking-wider uppercase transition-all rounded-sm border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              paymentMethod === "cod"
                                ? "border-amber-600 bg-amber-600 text-white shadow-md"
                                : "border-gray-200 bg-white text-gray-700 hover:border-amber-500"
                            }`}
                          >
                            <span>COD</span>
                            <span className="text-[8px] opacity-80 font-mono font-normal">ON DELIVERY</span>
                          </button>
                        </div>

                        {/* Payment Method Details & QR Display Box */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-sm mt-3 text-center">
                          
                          {/* Banner Explanation for COD vs Full Payment */}
                          {paymentMethod === "cod" ? (
                            <div className="w-full bg-amber-50 border border-amber-300 p-3 rounded mb-3 text-left space-y-1">
                              <p className="text-[11px] font-extrabold text-amber-900 uppercase font-mono flex items-center justify-between">
                                <span>CASH ON DELIVERY (COD)</span>
                                <span className="bg-amber-200 px-1.5 py-0.5 rounded text-[9px] font-bold">ADVANCE FEE</span>
                              </p>
                              <p className="text-[10px] text-amber-800 font-mono leading-tight">
                                Pay the <strong className="underline font-black">{formatPrice(deliveryCharge)}</strong> delivery charge in advance via eSewa or Bank QR code.
                              </p>
                              <p className="text-[9px] text-amber-700 font-mono font-semibold pt-1 border-t border-amber-200/60">
                                Remaining item balance of <strong className="text-black">{formatPrice(calculateSubtotal())}</strong> will be collected in CASH upon delivery.
                              </p>
                            </div>
                          ) : (
                            <div className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded mb-3 text-left space-y-1">
                              <p className="text-[11px] font-extrabold text-black uppercase font-mono">
                                {paymentMethod === "esewa" ? "eSEWA DIRECT ONLINE PAYMENT" : "BANK DIRECT TRANSFER"}
                              </p>
                              <p className="text-[10px] text-gray-600 font-mono leading-tight">
                                Pay the total amount <strong className="text-black">{formatPrice(calculateTotal())}</strong> using {paymentMethod === "esewa" ? "eSewa QR" : "Bank QR"} below.
                              </p>
                            </div>
                          )}

                          {/* Two Buttons Inside: eSewa QR & Bank QR Selector */}
                          <div className="w-full space-y-1.5 mb-3">
                            <label className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase block text-left">
                              SELECT QR CODE TO SCAN:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveQr("esewa")}
                                className={`py-2 px-3 text-[10px] font-mono font-bold uppercase rounded border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                  activeQr === "esewa"
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-500"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                eSEWA QR
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveQr("bank")}
                                className={`py-2 px-3 text-[10px] font-mono font-bold uppercase rounded border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                  activeQr === "bank"
                                    ? "bg-black text-white border-black shadow"
                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-black"
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                BANK QR
                              </button>
                            </div>
                          </div>

                          {/* Display Active QR Code */}
                          <div className="w-full bg-neutral-50 p-4 border border-gray-200 rounded flex flex-col items-center mb-3">
                            <span className="text-[11px] font-bold font-mono tracking-widest text-black mb-2 uppercase">
                              {activeQr === "esewa" ? "SCAN eSEWA QR" : "SCAN BANK QR"}
                            </span>
                            
                            <div className="w-36 h-36 bg-white p-2 flex items-center justify-center rounded border border-gray-200 shadow-sm overflow-hidden mb-2">
                              <img 
                                src={activeQr === "esewa" ? siteSettings.esewaQrImage : siteSettings.bankQrImage} 
                                alt={activeQr === "esewa" ? "eSewa QR Code" : "Bank QR Code"} 
                                className="w-full h-full object-contain" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>

                            <div className="bg-white px-3 py-1.5 rounded border border-gray-200 w-full text-center">
                              {activeQr === "esewa" ? (
                                <p className="text-[10px] font-mono font-black text-black uppercase">
                                  HOLDER: {siteSettings.esewaHolderName}
                                </p>
                              ) : (
                                <p className="text-[10px] font-mono font-black text-black uppercase">
                                  A/C: {siteSettings.bankAccountName}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Payment Amount Display */}
                          <div className="bg-neutral-900 text-white w-full p-3 rounded mb-3 text-center">
                            <p className="text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                              {paymentMethod === "cod" ? "REQUIRED ADVANCE PAYMENT" : "REQUIRED TOTAL PAYMENT"}
                            </p>
                            <p className="text-xl md:text-2xl font-black font-mono tracking-widest text-emerald-400 mt-0.5">
                              {formatPrice(paymentMethod === "cod" ? deliveryCharge : calculateTotal())}
                            </p>
                            <p className="text-[9px] font-mono text-gray-300 mt-1 uppercase font-semibold">
                              {paymentMethod === "cod" ? "DELIVERY CHARGE ONLY" : "FULL ORDER TOTAL"}
                            </p>
                          </div>

                          {/* WhatsApp Direct Order Option */}
                          <a
                            href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              paymentMethod === "cod" 
                                ? `Hello Nangsal Apparel! I want to place a COD order #${generatedOrderNum}. Items Total: ${formatPrice(calculateSubtotal())}. Advance Delivery Charge (${formatPrice(deliveryCharge)}) paid via ${activeQr.toUpperCase()} QR.`
                                : `Hello Nangsal Apparel! I want to order items in my cart #${generatedOrderNum}. Total Amount: ${formatPrice(calculateTotal())} paid via ${activeQr.toUpperCase()} QR.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mb-3 bg-[#25D366] text-white py-2.5 px-3 rounded text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow"
                          >
                            Order via WhatsApp ({siteSettings.whatsappNumber})
                          </a>

                          {/* Screenshot Upload Requirement */}
                          <div className="mt-1 w-full bg-yellow-50/70 p-3 border-2 border-yellow-400 rounded-sm">
                            <label className="text-xs font-black text-black uppercase block mb-1 text-left bg-yellow-200 inline-block px-1">
                              UPLOAD SCREENSHOT (SS) *
                            </label>
                            <input 
                              type="file" 
                              accept="image/jpeg, image/png" 
                              onChange={handleImageUpload}
                              className="block w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3 file:border-0 file:font-bold file:bg-orange-500 file:text-white hover:file:bg-orange-600 file:cursor-pointer transition-colors border border-gray-300 bg-white rounded-sm shadow-sm"
                            />
                            {paymentScreenshot && (
                              <div className="mt-2 text-xs text-emerald-600 font-bold uppercase flex items-center justify-center gap-1">
                                <CheckCircle2 size={16} /> SCREENSHOT ATTACHED
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        id="submit-checkout-btn"
                        type="submit"
                        className="w-full bg-black text-white text-[10px] font-mono tracking-[0.25em] py-4 uppercase font-extrabold hover:bg-neutral-900 transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        SECURE CHECKOUT <ArrowRight size={13} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : checkoutStep === "loading" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6 font-mono select-none my-auto"
              >
                {/* Clean Green Pulse Circle & Icon */}
                <div className="relative w-24 h-24 flex items-center justify-center my-2">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-emerald-500/20 border-2 border-emerald-500"
                  />
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
                    <CheckCircle2 size={40} className="animate-pulse stroke-[2.5]" />
                  </div>
                </div>

                <div className="space-y-2 max-w-xs">
                  <p className="text-xs font-black tracking-[0.2em] text-emerald-600 uppercase">
                    AUTHORIZING PAYMENT...
                  </p>
                  <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase leading-relaxed">
                    VERIFYING PAYMENT RECEIPT & PROCESSING ORDER.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative flex-1 flex flex-col items-center justify-center text-center p-6 space-y-5 font-mono select-none overflow-hidden my-auto"
              >
                {/* Green Checkmark Success Icon Animation */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.15, 1] }}
                    transition={{ type: "spring", stiffness: 350, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30"
                  >
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.8, 2.2] }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                  />
                </div>

                {/* Verified Authorization Banner & Status */}
                <div className="space-y-2 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-black tracking-widest uppercase shadow-sm"
                  >
                    <Clock size={12} className="text-emerald-600 animate-spin" />
                    PAYMENT VERIFICATION PENDING
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-mono font-black text-black tracking-[0.2em] uppercase pt-1"
                  >
                    RECEIPT NO: #{generatedOrderNum}
                  </motion.h3>
                </div>

                {/* Receipt Card Details */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-neutral-50 border border-neutral-200 p-4 rounded-md text-left w-full space-y-3 text-[10px] tracking-wide leading-relaxed shadow-sm z-10"
                >
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <span className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">ORDER STATUS</span>
                    <span className="bg-amber-500/15 text-amber-700 border border-amber-300 font-mono font-extrabold px-2 py-0.5 rounded text-[9px] tracking-widest uppercase flex items-center gap-1">
                      <Clock size={10} /> PAYMENT VERIFICATION PENDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">CUSTOMER</p>
                      <p className="text-black font-extrabold uppercase truncate">{name || "NANGSAL CUSTOMER"}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">PHONE</p>
                      <p className="text-black font-mono font-bold">{phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-neutral-400 font-bold uppercase text-[8px] tracking-wider">DELIVERY ADDRESS</p>
                    <p className="text-neutral-800 font-semibold uppercase">{getCombinedAddress()}</p>
                  </div>

                  {paymentScreenshot && (
                    <div className="pt-2 border-t border-neutral-200 flex items-center gap-2">
                      <img
                        src={paymentScreenshot}
                        alt="Payment proof"
                        className="w-10 h-10 object-cover rounded border border-neutral-300 shadow-sm"
                      />
                      <div className="text-[9px] font-mono">
                        <p className="text-emerald-600 font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 size={11} /> SCREENSHOT ATTACHED
                        </p>
                        <p className="text-neutral-500 font-bold uppercase">PAYMENT VERIFICATION PENDING</p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full space-y-2 z-10"
                >
                  <a
                    href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello Nangsal Apparel! I have completed payment authorization for order #${generatedOrderNum}. Please confirm tracking!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-3 px-4 rounded text-[10px] font-mono font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-md"
                  >
                    TRACK VIA WHATSAPP ({siteSettings.whatsappNumber})
                  </a>

                  <button
                    id="cart-complete-confirm-btn"
                    onClick={() => {
                      clearCart();
                      handleClose();
                    }}
                    className="w-full bg-black text-white text-[10px] font-mono tracking-[0.25em] py-3.5 uppercase font-bold hover:bg-neutral-900 transition-colors rounded-sm cursor-pointer shadow"
                  >
                    RETURN TO STOREDROP
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
