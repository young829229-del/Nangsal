import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Gift, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  const [paymentMethod, setPaymentMethod] = useState<"fonepay" | "cod">("fonepay");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);

  // Detailed full address fields
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const getCombinedAddress = () => {
    return city ? `${address.trim()}, ${city.trim()}` : address.trim();
  };

  const isInsideKtm = city.toLowerCase().includes("kathmandu") || city.toLowerCase().includes("ktm") || city.toLowerCase().includes("lalitpur") || city.toLowerCase().includes("bhaktapur") || address.toLowerCase().includes("kathmandu") || address.toLowerCase().includes("ktm") || address.toLowerCase().includes("lalitpur") || address.toLowerCase().includes("bhaktapur");
  const deliveryCharge = isInsideKtm ? (siteSettings?.deliveryInsideKtm ?? 120) : (siteSettings?.deliveryOutsideKtm ?? 200);

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
    await saveOrderToHistory(name, phone, combinedAddress, calculateTotal(), paymentScreenshot || undefined);

    setTimeout(() => {
      setCheckoutStep("complete");
    }, 1500);
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
                <ShoppingBag size={16} />
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
                      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <ShoppingBag size={24} />
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
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                            CITY *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            list="janakpur-cities"
                            placeholder="ENTER CITY"
                            className="w-full border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-mono tracking-widest uppercase focus:outline-none focus:border-black rounded-sm"
                          />
                          <datalist id="janakpur-cities">
                            <option value="Janakpur">Janakpur</option>
                            <option value="Dhalkebar">Dhalkebar</option>
                            <option value="Mahendranagar">Mahendranagar</option>
                            <option value="Bateshwar">Bateshwar</option>
                            <option value="Sabaila">Sabaila</option>
                            <option value="Yadukuha">Yadukuha</option>
                            <option value="Jaleshwar">Jaleshwar</option>
                            <option value="Bardibas">Bardibas</option>
                            <option value="Ramanand Chowk">Ramanand Chowk</option>
                            <option value="Bhanu Chowk">Bhanu Chowk</option>
                            <option value="Shiva Chowk">Shiva Chowk</option>
                            <option value="Mujelia">Mujelia</option>
                          </datalist>
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
                        <label className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase block mb-3">
                          PAYMENT METHOD
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("fonepay")}
                            className={`py-4 md:py-5 text-sm font-bold tracking-widest uppercase transition-all rounded-sm border ${
                              paymentMethod === "fonepay" 
                                ? "border-black bg-black text-white" 
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            PAY NOW
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cod")}
                            className={`py-4 md:py-5 text-sm font-bold tracking-widest uppercase transition-all rounded-sm border ${
                              paymentMethod === "cod" 
                                ? "border-black bg-black text-white" 
                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            COD
                          </button>
                        </div>

                        {paymentMethod && (
                          <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-sm mt-3 text-center">
                            <p className="text-black font-black tracking-widest text-lg md:text-xl uppercase mb-3">SCAN TO PAY</p>
                            
                            {/* Bank QR & eSewa QR Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-3">
                              {/* Bank QR */}
                              <div className="bg-neutral-50 p-3 border border-gray-200 rounded flex flex-col items-center">
                                <span className="text-[10px] font-bold font-mono tracking-widest text-black mb-1.5 uppercase">BANK QR</span>
                                <div className="w-28 h-28 bg-white flex items-center justify-center rounded border border-gray-100 overflow-hidden mb-1.5">
                                  <img src={siteSettings.bankQrImage} alt="Bank QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-[10px] font-mono font-black text-black uppercase">A/C: {siteSettings.bankAccountName}</span>
                              </div>

                              {/* eSewa QR */}
                              <div className="bg-neutral-50 p-3 border border-gray-200 rounded flex flex-col items-center">
                                <span className="text-[10px] font-bold font-mono tracking-widest text-black mb-1.5 uppercase">eSEWA QR</span>
                                <div className="w-28 h-28 bg-white flex items-center justify-center rounded border border-gray-100 overflow-hidden mb-1.5">
                                  <img src={siteSettings.esewaQrImage} alt="eSewa QR Code" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-[10px] font-mono font-black text-black uppercase">HOLDER: {siteSettings.esewaHolderName}</span>
                              </div>
                            </div>

                            <p className="text-black font-black tracking-widest text-lg md:text-xl uppercase mt-2">
                              {formatPrice(paymentMethod === "cod" ? deliveryCharge : calculateTotal())}
                            </p>
                            <p className="text-xs text-gray-500 font-bold mb-3">
                              {paymentMethod === "cod" ? "DELIVERY CHARGE ONLY" : "FULL AMOUNT"}
                            </p>

                            {/* WhatsApp Direct Order Button */}
                            <a
                              href={`https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Hello Nangsal Apparel! I want to order items in my cart. Total: ${formatPrice(calculateTotal())}. Order #${generatedOrderNum}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full mb-3 bg-[#25D366] text-white py-2.5 px-3 rounded text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow"
                            >
                              Order via WhatsApp ({siteSettings.whatsappNumber})
                            </a>

                            <div className="mt-2 w-full bg-yellow-50/50 p-3 border-2 border-yellow-400 rounded-sm">
                              <label className="text-xs font-black text-black uppercase block mb-1 text-left bg-yellow-200 inline-block px-1">
                                UPLOAD SCREENSHOT (SS) *
                              </label>
                              <input 
                                type="file" 
                                accept="image/jpeg, image/png" 
                                onChange={handleImageUpload}
                                className="block w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3 file:border-0 file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 file:cursor-pointer transition-colors border border-gray-300 bg-white rounded-sm shadow-sm"
                              />
                              {paymentScreenshot && (
                                <div className="mt-2 text-xs text-emerald-600 font-bold uppercase flex items-center justify-center gap-1">
                                  <CheckCircle2 size={16} /> SCREENSHOT ATTACHED
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 font-mono select-none">
                <div className="relative w-14 h-14">
                  {/* Digital spin rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-black tracking-widest text-black uppercase">
                  AUTHORIZING DEPOSIT...
                </p>
                <p className="text-[10px] text-gray-400 tracking-wider uppercase max-w-xs leading-relaxed">
                  ESTABLISHING SECURE CONNECTION_0 TO MERCURIAL DEPOSITORIES WORLDWIDE. DO NOT CLOSE BAG.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6 font-mono select-none">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-emerald-600 font-bold tracking-[0.3em] uppercase">
                    ORDER INITIATED
                  </p>
                  <h3 className="text-[11px] font-bold text-black tracking-widest uppercase pb-1 border-b border-gray-150">
                    RECEIPT NO: #{generatedOrderNum}
                  </h3>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-sm text-left w-full space-y-2 text-[10px] tracking-wide leading-relaxed">
                  {paymentMethod && (
                    <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-sm mb-4">
                      <p className="text-black font-bold tracking-widest text-sm uppercase mb-2">PAYMENT LOGGED</p>
                      {paymentScreenshot ? (
                        <p className="text-emerald-600 font-mono text-[10px] uppercase tracking-wider text-center font-bold">
                          SCREENSHOT UPLOADED SECURELY.
                        </p>
                      ) : (
                        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-wider text-center">
                          PLEASE ATTACH THE PAYMENT SCREENSHOT TO PROCEED.
                        </p>
                      )}
                      {paymentMethod === "cod" && (
                        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-wider text-center mt-2 border-t border-gray-100 pt-2 w-full">
                          PLEASE PREPARE {formatPrice(calculateSubtotal())} IN CASH FOR THE DELIVERY RIDER.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-emerald-800 font-bold uppercase flex items-center gap-1.5 text-[9px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    ORDER PLACED SUCCESSFULLY
                  </p>
                  <p className="text-gray-700 uppercase font-medium">
                    CUSTOMER: <span className="text-black">{name.toUpperCase()}</span>
                  </p>
                  <p className="text-gray-500 uppercase">
                    Your order has been queued for delivery! You can track the status in your account order history.
                  </p>
                  <p className="text-gray-600 uppercase font-semibold">
                    DESTINATION: {getCombinedAddress().toUpperCase()}
                  </p>
                </div>

                <div className="w-full space-y-2.5">
                  <button
                    id="cart-complete-confirm-btn"
                    onClick={() => {
                      clearCart();
                      handleClose();
                    }}
                    className="w-full bg-black text-white text-[10px] font-mono tracking-[0.25em] py-4 uppercase font-bold hover:bg-neutral-900 transition-colors rounded-sm cursor-pointer"
                  >
                    RETURN TO STOREDROP
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
