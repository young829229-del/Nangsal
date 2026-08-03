import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { CurrencyCode } from "../types";
import { Search, ShoppingBag, User, ChevronDown, X, Menu, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";

export const Header: React.FC = () => {
  const {
    cart,
    currency,
    setCurrency,
    isCartOpen,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    userProfile,
    user,
    updateProfileDetails,
    formatPrice,
    products,
    loginWithCustomToken,
    logout,
    siteSettings,
  } = useApp();

  const allowedEmails = siteSettings?.allowedAdminEmails || ["young829229@gmail.com", "comodevs@gmail.com", "sahakash2007777@gmail.com", "ghalanbinod4@gmail.com"];
  const isAdmin = Boolean(
    (user?.email && allowedEmails.some(e => e.toLowerCase() === user.email.toLowerCase())) ||
    (userProfile?.email && allowedEmails.some(e => e.toLowerCase() === userProfile.email.toLowerCase()))
  );

  const [scrolled, setScrolled] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const [guestOrders, setGuestOrders] = useState<any[]>([]);
  const [isSavedText, setIsSavedText] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.name || "");
      setProfilePhone(userProfile.phone || "");
      setProfileAddress(userProfile.address || "");
    }
  }, [userProfile]);

  useEffect(() => {
    if (showProfileModal) {
      const loadOrders = async () => {
        try {
          const saved = localStorage.getItem("nangsal_guest_orders") || localStorage.getItem("slimhood_guest_orders");
          if (saved) {
            const parsedOrders = JSON.parse(saved);
            parsedOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setGuestOrders(parsedOrders);
          } else {
            setGuestOrders([]);
          }
        } catch (err) {
          console.error("Failed to load orders:", err);
        }
      };
      loadOrders();
    }
  }, [showProfileModal, user]);

  useEffect(() => {
    if (!userProfile || !userProfile.email) {
      setLoginStep("email");
      setLoginEmail("");
      setOtpCode("");
    }
  }, [userProfile]);

  const handleSendOtp = async () => {
    setLoginError("");
    if (!loginEmail) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    setIsSendingOtp(true);
    try {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(generated);
      
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, code: generated })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }
      
      setLoginStep("otp");
      if (data.isDevMode) {
        setLoginError(`Preview mode: No email config found. Use code: ${generated}`);
      }
    } catch (err) {
      console.error(err);
      setLoginError("Error generating OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSendingOtp(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, code: otpCode, sentCode: sentOtp })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }
      
      if (!data.isFallback) {
        const authResult = await loginWithCustomToken(data.token);
        if (authResult && authResult.error) {
          throw new Error(authResult.error);
        }
      }

      await updateProfileDetails(profileName, profilePhone, profileAddress, loginEmail);
      setLoginStep("email"); // reset for future
      setOtpCode("");
      setLoginEmail("");
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Invalid code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch("/api/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }
      
      // Update local state to reflect cancellation
      setGuestOrders(prev => prev.map(ord => 
        ord.id === orderId ? { ...ord, status: "CANCELLED" } : ord
      ));
      
      // Update localStorage for guest orders
      const saved = localStorage.getItem("nangsal_guest_orders") || localStorage.getItem("slimhood_guest_orders");
      if (saved) {
        const parsedOrders = JSON.parse(saved);
        const updatedOrders = parsedOrders.map((ord: any) => 
          ord.id === orderId ? { ...ord, status: "CANCELLED" } : ord
        );
        localStorage.setItem("nangsal_guest_orders", JSON.stringify(updatedOrders));
      }
      
      alert("Order cancelled successfully");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileDetails(profileName, profilePhone, profileAddress, userProfile?.email || "");
    setIsSavedText(true);
    setTimeout(() => {
      setIsSavedText(false);
    }, 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    setShowCurrencyDropdown(false);
  };

  return (
    <>
      <header id="app-header" className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
        {/* Top Announcement Bar */}
        <div id="announcement-bar" className="w-full bg-[#ececec] border-b border-neutral-200 py-2 text-center flex items-center justify-center select-none animate-fade-in">
          <span className="text-[10px] font-medium tracking-[0.25em] text-[#333333]">
            NEW DROP LIVE NOW.
          </span>
        </div>

        {/* Main Navbar */}
        <div
          id="main-navbar"
          className={`w-full transition-shadow duration-300 border-b ${
            scrolled
              ? "bg-white shadow-sm border-neutral-200"
              : "bg-white border-neutral-150"
          } py-3 px-6 md:px-12`}
        >
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            {/* Left: Rebranded Decal Logo */}
            <div className="flex-1 flex justify-start">
              <button
                id="brand-logo-btn"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setActiveTab("HOME");
                }}
                className="group flex flex-col justify-center cursor-pointer select-none"
              >
                <img
                  src="https://i.ibb.co/HphLbYyj/nangsal-logo-white-bg.png"
                  alt="NANGSAL Logo"
                  className="h-7 md:h-9 object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>

            {/* Center: Navigation Links */}
            <nav id="nav-center-menu" className="hidden md:flex items-center gap-10">
              <button
                id="nav-link-home"
                onClick={() => {
                  setActiveTab("HOME");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`text-xs font-semibold tracking-[0.25em] transition-all relative pb-1 hover:opacity-50 cursor-pointer ${
                  activeTab === "HOME" ? "text-black" : "text-neutral-500"
                }`}
              >
                HOME
              </button>
              <div className="relative group">
                <button
                  id="nav-link-shop"
                  onClick={() => {
                    setActiveTab("SHOP");
                    // Scroll to the main list
                    const target = document.getElementById("shop-section");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`text-xs font-semibold tracking-[0.25em] transition-all flex items-center gap-1 pb-1 hover:opacity-50 cursor-pointer ${
                    activeTab === "SHOP" ? "text-black" : "text-neutral-500"
                  }`}
                >
                  SHOP <ChevronDown size={11} className="text-neutral-400 group-hover:text-black transition-colors" />
                </button>

                {/* Dropdown under SHOP styling */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-neutral-100 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 rounded-sm py-2">
                  {(Array.from(new Set(products.map(p => p.section.toUpperCase()))) as string[]).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setActiveTab("SHOP");
                        setTimeout(() => {
                          const elem = document.getElementById(`section-grid-${sec}`);
                          if (elem) elem.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }}
                      className="w-full text-left font-semibold text-[10px] tracking-wider py-2.5 px-4 text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors cursor-pointer uppercase"
                    >
                      {sec}
                    </button>
                  ))}
                  <div className="border-t border-neutral-100 my-1"></div>
                  {(Array.from(new Set(products.map(p => p.category.toUpperCase()))) as string[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveTab("SHOP");
                        setSelectedCategory(cat);
                        setTimeout(() => {
                          const elem = document.getElementById("shop-section");
                          if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      }}
                      className="w-full text-left font-semibold text-[10px] tracking-wider py-2 px-4 text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors cursor-pointer uppercase"
                    >
                      {cat} ONLY
                    </button>
                  ))}
                </div>
              </div>
              <button
                id="nav-link-terms"
                onClick={() => setActiveTab("TERMS")}
                className={`text-xs font-semibold tracking-[0.25em] transition-all relative pb-1 hover:opacity-50 cursor-pointer ${
                  activeTab === "TERMS" ? "text-black" : "text-neutral-500"
                }`}
              >
                TERMS
              </button>
              {isAdmin && (
                <button
                  id="nav-link-admin"
                  onClick={() => setActiveTab("ADMIN")}
                  className={`transition-all relative hover:opacity-50 cursor-pointer p-1 ml-4 ${
                    activeTab === "ADMIN" ? "text-rose-600" : "text-neutral-300 hover:text-neutral-500"
                  }`}
                  title="System Admin Menu"
                >
                  <Menu size={18} strokeWidth={1.5} />
                </button>
              )}
            </nav>

            {/* Right: Search, Profile, Cart */}
            <div id="nav-right-actions" className="flex-1 flex items-center justify-end gap-6 md:gap-7">

              {/* Profile Icon button */}
              <button
                id="profile-toggle-btn"
                onClick={() => setShowProfileModal(true)}
                className="text-black hover:text-neutral-500 transition-colors cursor-pointer relative py-1"
                aria-label="Shipping Profile"
              >
                <User size={20} className="stroke-[1.5]" />
                {userProfile && (userProfile.name || userProfile.phone || userProfile.address) && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-black rounded-full" />
                )}
              </button>

              {/* Search Toggle button */}
              <button
                id="search-toggle-btn"
                onClick={() => {
                  setShowSearchInput(!showSearchInput);
                  if (activeTab !== "SHOP") setActiveTab("SHOP");
                }}
                className={`text-black hover:text-neutral-500 transition-colors cursor-pointer py-1 ${showSearchInput ? "text-neutral-400" : ""}`}
                aria-label="Search items"
              >
                <Search size={20} className="stroke-[1.5]" />
              </button>

              {/* Cart Drawer Toggle button */}
              <button
                id="cart-drawer-toggle-btn"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="group text-black hover:text-neutral-500 transition-colors cursor-pointer relative py-1 flex items-center justify-center gap-1.5"
                aria-label="Shopping bag"
              >
                <div className="relative">
                  <ShoppingBag
                    size={20}
                    className={`stroke-[1.8] transition-transform group-hover:scale-105 ${
                      cartCount > 0
                        ? "text-orange-500 fill-orange-500/20"
                        : "text-black"
                    }`}
                  />
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 bg-orange-500 text-white text-[8px] font-mono font-bold flex items-center justify-center rounded-full px-1 border border-white"
                    >
                      {cartCount}
                    </motion.div>
                  )}
                </div>
              </button>

              {/* Mobile Hamburger Menu Button */}
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-black hover:text-neutral-500 transition-colors cursor-pointer py-1 flex items-center justify-center"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X size={20} className="stroke-[1.5]" /> : <Menu size={20} className="stroke-[1.5]" />}
              </button>
            </div>
          </div>

          {/* Collapsible Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden border-t border-neutral-100/50 mt-4"
              >
                <div className="flex flex-col py-5 pb-2 gap-4 font-mono text-[10px] tracking-[0.25em]">
                  <button
                    id="mobile-nav-home"
                    onClick={() => {
                      setActiveTab("HOME");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left py-2 border-b border-neutral-100/40 hover:opacity-50 transition-all cursor-pointer font-bold ${
                      activeTab === "HOME" ? "text-black border-l border-black pl-2" : "text-neutral-500 pl-0"
                    }`}
                  >
                    HOME
                  </button>
                  <button
                    id="mobile-nav-collection"
                    onClick={() => {
                      setActiveTab("SHOP");
                      setSelectedCategory("ALL");
                      setIsMobileMenuOpen(false);
                      setTimeout(() => {
                        const target = document.getElementById("shop-section");
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 120);
                    }}
                    className={`text-left py-2 border-b border-neutral-100/40 hover:opacity-50 transition-all cursor-pointer font-bold ${
                      activeTab === "SHOP" && selectedCategory === "ALL" ? "text-black border-l border-black pl-2" : "text-neutral-500 pl-0"
                    }`}
                  >
                    COLLECTION
                  </button>
                  {(Array.from(new Set(products.map(p => p.category.toUpperCase()))) as string[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveTab("SHOP");
                        setSelectedCategory(cat);
                        setIsMobileMenuOpen(false);
                        setTimeout(() => {
                          const target = document.getElementById("shop-section");
                          if (target) {
                            target.scrollIntoView({ behavior: "smooth" });
                          }
                        }, 120);
                      }}
                      className={`text-left py-2 border-b border-neutral-100/40 hover:opacity-50 transition-all cursor-pointer font-bold uppercase ${
                        activeTab === "SHOP" && selectedCategory === cat ? "text-black border-l border-black pl-2" : "text-neutral-500 pl-0"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {isAdmin && (
                    <button
                      id="mobile-nav-admin"
                      onClick={() => {
                        setActiveTab("ADMIN");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-left py-2 border-b border-neutral-100/40 hover:opacity-50 transition-all cursor-pointer font-bold ${
                        activeTab === "ADMIN" ? "text-rose-600 border-l border-rose-600 pl-2" : "text-rose-500 pl-0"
                      }`}
                    >
                      ADMIN PANEL
                    </button>
                  )}
                  <button
                    id="mobile-nav-cart"
                    onClick={() => {
                      setIsCartOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-2 border-b border-neutral-100/40 text-neutral-500 hover:text-black transition-all cursor-pointer font-bold flex items-center justify-between"
                  >
                    <span>CART</span>
                    <span className="bg-black text-white px-2 py-0.5 text-[8px] font-bold rounded-full font-mono">{cartCount}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsible Search Row */}
          <AnimatePresence>
            {showSearchInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-150/10"
              >
                <div className="max-w-[1200px] mx-auto py-4 flex items-center gap-3">
                  <span className="text-[10px] font-mono tracking-widest text-gray-400">SEARCH:</span>
                  <input
                    id="search-main-input"
                    type="text"
                    placeholder="ENTER CAP, JACKET, JOGGERS, DENIM..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                    className="flex-1 bg-transparent border-b border-gray-300 py-1.5 text-xs font-mono uppercase tracking-widest focus:outline-none focus:border-black transition-colors"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      id="search-clear-btn"
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-black transition-colors"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    id="search-close-row-btn"
                    onClick={() => {
                      setShowSearchInput(false);
                      setSearchQuery("");
                    }}
                    className="text-xs font-mono tracking-widest text-gray-500 hover:text-black transition-all"
                  >
                    CLOSE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* User login / profile modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div id="profile-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white p-8 border border-neutral-200 shadow-2xl rounded-sm z-50 text-left overflow-y-auto max-h-[90vh]"
            >
              <button
                id="close-profile-modal-btn"
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6 text-center">
                <span className="text-[11px] font-mono tracking-[0.4em] text-neutral-400 block mb-1">
                  N A N G S A L  A P P A R E L
                </span>
                <h3 className="text-xs font-mono tracking-widest text-black font-extrabold uppercase">
                  {(userProfile && userProfile.email) ? "SHIPPING PROFILE & ORDERS" : "LOGIN / REGISTER"}
                </h3>
              </div>

              {(!userProfile || !userProfile.email) && loginStep === "email" && (
                <div className="space-y-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4 font-sans text-sm">
                    {loginError && <p className="text-red-500 text-xs font-mono bg-red-50 p-2 border border-red-100">{loginError}</p>}
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-sm p-3.5 pr-12 text-neutral-800 placeholder-neutral-500 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black hover:bg-neutral-100 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isSendingOtp ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ArrowRight size={18} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {(!userProfile || !userProfile.email) && loginStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 font-mono text-xs uppercase text-neutral-500">
                  {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 block text-left">6-DIGIT VERIFICATION CODE</label>
                    <input
                      type="text"
                      required
                      placeholder="ENTER OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm text-neutral-800 tracking-widest focus:outline-none focus:border-black focus:bg-white text-center tracking-[0.5em] rounded-sm transition-all"
                    />
                    <p className="text-[9px] text-neutral-400 text-left mt-2 lowercase">
                      (For this preview, use code: {sentOtp})
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full bg-black text-white text-[11px] font-bold tracking-widest py-3.5 hover:bg-neutral-900 transition-colors cursor-pointer rounded-sm disabled:opacity-50 flex justify-center items-center h-[46px]"
                  >
                    {isSendingOtp ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "VERIFY & LOGIN"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginStep("email")}
                    className="w-full bg-transparent text-neutral-500 border border-neutral-200 text-[10px] font-bold tracking-widest py-3 hover:bg-neutral-50 transition-colors cursor-pointer rounded-sm"
                  >
                    BACK
                  </button>
                </form>
              )}

              {userProfile && userProfile.email && (
                <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs uppercase text-neutral-500">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 block">FULL NAME</label>
                    <input
                      id="profile-name-input"
                      type="text"
                      required
                      placeholder="ENTER FULL NAME"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-xs text-neutral-800 tracking-wider focus:outline-none focus:border-black focus:bg-white rounded-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 block">EMAIL ADDRESS</label>
                    <input
                      id="profile-email-input"
                      type="email"
                      required
                      disabled
                      value={userProfile.email}
                      className="w-full bg-neutral-200 border border-neutral-300 p-2.5 text-xs text-neutral-500 tracking-wider focus:outline-none rounded-none cursor-not-allowed lowercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 block">PHONE NUMBER (OPTIONAL)</label>
                    <input
                      id="profile-phone-input"
                      type="tel"
                      placeholder="ENTER PHONE NUMBER"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-xs text-neutral-800 tracking-wider focus:outline-none focus:border-black focus:bg-white rounded-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 block">DELIVERY ADDRESS (OPTIONAL)</label>
                    <input
                      id="profile-address-input"
                      type="text"
                      placeholder="ENTER APARTMENT, STREET, CITY"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-xs text-neutral-800 tracking-wider focus:outline-none focus:border-black focus:bg-white rounded-none transition-all"
                    />
                  </div>

                  <button
                    id="profile-save-btn"
                    type="submit"
                    className="w-full bg-black text-white text-[10px] font-bold tracking-widest py-3 hover:bg-neutral-900 transition-colors cursor-pointer rounded-none"
                  >
                    {isSavedText ? "SAVED SUCCESSFULLY ✓" : "SAVE SHIPPING PROFILE"}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setShowProfileModal(false);
                    }}
                    className="w-full bg-transparent text-red-600 border border-red-200 text-[10px] font-bold tracking-widest py-3 hover:bg-red-50 transition-colors cursor-pointer rounded-none mt-2"
                  >
                    LOG OUT
                  </button>
                </form>
              )}

              {/* Guest Order History */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h4 className="text-[10px] font-mono tracking-widest text-black font-extrabold uppercase mb-3">
                  ORDER HISTORY ({guestOrders.length})
                </h4>

                {guestOrders.length === 0 ? (
                  <p className="text-[9px] font-mono text-neutral-400 uppercase leading-relaxed">
                    No order activity recorded yet. Items you purchase will be tracked here.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {guestOrders.map((ord: any) => (
                      <div key={ord.id} className="bg-neutral-50 border border-neutral-150 p-2 space-y-1.5 font-mono">
                        <div className="flex justify-between items-center text-[9px] text-neutral-400 border-b border-neutral-200 pb-1.5 mb-1.5">
                          <span className="font-bold text-black">{ord.id.toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold tracking-widest ${
                            ord.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            ord.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                            ord.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            ord.status === 'PROCESSING' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {ord.status || 'PENDING'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-neutral-400">
                          <span>DATE</span>
                          <span>
                            {ord.createdAt?.toDate 
                              ? ord.createdAt.toDate().toLocaleDateString() 
                              : new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-800 font-bold space-y-0.5">
                          {ord.items?.map((item: any) => (
                            <div key={`${item.productId}-${item.selectedSize}`} className="flex justify-between">
                              <span className="truncate max-w-[200px]">{item.name} [{item.selectedSize}]</span>
                              <span>QTY: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-neutral-200/60 pt-1.5 flex justify-between items-center text-[9px]">
                          <span className="text-neutral-400">TOTAL PAID:</span>
                          <span className="text-black font-bold">{formatPrice(ord.totalAmount)}</span>
                        </div>
                        {(ord.paymentScreenshotUrl || ord.paymentScreenshotBase64) && (
                          <div className="border-t border-neutral-200/60 pt-1.5 flex justify-between items-center text-[9px]">
                            <span className="text-emerald-600 font-bold flex items-center gap-1 uppercase">
                              <CheckCircle2 size={12} /> RECEIPT
                            </span>
                            <div className="flex gap-2 items-center">
                              <button 
                                onClick={() => setExpandedImage(ord.paymentScreenshotUrl || ord.paymentScreenshotBase64)}
                                className="text-blue-600 underline font-bold uppercase cursor-pointer"
                              >
                                VIEW
                              </button>
                            </div>
                          </div>
                        )}
                        {(!ord.status || ord.status === 'PENDING' || ord.status === 'PROCESSING') && (
                          <div className="border-t border-neutral-200/60 pt-1.5 flex justify-end items-center text-[9px]">
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to cancel this order?")) {
                                  handleCancelOrder(ord.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 font-bold uppercase cursor-pointer underline decoration-red-300 underline-offset-2 transition-colors"
                            >
                              CANCEL ORDER
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedImage && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-screen flex flex-col items-center justify-center"
            >
              <button 
                onClick={() => setExpandedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 cursor-pointer p-2 bg-black/50 rounded-full"
              >
                <X size={24} />
              </button>
              <img 
                src={expandedImage} 
                alt="Receipt Full View" 
                className="w-full h-full object-contain max-h-[85vh] rounded"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
