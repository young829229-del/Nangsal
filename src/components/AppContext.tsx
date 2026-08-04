import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, CurrencyCode, CURRENCIES, SiteSettings } from "../types";
import { PRODUCTS } from "../data";
import { auth, db, OperationType, handleFirestoreError } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, query, where } from "firebase/firestore";

export interface LocalUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, qty: number, userHeight?: string, userWeight?: string) => void;
  removeFromCart: (productId: string, size: string, userHeight?: string, userWeight?: string) => void;
  updateCartQty: (productId: string, size: string, qty: number, userHeight?: string, userWeight?: string) => void;
  clearCart: () => void;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "HOME" | "SHOP" | "TERMS" | "ADMIN" | "LOGIN";
  setActiveTab: (tab: "HOME" | "SHOP" | "TERMS" | "ADMIN" | "LOGIN") => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  formatPrice: (priceInNPR: number) => string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // User profile & auth variables
  user: LocalUser | null;
  isLoadingUser: boolean;
  userProfile: { name: string; phone: string; address: string; email: string } | null;
  orders: any[];
  loginWithGoogle: () => Promise<{ error?: string } | void>;
  loginWithCustomToken: (token: string) => Promise<{ error?: string } | void>;
  logout: () => Promise<void>;
  updateProfileDetails: (name: string, phone: string, address: string, email?: string) => Promise<void>;
  saveOrderToHistory: (
    name: string, 
    phone: string, 
    address: string, 
    totalAmount: number, 
    paymentScreenshotBase64?: string, 
    itemsOverride?: any[],
    paymentMethod?: string,
    deliveryCharge?: number,
    subtotal?: number,
    city?: string
  ) => Promise<any>;
  
  // Dynamic products configuration
  products: Product[];
  updateProduct: (productId: string, updatedFields: Partial<Product>) => Promise<void>;
  reorderProducts: (reorderedProducts: Product[]) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Global settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  heroImage: "https://www.image2url.com/r2/default/videos/1785427733008-d0075094-b91b-47d2-9301-6e9921441b18.mp4",
  aboutBrandImage: "https://i.ibb.co/sv0M73GB/IMG-3339.jpg",
  aboutBrandVideo: "https://www.image2url.com/r2/default/videos/1785203915703-c3828fb3-47c3-4c99-bdf6-781f7f68f0a0.mp4",
  bankQrImage: "https://i.ibb.co/ycQVc65Q/IMG-20260727-WA0003-2.jpg",
  bankAccountName: "SUNIL GURUNG",
  esewaQrImage: "https://i.ibb.co/nsLvH2ZX/IMG-20260727-WA0004-2.jpg",
  esewaHolderName: "SUNIL GURUNG",
  whatsappNumber: "+977 984-7459808",
  instagramUrl: "https://www.instagram.com/by_nangsal?igsh=aWpldjB4anIwd3gz",
  tiktokUrl: "https://www.tiktok.com/@nangsal_apparel?_r=1&_t=ZS-98PVmr7Eg2H",
  targetDate: "2026-06-10T14:54:06Z",
  deliveryInsideKtm: 100,
  deliveryOutsideKtm: 150,
  promoCode: "",
  promoDiscountPercent: 0,
  allowedAdminEmails: [
    "young829229@gmail.com"
  ]
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products initialized from localStorage or static PRODUCTS
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("nangsal_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge static PRODUCTS updates (such as updated image URLs & sizes ["S", "M", "L"]) into cached products
          return parsed.map((p: Product) => {
            const staticMatch = PRODUCTS.find((sp) => sp.id === p.id);
            if (staticMatch) {
              return { ...p, images: staticMatch.images, sizes: staticMatch.sizes };
            }
            return { ...p, sizes: ["S", "M", "L"] };
          });
        }
      }
    } catch (e) {
      console.warn("Could not load local products:", e);
    }
    return PRODUCTS;
  });

  // Site settings initialized from localStorage or default
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem("nangsal_site_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        // If stored hero image was the old static image, update to the new video banner URL
        if (!parsed.heroImage || parsed.heroImage === "https://i.ibb.co/BKQYptr5/IMG-3343.jpg") {
          parsed.heroImage = DEFAULT_SETTINGS.heroImage;
        }
        const cleanEmails = (parsed.allowedAdminEmails || DEFAULT_SETTINGS.allowedAdminEmails).filter(
          (e: string) => !["comodevs@gmail.com", "sahakash2007777@gmail.com", "ghalanbinod4@gmail.com", "yourgmail@gmail.com"].includes(e.trim().toLowerCase())
        );
        return { ...DEFAULT_SETTINGS, ...parsed, allowedAdminEmails: cleanEmails.length > 0 ? cleanEmails : ["young829229@gmail.com"] };
      }
    } catch (e) {
      console.warn("Could not load local settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("nangsal_cart") || localStorage.getItem("slimhood_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // User auth state (Local state)
  const [user, setUser] = useState<LocalUser | null>(() => {
    try {
      const saved = localStorage.getItem("nangsal_local_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; phone: string; address: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem("nangsal_guest_profile") || localStorage.getItem("slimhood_guest_profile");
      return saved ? JSON.parse(saved) : { name: "", phone: "", address: "", email: "" };
    } catch (e) {
      return { name: "", phone: "", address: "", email: "" };
    }
  });

  // Orders state
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("nangsal_guest_orders") || localStorage.getItem("slimhood_guest_orders");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Currency selection backed by localStorage
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem("nangsal_currency") || localStorage.getItem("slimhood_currency");
    return (saved as CurrencyCode) || "NPR";
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTabState] = useState<"HOME" | "SHOP" | "TERMS" | "ADMIN" | "LOGIN">(() => {
    const saved = sessionStorage.getItem("nangsal_active_tab") || sessionStorage.getItem("slimhood_active_tab");
    return (saved as "HOME" | "SHOP" | "TERMS" | "ADMIN" | "LOGIN") || "HOME";
  });

  const setActiveTab = (tab: "HOME" | "SHOP" | "TERMS" | "ADMIN" | "LOGIN") => {
    setActiveTabState(tab);
    sessionStorage.setItem("nangsal_active_tab", tab);
  };

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("nangsal_cart", JSON.stringify(cart));
    if (auth.currentUser && user && user.uid) {
      const cartRef = doc(db, "carts", user.uid);
      setDoc(cartRef, { items: cart, updatedAt: new Date().toISOString() }, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `carts/${user.uid}`);
      });
    }
  }, [cart, user]);

  useEffect(() => {
    localStorage.setItem("nangsal_currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("nangsal_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("nangsal_site_settings", JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("nangsal_local_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("nangsal_local_user");
    }
  }, [user]);

  // Sync remote cart from Firestore on login
  useEffect(() => {
    if (!auth.currentUser || !user || !user.uid) return;

    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteCart = snapshot.data().items;
          if (Array.isArray(remoteCart)) {
            setCart(remoteCart);
          }
        } else if (cart.length > 0) {
          setDoc(cartRef, { items: cart, updatedAt: new Date().toISOString() }, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, `carts/${user.uid}`);
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `carts/${user.uid}`);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Sync orders from Firestore across all devices for logged in user
  useEffect(() => {
    if (!auth.currentUser || !user || !user.uid) {
      try {
        const saved = localStorage.getItem("nangsal_guest_orders") || localStorage.getItem("slimhood_guest_orders");
        if (saved) setOrders(JSON.parse(saved));
      } catch (e) {}
      return;
    }

    const qUser = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribeUserOrders = onSnapshot(
      qUser,
      (snapshot) => {
        const remoteOrders: any[] = [];
        snapshot.forEach((docSnap) => {
          remoteOrders.push({ id: docSnap.id, ...docSnap.data() });
        });

        let localOrders: any[] = [];
        try {
          const saved = localStorage.getItem("nangsal_guest_orders") || localStorage.getItem("slimhood_guest_orders");
          if (saved) localOrders = JSON.parse(saved);
        } catch (e) {}

        const map = new Map<string, any>();
        localOrders.forEach((o) => {
          if (o && o.id) map.set(o.id, o);
        });
        remoteOrders.forEach((o) => {
          if (o && o.id) map.set(o.id, { ...map.get(o.id), ...o });
        });

        const merged = Array.from(map.values()).sort(
          (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        setOrders(merged);
        localStorage.setItem("nangsal_guest_orders", JSON.stringify(merged));
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "orders");
      }
    );

    return () => unsubscribeUserOrders();
  }, [user?.uid, user?.email]);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const u: LocalUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email.toLowerCase(),
          displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          photoURL: firebaseUser.photoURL || undefined
        };
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateProduct = async (productId: string, updatedFields: Partial<Product>) => {
    setProducts((prev) => {
      const newList = prev.map((p) => (p.id === productId ? { ...p, ...updatedFields } : p));
      localStorage.setItem("nangsal_products", JSON.stringify(newList));
      return newList;
    });

    // Also attempt server call if available
    try {
      const defaultAdminToken = import.meta.env.VITE_ADMIN_BEARER_TOKEN || "nangsal_secure_admin_token_v1";
      const token = localStorage.getItem("nangsal_admin_token") || defaultAdminToken;
      await fetch(`/api/admin/products/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {
      // Local fallback handled
    }
  };

  const reorderProducts = async (reorderedProducts: Product[]) => {
    const newProducts = reorderedProducts.map((p, index) => ({ ...p, order: index }));
    setProducts(newProducts);
    localStorage.setItem("nangsal_products", JSON.stringify(newProducts));
  };

  const addProduct = async (productObj: Omit<Product, "id">) => {
    const newId = `prod_${Date.now()}`;
    const newProduct: Product = { ...productObj, id: newId };
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      localStorage.setItem("nangsal_products", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem("nangsal_products", JSON.stringify(updated));
      return updated;
    });
  };

  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem("nangsal_site_settings", JSON.stringify(updated));
      return updated;
    });
  };

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
    }
  };

  const loginWithGoogle = async (): Promise<{ error?: string; user?: LocalUser } | void> => {
    setIsLoadingUser(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      if (!googleUser || !googleUser.email) {
        return { error: "Failed to retrieve email address from Google." };
      }
      const localU: LocalUser = {
        uid: googleUser.uid,
        email: googleUser.email.toLowerCase(),
        displayName: googleUser.displayName || googleUser.email.split("@")[0],
        photoURL: googleUser.photoURL || undefined
      };
      setUser(localU);
      return { user: localU };
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        return { error: "Google sign-in popup was closed before completing." };
      }
      if (err.code === "auth/unauthorized-domain" || (err.message && err.message.includes("unauthorized-domain"))) {
        return {
          error: "This app's preview domain is not listed in Firebase Console Authorized Domains. Please enter your authorized admin Gmail directly below to sign in."
        };
      }
      if (err.code === "auth/configuration-not-found" || (err.message && err.message.includes("configuration-not-found"))) {
        return { 
          error: "Google Sign-In is not enabled in Firebase Console for project 'nangsal'. Enable Google Provider under Authentication > Sign-in method in Firebase Console, or use Direct Gmail Sign-in below." 
        };
      }
      if (err.code === "auth/operation-not-allowed") {
        return {
          error: "Google Provider is disabled in Firebase Authentication settings. Please enable Google provider in Firebase Console."
        };
      }
      return { error: err.message || "Failed to sign in with Google." };
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loginWithCustomToken = async (token: string): Promise<{ error?: string } | void> => {
    setIsLoadingUser(true);
    try {
      const localU: LocalUser = {
        uid: `user_${Date.now()}`,
        email: "admin@nangsal.com",
        displayName: "Admin Operator"
      };
      setUser(localU);
      return;
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setIsLoadingUser(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCart([]);
      setUserProfile(null);
      setUser(null);
      localStorage.removeItem("nangsal_cart");
      localStorage.removeItem("slimhood_cart");
      localStorage.removeItem("nangsal_guest_profile");
      localStorage.removeItem("slimhood_guest_profile");
      localStorage.removeItem("nangsal_local_user");
      sessionStorage.removeItem("nangsal_admin_logged_in");
      setActiveTab("HOME");
    } catch (error) {
      console.error("User logout failure:", error);
    }
  };

  const updateProfileDetails = async (name: string, phone: string, address: string, email: string = "") => {
    const profile = {
      name,
      phone,
      address,
      email: email || userProfile?.email || ""
    };
    setUserProfile(profile);
    localStorage.setItem("nangsal_guest_profile", JSON.stringify(profile));
  };

  const saveOrderToHistory = async (
    name: string, 
    phone: string, 
    address: string, 
    totalAmount: number, 
    paymentScreenshotBase64?: string, 
    itemsOverride?: any[],
    paymentMethod: string = "esewa",
    deliveryCharge: number = 0,
    subtotal?: number,
    city: string = ""
  ) => {
    const orderId = `ord_${Math.floor(100000 + Math.random() * 900000)}`;

    const serializedItems = itemsOverride || cart.map(item => {
      let finalSize = item.selectedSize || "";
      const hasHW = Boolean(item.userHeight || item.userWeight);
      if (hasHW) {
        const hwText = `(HT: ${item.userHeight || '-'}, WT: ${item.userWeight || '-'})`;
        if (!finalSize || finalSize === "N/A" || finalSize.toUpperCase() === "CUSTOM") {
          finalSize = `CUSTOM ${hwText}`;
        } else if (!finalSize.includes(item.userHeight || "") && !finalSize.includes(item.userWeight || "")) {
          finalSize = `${finalSize} ${hwText}`;
        }
      } else if (!finalSize) {
        finalSize = "STANDARD";
      }

      return {
        productId: item.product.id,
        name: item.product.name,
        selectedSize: finalSize,
        quantity: item.quantity,
        price: item.product.price,
        userHeight: item.userHeight || null,
        userWeight: item.userWeight || null,
        image: item.product.images?.[0] || ""
      };
    });

    const newOrder: any = {
      id: orderId,
      name,
      phone,
      address,
      city: city || "",
      paymentMethod,
      deliveryCharge,
      subtotal: subtotal || totalAmount,
      totalAmount,
      items: serializedItems,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      paymentScreenshotBase64: paymentScreenshotBase64 || null
    };

    if (auth.currentUser && user) {
      newOrder.userId = user.uid;
      newOrder.userEmail = user.email;

      // Save order to Firestore database for persistent cross-device access
      try {
        await setDoc(doc(db, "orders", orderId), newOrder);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
      }
    }

    // Save locally
    setOrders((prev) => {
      const updated = [newOrder, ...prev.filter((o) => o.id !== orderId)];
      try {
        localStorage.setItem("nangsal_guest_orders", JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // Post to local server endpoint
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, orderData: newOrder })
      });
    } catch (e) {
      // Local fallback handled
    }

    // Decrement stock locally for ordered items
    for (const item of serializedItems) {
      setProducts(prev => prev.map(p => {
        if (p.id === item.productId && p.stock !== undefined) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));
    }

    return orderId;
  };

  const addToCart = async (product: Product, size: string, qty: number, userHeight?: string, userWeight?: string) => {
    if (product.isSoldOut) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size && item.userHeight === userHeight && item.userWeight === userWeight
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      } else {
        return [...prev, { product, selectedSize: size, quantity: qty, userHeight, userWeight }];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = async (productId: string, size: string, userHeight?: string, userWeight?: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.selectedSize === size && item.userHeight === userHeight && item.userWeight === userWeight)));
  };

  const updateCartQty = async (productId: string, size: string, qty: number, userHeight?: string, userWeight?: string) => {
    if (qty <= 0) {
      await removeFromCart(productId, size, userHeight, userWeight);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size && item.userHeight === userHeight && item.userWeight === userWeight
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = async () => {
    setCart([]);
  };

  const formatPrice = (priceInNPR: number): string => {
    const config = CURRENCIES[currency];
    const converted = priceInNPR * (config.rate / CURRENCIES["NPR"].rate);
    
    if (config.code === "NPR") {
      return `Rs. ${converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${converted.toFixed(2)} ${config.code}`;
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        currency,
        setCurrency,
        isCartOpen,
        setIsCartOpen,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedProductForModal,
        setSelectedProductForModal,
        formatPrice,
        selectedCategory,
        setSelectedCategory,
        user,
        isLoadingUser,
        userProfile,
        orders,
        loginWithGoogle,
        loginWithCustomToken,
        logout,
        updateProfileDetails,
        saveOrderToHistory,
        products,
        updateProduct,
        reorderProducts,
        addProduct,
        deleteProduct,
        siteSettings,
        updateSiteSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
