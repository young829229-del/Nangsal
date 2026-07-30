import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { 
  Lock, Unlock, Plus, Trash2, Image as ImageIcon, Tag, Undo, LogIn, LogOut, 
  Settings, User, CheckCircle2, AlertCircle, Calendar, DollarSign, MapPin, 
  Phone, RefreshCw, Layers, Eye, Mail, Key, Save, ChevronDown, ChevronUp, ShieldCheck, X,
  Search, Filter, Check, Clock, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ProductCard } from "./ProductCard";
import { Product } from "../types";
import { isInsideKathmanduValley } from "../data/cities";

export const AdminPanel: React.FC = () => {
  const { 
    user, 
    loginWithGoogle,
    logout, 
    products, 
    updateProduct,
    reorderProducts,
    addProduct,
    deleteProduct,
    formatPrice, 
    setActiveTab,
    siteSettings,
    updateSiteSettings
  } = useApp();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"PRODUCTS" | "ORDERS" | "SETTINGS">("PRODUCTS");
  const [orderDateFilter, setOrderDateFilter] = useState<"today" | "3days" | "7days" | "1month" | "lifetime">("lifetime");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");
  const [orderLocationFilter, setOrderLocationFilter] = useState<"ALL" | "VALLEY" | "OUTSIDE">("ALL");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [selectedScreenshotModal, setSelectedScreenshotModal] = useState<string | null>(null);
  const [adminAuthError, setAdminAuthError] = useState<string>("");
  const [googleLoginError, setGoogleLoginError] = useState<string>("");
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [newAdminEmail, setNewAdminEmail] = useState<string>("");
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem("nangsal_admin_logged_in") === "true";
  });

  const allowedAdminEmails = (siteSettings.allowedAdminEmails && siteSettings.allowedAdminEmails.length > 0)
    ? siteSettings.allowedAdminEmails
    : ["young829229@gmail.com", "comodevs@gmail.com", "sahakash2007777@gmail.com", "ghalanbinod4@gmail.com"];

  const isGoogleUserAdmin = Boolean(
    user?.email && allowedAdminEmails.some(e => e.trim().toLowerCase() === user.email.trim().toLowerCase())
  );

  const isAuthorized = isLoggedInAdmin || isGoogleUserAdmin;

  const toggleExpandedOrder = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const saved = localStorage.getItem("slimhood_guest_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o);
        localStorage.setItem("slimhood_guest_orders", JSON.stringify(updated));
        setOrders(updated);
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert("Error updating status: " + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: "VERIFIED" | "PENDING") => {
    try {
      setUpdatingOrderId(orderId);
      const saved = localStorage.getItem("slimhood_guest_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((o: any) => 
          o.id === orderId ? { ...o, paymentStatus: newPaymentStatus, paymentVerified: newPaymentStatus === "VERIFIED" } : o
        );
        localStorage.setItem("slimhood_guest_orders", JSON.stringify(updated));
        setOrders(updated);
      } else {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, paymentStatus: newPaymentStatus, paymentVerified: newPaymentStatus === "VERIFIED" } : o
        ));
      }
    } catch (err: any) {
      console.error("Failed to update payment status:", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);

  // Buffer state while editing product fields
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSizes, setEditSizes] = useState<string>("");
  const [editStock, setEditStock] = useState<number | undefined>(undefined);
  const [editSizeChartUrl, setEditSizeChartUrl] = useState<string>("");
  const [editSection, setEditSection] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const fetchOrdersFromBackend = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoadingOrders(true);
      else setIsRefreshingOrders(true);

      setOrdersError(null);
      let localList: any[] = [];
      const saved = localStorage.getItem("slimhood_guest_orders");
      if (saved) {
        try {
          localList = JSON.parse(saved);
        } catch (e) {}
      }

      // Try fetching server orders as well
      try {
        const res = await fetch("/api/admin/orders", {
          headers: {
            "Authorization": "Bearer nangsal_secure_admin_token_v1"
          }
        });
        if (res.ok) {
          const serverOrders = await res.json();
          if (Array.isArray(serverOrders)) {
            const orderMap = new Map();
            localList.forEach(o => { if (o && o.id) orderMap.set(o.id, o); });
            serverOrders.forEach(o => {
              if (o && o.id) {
                orderMap.set(o.id, { ...orderMap.get(o.id), ...o });
              }
            });
            localList = Array.from(orderMap.values());
          }
        }
      } catch (e) {
        // Fallback to local
      }

      localList.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(localList);
    } catch (error: any) {
      console.error("Failed to query backend orders ledger:", error);
      setOrdersError(error.message);
    } finally {
      if (!isBackground) setIsLoadingOrders(false);
      else setIsRefreshingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchOrdersFromBackend(false);
    const interval = setInterval(() => fetchOrdersFromBackend(true), 12000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const handlePasscodeLogout = async () => {
    sessionStorage.removeItem("nangsal_admin_logged_in");
    setIsLoggedInAdmin(false);
    await logout();
  };

  // Open editor modal for product prices or images
  const openProductEditor = (product: Product) => {
    setSelectedProductToEdit(product);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditImages([...product.images]);
    setEditSizes(product.sizes.join(", "));
    setEditStock(product.stock);
    setEditSizeChartUrl(product.sizeChartUrl || "");
    setEditSection(product.section || "");
    setEditCategory(product.category || "");
    setNewImageUrl("");
    setSaveStatus("idle");
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setEditImages([...editImages, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("PLEASE UPLOAD A VALID IMAGE (JPG, PNG).");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const max_size = 800; // Compress strongly for 1MB Firestore limit
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
            const base64String = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
            setEditImages([...editImages, base64String]);
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("PLEASE UPLOAD A VALID IMAGE (JPG, PNG).");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const max_size = 1200; // slightly larger max size for chart legibility
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
            const base64String = canvas.toDataURL('image/jpeg', 0.8);
            setEditSizeChartUrl(base64String);
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("PLEASE UPLOAD A VALID IMAGE (JPG, PNG).");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const max_size = 1600; // Large size for hero
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
            const base64String = canvas.toDataURL('image/jpeg', 0.8);
            updateSiteSettings({ heroImage: base64String });
          }
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImageUrl = (indexToRemove: number) => {
    setEditImages(editImages.filter((_, idx) => idx !== indexToRemove));
  };

  const openNewProductEditor = () => {
    const tempProduct: any = {
      id: "NEW_TEMP_ID",
      name: "",
      price: 0,
      images: [],
      sizes: ["S", "M", "L", "XL"],
      section: "",
      category: "",
      details: [],
    };
    setSelectedProductToEdit(tempProduct);
    setEditName("");
    setEditPrice(0);
    setEditImages([]);
    setEditSizes("S, M, L, XL");
    setEditStock(undefined);
    setEditSizeChartUrl("");
    setEditSection("");
    setEditCategory("");
    setNewImageUrl("");
    setSaveStatus("idle");
  };

  const handleSaveProductFields = async () => {
    if (!selectedProductToEdit) return;
    setSaveStatus("saving");

    try {
      if (selectedProductToEdit.id === "NEW_TEMP_ID") {
        await addProduct({
          name: editName || "UNTITLED",
          price: Number(editPrice),
          images: editImages,
          sizes: editSizes.split(",").map(s => s.trim()).filter(s => s !== ""),
          stock: editStock,
          sizeChartUrl: editSizeChartUrl,
          section: editSection.trim() || "UNASSIGNED",
          category: editCategory.trim() || "UNASSIGNED",
          details: []
        });
      } else {
        // Sync client state context and write to Firestore
        await updateProduct(selectedProductToEdit.id, {
          name: editName,
          price: Number(editPrice),
          images: editImages,
          sizes: editSizes.split(",").map(s => s.trim()).filter(s => s !== ""),
          stock: editStock,
          sizeChartUrl: editSizeChartUrl,
          section: editSection.trim(),
          category: editCategory.trim()
        });
      }

      setSaveStatus("success");
      setTimeout(() => {
        setSelectedProductToEdit(null);
        setSaveStatus("idle");
      }, 1500);
    } catch (err) {
      console.error("Failed to commit product updates: ", err);
      setSaveStatus("error");
    }
  };

  const handleAddNewProduct = () => {
    openNewProductEditor();
  };

  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to reset and sync all products to local storage default catalog?")) return;
    try {
      setSaveStatus("saving");
      const { PRODUCTS } = await import("../data");
      localStorage.setItem("nangsal_products", JSON.stringify(PRODUCTS));
      alert("Local catalog synced with core configuration successfully!");
      setSaveStatus("idle");
      window.location.reload();
    } catch(err) {
      console.error("Failed to reset database", err);
      setSaveStatus("error");
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaveStatus("saving");
      localStorage.setItem("nangsal_products", JSON.stringify(products));
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save products", error);
      setSaveStatus("error");
    }
  };

  const handleDeleteProduct = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSaveStatus("saving");
      await deleteProduct(product.id);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error("Failed to delete product", error);
      setSaveStatus("error");
    }
  };

  // Render Lock Screen if Unauthorized
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Group products by section
    const grouped: Record<string, Product[]> = {};
    products.forEach(p => {
      const sec = p.section.toUpperCase();
      if (!grouped[sec]) grouped[sec] = [];
      grouped[sec].push(p);
    });

    const sourceSection = source.droppableId;
    const destSection = destination.droppableId;

    if (!grouped[sourceSection]) grouped[sourceSection] = [];
    if (!grouped[destSection]) grouped[destSection] = [];

    const sourceList = grouped[sourceSection];
    const destList = grouped[destSection];

    if (sourceSection === destSection) {
      const [movedItem] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, movedItem);
    } else {
      const [movedItem] = sourceList.splice(source.index, 1);
      movedItem.section = destSection;
      movedItem.category = destSection; // Keep category in sync with section for simplicity in drag-n-drop
      destList.splice(destination.index, 0, movedItem);
    }
    
    // Flatten back into a single array
    const newProducts: Product[] = [];
    Object.values(grouped).forEach(list => newProducts.push(...list));

    // Immediately apply visual changes locally
    reorderProducts(newProducts);
  };

  if (!isAuthorized) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setAdminAuthError("");
      const inputEmail = adminUsername.trim().toLowerCase();
      const inputPass = adminPassword.trim();

      if (!inputEmail) {
        setAdminAuthError("PLEASE ENTER YOUR AUTHORIZED ADMIN EMAIL.");
        return;
      }

      const isAllowed = allowedAdminEmails.some(e => e.trim().toLowerCase() === inputEmail);
      if (!isAllowed) {
        setAdminAuthError(`ACCESS DENIED: ${inputEmail} is not authorized for Admin access.`);
        return;
      }

      if (inputPass === "sunil@123") {
        const localUser = {
          uid: `admin_${Date.now()}`,
          email: inputEmail,
          displayName: inputEmail.split("@")[0]
        };
        sessionStorage.setItem("nangsal_admin_logged_in", "true");
        localStorage.setItem("nangsal_local_user", JSON.stringify(localUser));
        setIsLoggedInAdmin(true);
      } else {
        setAdminAuthError("INVALID PASSWORD. ACCESS DENIED.");
      }
    };

    const handleGoogleAdminLogin = async () => {
      setGoogleLoginError("");
      setIsLoggingInGoogle(true);
      try {
        const res = await loginWithGoogle();
        if (res && res.error) {
          setGoogleLoginError(res.error);
        } else if (res && res.user && res.user.email) {
          const emailLower = res.user.email.toLowerCase();
          const isAllowed = allowedAdminEmails.some(e => e.trim().toLowerCase() === emailLower);
          if (!isAllowed) {
            setGoogleLoginError(`ACCESS DENIED: ${res.user.email} is not authorized for Admin access.`);
          }
        }
      } catch (err: any) {
        setGoogleLoginError(err.message || "Failed to sign in with Google.");
      } finally {
        setIsLoggingInGoogle(false);
      }
    };

    return (
      <div id="admin-lock-screen" className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center select-none text-black font-sans">
        <div className="w-16 h-16 bg-neutral-950 text-emerald-400 rounded-full flex items-center justify-center mb-8 shadow-md border border-emerald-500/30">
          <ShieldCheck size={28} />
        </div>
        
        <h2 className="text-xl font-mono tracking-[0.25em] text-center font-black uppercase mb-2">
          ADMIN ACCESS PANEL
        </h2>
        <p className="text-[10px] font-mono tracking-wider text-neutral-400 text-center uppercase max-w-sm mb-10 leading-relaxed">
          NANGSAL SECURITY TERMINAL. SIGN IN WITH GOOGLE OR ENTER AUTHORIZED ADMIN EMAIL & PASSWORD.
        </p>

        <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg space-y-6">
          {/* Primary Google Login Button */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase text-center">
              OPTION 1: GOOGLE LOGIN
            </label>

            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={isLoggingInGoogle}
              className="w-full bg-white text-black border border-neutral-300 hover:border-black text-xs font-mono font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isLoggingInGoogle ? "AUTHENTICATING GOOGLE..." : "SIGN IN WITH GOOGLE ADMIN"}</span>
            </button>

            {user?.email && !isGoogleUserAdmin && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2">
                <p className="text-[10px] font-mono text-rose-900 font-bold uppercase">
                  CURRENT GMAIL: <span className="underline">{user.email}</span>
                </p>
                <p className="text-[10px] font-mono text-rose-700 leading-tight">
                  This Gmail is NOT authorized for Admin access.
                </p>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-[10px] font-mono font-bold text-rose-900 underline hover:text-black cursor-pointer uppercase block pt-1"
                >
                  SIGN OUT & SWITCH GOOGLE ACCOUNT
                </button>
              </div>
            )}

            {googleLoginError && (
              <div className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center leading-relaxed">
                <p className="font-bold uppercase">{googleLoginError}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-neutral-200 flex-1"></div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">OR</span>
            <div className="h-px bg-neutral-200 flex-1"></div>
          </div>

          {/* Option 2: Email & Password Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <label className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase text-center mb-1">
              OPTION 2: EMAIL & PASSWORD LOGIN
            </label>

            <div>
              <label className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase mb-1.5">
                ADMIN EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                placeholder="e.g. yourgmail@gmail.com"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-xs font-extrabold tracking-widest py-3.5 rounded-lg uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <LogIn size={14} />
              <span>AUTHENTICATE ADMIN</span>
            </button>
          </form>

          {adminAuthError && (
            <div className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center font-bold uppercase">
              {adminAuthError}
            </div>
          )}

          <div className="text-[10px] font-mono text-center text-neutral-400 border-t border-neutral-100 pt-4 uppercase">
            PROTECTED BY GOOGLE OAUTH & ADMIN EMAIL SECURITY
          </div>
        </div>

        <button
          onClick={() => setActiveTab("SHOP")}
          className="mt-10 text-[10px] font-mono tracking-widest text-neutral-400 hover:text-black flex items-center gap-1 uppercase transition-colors"
        >
          <Undo size={12} />
          <span>RETURN TO STOREFRONT</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 py-10 select-none text-black">
      {/* Header Panel */}
      <div className="border border-neutral-200 rounded-2xl p-6 bg-neutral-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
              DECRYPT SHELL ONLINE
            </span>
          </div>
          <h2 className="text-lg font-mono font-black tracking-[0.2em] uppercase">
            NANGSAL CENTRAL TERMINAL
          </h2>
          <div className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-2 flex-wrap">
            <User size={10} />
            <span>OPERATOR: {user?.email ? `${user.email} (GOOGLE AUTH)` : "LOCAL TERMINAL ACCOUNT"}</span>
            <span>{"//"}</span>
            <span>LEVEL: ROOT_ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Sub Tab switchers */}
          <div className="bg-neutral-200 p-1 rounded-lg flex items-center gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveSubTab("PRODUCTS")}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === "PRODUCTS" 
                  ? "bg-white text-black shadow-sm" 
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              PRODUCTS MANAGER
            </button>
            <button
              onClick={() => setActiveSubTab("ORDERS")}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === "ORDERS" 
                  ? "bg-white text-black shadow-sm" 
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              ORDERS HISTORY ({orders.length})
            </button>
            <button
              onClick={() => setActiveSubTab("SETTINGS")}
              className={`flex-1 md:flex-none px-4 py-2 text-[10px] font-mono tracking-wider uppercase font-bold rounded-md transition-all cursor-pointer ${
                activeSubTab === "SETTINGS" 
                  ? "bg-white text-black shadow-sm" 
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              GLOBAL SETTINGS
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveAll}
              disabled={saveStatus === "saving"}
              title="Save Database"
              className="p-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveStatus === "saving" ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : saveStatus === "success" ? (
                <CheckCircle2 size={15} />
              ) : (
                <Save size={15} />
              )}
            </button>
            <button
              onClick={handlePasscodeLogout}
              title="Disconnect Terminal Session"
              className="p-2.5 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 1: PRODUCTS MANAGER */}
      {activeSubTab === "PRODUCTS" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <span className="text-[11px] font-mono tracking-widest text-[#767676] uppercase">
              ACTIVATE THE PRODUCT CARD FOR LIVE RECONFIGURING (SHP_VER_0.SS26)
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddNewProduct}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[9px] font-mono tracking-widest uppercase rounded hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus size={10} />
                ADD NEW
              </button>
              <button
                onClick={handleResetDatabase}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-1.5 px-3 py-1 bg-neutral-200 text-black border border-neutral-300 text-[9px] font-mono tracking-widest uppercase rounded hover:bg-neutral-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={10} className={saveStatus === "saving" ? "animate-spin" : ""} />
                SYNC CATALOG
              </button>
              <span className="text-[10px] font-mono font-bold tracking-widest text-black">
                SIZE: {products.length}
              </span>
            </div>
          </div>

          {/* Core Grid layout for catalog products display */}
          <DragDropContext onDragEnd={handleDragEnd}>
            {Array.from(new Set(products.map(p => p.section.toUpperCase()))).map((sectionName) => {
              const sectionProducts = products.filter(p => p.section.toUpperCase() === sectionName);
              
              return (
                <div key={sectionName} className="mb-12">
                  <div className="flex items-end justify-between border-b border-neutral-100 pb-5 mb-6">
                    <h2 className="text-lg md:text-xl font-bold tracking-[0.2em] text-neutral-800 uppercase">
                      {sectionName}
                    </h2>
                  </div>
                  <Droppable droppableId={sectionName} direction="horizontal">
                    {(provided) => (
                      <div 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-6 md:gap-y-12"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {sectionProducts.map((product, index) => (
                          // @ts-ignore
                          <Draggable key={product.id} draggableId={product.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border border-neutral-100 hover:border-black rounded-xl p-4.5 bg-white shadow-xs hover:shadow-md transition-all space-y-4 group relative flex flex-col ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-black z-50' : ''}`}
                              >
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleDeleteProduct(product, e)}
                                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur hover:bg-rose-50 border border-neutral-200 hover:border-rose-200 rounded-full flex items-center justify-center text-neutral-400 hover:text-rose-500 shadow-sm z-50 transition-all opacity-0 group-hover:opacity-100 pointer-events-auto cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>

                                <div className="flex-1 pointer-events-none -mb-8">
                                  <ProductCard product={product} isDragging={snapshot.isDragging} />
                                </div>

                                {/* Edit controller buttons */}
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openProductEditor(product);
                                  }}
                                  className="w-full mt-auto bg-neutral-950 text-white group-hover:bg-black py-2.5 rounded-lg text-[10px] font-mono tracking-widest font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-2 pointer-events-auto z-10 relative"
                                >
                                  <Settings size={12} className="group-hover:rotate-45 transition-transform" />
                                  <span>EDIT PRODUCT</span>
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </DragDropContext>
        </div>
      )}

      {/* SUB TAB 2: AUDITED ORDERS HISTORY */}
      {activeSubTab === "ORDERS" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Main Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b pb-4 mb-4 gap-4">
            <div>
              <h3 className="text-base font-black tracking-widest text-black uppercase flex items-center gap-2">
                <Layers size={18} />
                <span>INCOMING ORDERS & TRANSACTIONS LEDGER</span>
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mt-0.5">
                REAL-TIME AUDITED FLIGHT LOGS • FILTER BY PAYMENT VERIFICATION & LOCATION
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchOrdersFromBackend(false)}
                disabled={isLoadingOrders || isRefreshingOrders}
                className="text-[10px] font-mono font-bold tracking-widest bg-neutral-900 hover:bg-black text-white px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw size={12} className={`${(isLoadingOrders || isRefreshingOrders) ? 'animate-spin text-emerald-400' : ''}`} />
                <span>REFRESH FEED</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Control Toolbar */}
          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-3 font-mono text-[10px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Payment Status (Verified / Pending) */}
              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">
                  PAYMENT VERIFICATION
                </label>
                <div className="flex items-center gap-1 bg-white p-1 border border-neutral-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOrderPaymentFilter("ALL")}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                      orderPaymentFilter === "ALL" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    ALL ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderPaymentFilter("VERIFIED")}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-0.5 ${
                      orderPaymentFilter === "VERIFIED" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <CheckCircle2 size={10} />
                    <span>VERIFIED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderPaymentFilter("PENDING")}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-0.5 ${
                      orderPaymentFilter === "PENDING" ? "bg-amber-500 text-white" : "text-amber-800 hover:bg-amber-50"
                    }`}
                  >
                    <Clock size={10} />
                    <span>PENDING</span>
                  </button>
                </div>
              </div>

              {/* Filter 2: Location (Valley / Outside) */}
              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">
                  LOCATION REGION
                </label>
                <div className="flex items-center gap-1 bg-white p-1 border border-neutral-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOrderLocationFilter("ALL")}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                      orderLocationFilter === "ALL" ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    ALL REGIONS
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderLocationFilter("VALLEY")}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                      orderLocationFilter === "VALLEY" ? "bg-indigo-600 text-white" : "text-indigo-700 hover:bg-indigo-50"
                    }`}
                  >
                    IN VALLEY
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderLocationFilter("OUTSIDE")}
                    className={`flex-1 py-1 px-1.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                      orderLocationFilter === "OUTSIDE" ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    OUTSIDE
                  </button>
                </div>
              </div>

              {/* Filter 3: Order Progress Status */}
              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">
                  ORDER STATUS
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full bg-white border border-neutral-200 py-1.5 px-2.5 rounded-lg text-[10px] font-bold uppercase focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="ALL">ALL STATUSES</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Filter 4: Search Input */}
              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase block mb-1">
                  SEARCH ORDER / CUSTOMER
                </label>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Name, Phone, City, Order ID..."
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-[10px] focus:outline-none focus:border-black"
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Date Quick Filter Pills */}
            <div className="flex items-center justify-between border-t border-neutral-200/60 pt-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[9px] text-neutral-400 font-bold uppercase mr-1">TIME RANGE:</span>
                {["today", "3days", "7days", "1month", "lifetime"].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setOrderDateFilter(filter as any)}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded transition-colors cursor-pointer ${
                      orderDateFilter === filter ? "bg-black text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {filter === "lifetime" ? "ALL TIME" : filter.replace("days", " DAYS").replace("month", " 1 MONTH")}
                  </button>
                ))}
              </div>

              {(orderPaymentFilter !== "ALL" || orderLocationFilter !== "ALL" || orderStatusFilter !== "ALL" || orderSearchQuery || orderDateFilter !== "lifetime") && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderPaymentFilter("ALL");
                    setOrderLocationFilter("ALL");
                    setOrderStatusFilter("ALL");
                    setOrderSearchQuery("");
                    setOrderDateFilter("lifetime");
                  }}
                  className="text-[9px] font-bold text-rose-600 hover:underline uppercase shrink-0"
                >
                  RESET FILTERS
                </button>
              )}
            </div>
          </div>

          {ordersError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 font-mono text-xs mb-4">
              Error fetching orders: {ordersError}
            </div>
          )}

          {isLoadingOrders ? (
            <div className="text-center py-24 space-y-4">
              <RefreshCw size={18} className="animate-spin text-black mx-auto" />
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                DECRYPTING ENCRYPTED REMOTE FLIGHT RECORDS...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-dashed border-neutral-200 rounded-2xl py-24 text-center space-y-3">
              <AlertCircle size={24} className="text-neutral-300 mx-auto" />
              <p className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase font-black">
                NO REGISTERED ORDERS DETECTED
              </p>
              <p className="text-[9px] font-mono text-neutral-400 uppercase max-w-sm mx-auto leading-normal">
                THE LEDGER IS CURRENTLY BLANK. ORDERS PLACED ON THE FRONTEND BY GUESTS OR LOGGED-IN ACCOUNTS WILL AUTOMATICALLY SYNC AND APPEAR HERE IN REAL-TIME.
              </p>
            </div>
          ) : (() => {
            // Filter orders list
            const filteredOrders = orders.filter((o) => {
              if (orderDateFilter !== "lifetime") {
                let orderDate = new Date();
                if (o.createdAt) {
                  orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                }
                const diffTime = Math.abs(new Date().getTime() - orderDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (orderDateFilter === "today" && diffDays > 1) return false;
                if (orderDateFilter === "3days" && diffDays > 3) return false;
                if (orderDateFilter === "7days" && diffDays > 7) return false;
                if (orderDateFilter === "1month" && diffDays > 30) return false;
              }

              // Payment Status
              const isVerified = Boolean(
                o.paymentStatus === "VERIFIED" || 
                o.paymentVerified === true ||
                o.status === "DELIVERED" || 
                o.status === "SHIPPED"
              );
              if (orderPaymentFilter === "VERIFIED" && !isVerified) return false;
              if (orderPaymentFilter === "PENDING" && isVerified) return false;

              // Location Region
              const inValley = isInsideKathmanduValley(o.city || "", o.address || "");
              if (orderLocationFilter === "VALLEY" && !inValley) return false;
              if (orderLocationFilter === "OUTSIDE" && inValley) return false;

              // Order Status
              if (orderStatusFilter !== "ALL" && (o.status || "PENDING") !== orderStatusFilter) return false;

              // Search query
              if (orderSearchQuery.trim()) {
                const q = orderSearchQuery.toLowerCase().trim();
                const match = 
                  (o.id && o.id.toLowerCase().includes(q)) ||
                  (o.name && o.name.toLowerCase().includes(q)) ||
                  (o.phone && o.phone.toLowerCase().includes(q)) ||
                  (o.city && o.city.toLowerCase().includes(q)) ||
                  (o.address && o.address.toLowerCase().includes(q));
                if (!match) return false;
              }

              return true;
            });

            if (filteredOrders.length === 0) {
              return (
                <div className="border border-dashed border-neutral-200 rounded-2xl py-16 text-center space-y-2 font-mono">
                  <p className="text-[11px] tracking-widest text-neutral-500 uppercase font-black">
                    NO ORDERS MATCHED YOUR FILTERS
                  </p>
                  <p className="text-[9px] text-neutral-400 uppercase">
                    TRY CHANGING PAYMENT STATUS, LOCATION, OR SEARCH KEYWORDS
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderPaymentFilter("ALL");
                      setOrderLocationFilter("ALL");
                      setOrderStatusFilter("ALL");
                      setOrderSearchQuery("");
                      setOrderDateFilter("lifetime");
                    }}
                    className="mt-2 bg-black text-white px-3 py-1.5 rounded text-[9px] font-bold uppercase cursor-pointer"
                  >
                    CLEAR ALL FILTERS
                  </button>
                </div>
              );
            }

            return (
              <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs">
                {/* Clean Table Layout */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-neutral-900 text-white text-[9px] tracking-widest uppercase font-bold border-b border-neutral-800">
                        <th className="py-3 px-3">ORDER ID / DATE</th>
                        <th className="py-3 px-3">CUSTOMER</th>
                        <th className="py-3 px-3">LOCATION & REGION</th>
                        <th className="py-3 px-3 text-center">ITEMS</th>
                        <th className="py-3 px-3 text-right">TOTAL</th>
                        <th className="py-3 px-3 text-center">PAYMENT VERIFICATION</th>
                        <th className="py-3 px-3 text-center">ORDER STATUS</th>
                        <th className="py-3 px-3 text-center">DETAILS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-150">
                      {filteredOrders.map((order, orderIdx) => {
                        const dateString = order.createdAt 
                          ? (order.createdAt.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString())
                          : "GUEST SYSTEM TIME";

                        const orderId = order.id || `G${orderIdx}`;
                        const isExpanded = expandedOrders.includes(orderId);

                        const inValley = isInsideKathmanduValley(order.city || "", order.address || "");
                        const isPaymentVerified = Boolean(
                          order.paymentStatus === "VERIFIED" || 
                          order.paymentVerified === true ||
                          order.status === "DELIVERED" || 
                          order.status === "SHIPPED"
                        );

                        const paymentSS = order.paymentScreenshotUrl || order.paymentScreenshotBase64 || order.paymentScreenshot;

                        return (
                          <React.Fragment key={orderId}>
                            <tr className={`hover:bg-neutral-50/80 transition-colors ${isExpanded ? "bg-neutral-50/90 font-bold" : ""}`}>
                              {/* Order ID & Date */}
                              <td className="py-3 px-3 align-top whitespace-nowrap">
                                <span className="font-extrabold text-black text-[11px] block">
                                  #{order.id ? order.id.slice(4) : `G${orderIdx}`}
                                </span>
                                <span className="text-[9px] text-neutral-400 font-normal block mt-0.5">
                                  {dateString}
                                </span>
                              </td>

                              {/* Customer */}
                              <td className="py-3 px-3 align-top">
                                <span className="font-extrabold text-black uppercase block text-[11px]">
                                  {order.name || "GUEST CUSTOMER"}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] text-neutral-600 font-bold flex items-center gap-0.5">
                                    <Phone size={10} className="text-neutral-400" />
                                    {order.phone}
                                  </span>
                                  <a 
                                    href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[8px] font-bold bg-[#25D366] text-white px-1.5 py-0.2 rounded hover:bg-emerald-600 uppercase"
                                    title="Open WhatsApp"
                                  >
                                    WA
                                  </a>
                                </div>
                              </td>

                              {/* Location & Region */}
                              <td className="py-3 px-3 align-top">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                    inValley ? "bg-indigo-100 text-indigo-900 border border-indigo-200" : "bg-purple-100 text-purple-900 border border-purple-200"
                                  }`}>
                                    {inValley ? "INSIDE VALLEY (RS. 100)" : "OUTSIDE VALLEY"}
                                  </span>
                                </div>
                                <p className="text-[10px] font-semibold text-neutral-800 uppercase mt-1 truncate max-w-[180px]" title={order.address || order.city}>
                                  {order.city ? `${order.city} - ` : ""}{order.address || "NO ADDRESS"}
                                </p>
                              </td>

                              {/* Items Summary */}
                              <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                                <span className="inline-block bg-neutral-100 text-black font-extrabold px-2 py-0.5 rounded text-[10px] border border-neutral-200">
                                  {order.items?.length || 0} ITEM(S)
                                </span>
                              </td>

                              {/* Total Amount */}
                              <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                                <span className="font-black text-black text-sm block">
                                  {formatPrice(order.totalAmount)}
                                </span>
                                <span className="text-[9px] text-neutral-400 font-semibold uppercase block">
                                  {order.paymentMethod === "esewa" ? "eSEWA QR" : order.paymentMethod === "bank" ? "BANK QR" : "COD"}
                                </span>
                              </td>

                              {/* Payment Verification Status Toggle */}
                              <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={updatingOrderId === order.id}
                                    onClick={() => updatePaymentStatus(order.id, isPaymentVerified ? "PENDING" : "VERIFIED")}
                                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border shadow-2xs ${
                                      isPaymentVerified 
                                        ? "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200" 
                                        : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 animate-pulse"
                                    }`}
                                    title="Click to toggle Payment Status"
                                  >
                                    {isPaymentVerified ? (
                                      <>
                                        <CheckCircle2 size={11} className="text-emerald-700" />
                                        <span>PAYMENT VERIFIED</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock size={11} className="text-amber-700" />
                                        <span>VERIFICATION PENDING</span>
                                      </>
                                    )}
                                  </button>

                                  {paymentSS && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedScreenshotModal(paymentSS)}
                                      className="text-[8px] font-bold text-neutral-600 hover:text-black underline uppercase flex items-center gap-0.5 cursor-pointer mt-0.5"
                                    >
                                      <ImageIcon size={9} />
                                      <span>VIEW SS</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Order Status Select */}
                              <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                                <select
                                  value={order.status || "PENDING"}
                                  disabled={updatingOrderId === order.id}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  className="bg-white border border-neutral-300 text-[10px] font-bold uppercase px-2 py-1 rounded focus:outline-none focus:border-black cursor-pointer shadow-2xs"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>

                              {/* Expand/Collapse Button */}
                              <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => toggleExpandedOrder(orderId)}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isExpanded ? "bg-black text-white border-black" : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                                  }`}
                                  title={isExpanded ? "Collapse Details" : "Expand Details"}
                                >
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Order Drawer Row */}
                            {isExpanded && (
                              <tr className="bg-neutral-50/80">
                                <td colSpan={8} className="p-4 border-t border-b border-neutral-200">
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Column 1: CUSTOMER & PLACE DETAILS */}
                                    <div className="space-y-3 lg:border-r border-neutral-200 lg:pr-5">
                                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 font-extrabold uppercase pb-1 border-b border-neutral-200">
                                        <span className="flex items-center gap-1.5"><User size={12} /> CUSTOMER & ADDRESS DETAILS</span>
                                        {order.city && (
                                          <span className="bg-neutral-200 text-black px-1.5 py-0.5 rounded text-[9px] font-bold">
                                            {order.city}
                                          </span>
                                        )}
                                      </div>

                                      <div className="space-y-2 bg-white p-3 rounded-lg border border-neutral-200 shadow-2xs">
                                        <div>
                                          <span className="text-[9px] font-mono text-neutral-400 uppercase block font-bold">FULL NAME</span>
                                          <p className="text-sm font-mono font-black text-black uppercase leading-tight">
                                            {order.name}
                                          </p>
                                        </div>

                                        <div>
                                          <span className="text-[9px] font-mono text-neutral-400 uppercase block font-bold">PHONE NUMBER</span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs font-mono font-bold text-black flex items-center gap-1">
                                              <Phone size={12} className="text-neutral-500" />
                                              {order.phone}
                                            </p>
                                            <a 
                                              href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, "")}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[9px] font-mono font-bold bg-[#25D366] text-white px-2 py-0.5 rounded hover:bg-emerald-600 transition-colors uppercase inline-flex items-center gap-1"
                                            >
                                              WhatsApp
                                            </a>
                                            <a 
                                              href={`tel:${order.phone}`}
                                              className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors uppercase"
                                            >
                                              Call
                                            </a>
                                          </div>
                                        </div>

                                        <div>
                                          <span className="text-[9px] font-mono text-neutral-400 uppercase block font-bold">FULL DELIVERY ADDRESS</span>
                                          <p className="text-xs font-mono text-neutral-800 uppercase font-semibold mt-0.5 leading-relaxed bg-neutral-50 p-2 border border-neutral-200 rounded">
                                            {order.address || "NO ADDRESS SPECIFIED"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 2: ORDERED ITEMS & SIZING */}
                                    <div className="space-y-3 lg:border-r border-neutral-200 lg:px-5">
                                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 font-extrabold uppercase pb-1 border-b border-neutral-200">
                                        <span className="flex items-center gap-1.5"><Layers size={12} /> ORDERED ITEMS ({order.items?.length || 0})</span>
                                        <span className="text-[9px] text-neutral-400">SIZES & MEASUREMENTS</span>
                                      </div>

                                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                                        {order.items?.map((item: any, itemIdx: number) => {
                                          const hasHW = Boolean(item.userHeight || item.userWeight);
                                          const isCustom = item.selectedSize?.toUpperCase().includes("CUSTOM") || hasHW;
                                          
                                          let displaySize = item.selectedSize || "";
                                          if (hasHW && !displaySize.includes(item.userHeight || "") && !displaySize.includes(item.userWeight || "")) {
                                            const hwText = `(HT: ${item.userHeight || '-'}, WT: ${item.userWeight || '-'})`;
                                            if (!displaySize || displaySize === "N/A" || displaySize.toUpperCase() === "CUSTOM") {
                                              displaySize = `CUSTOM ${hwText}`;
                                            } else {
                                              displaySize = `${displaySize} ${hwText}`;
                                            }
                                          }
                                          if (!displaySize) displaySize = "N/A";

                                          return (
                                            <div key={itemIdx} className="bg-white p-3 rounded-lg border border-neutral-200 space-y-2 shadow-2xs">
                                              <div className="flex items-start gap-3">
                                                {item.image && (
                                                  <div 
                                                    onClick={() => setSelectedScreenshotModal(item.image)}
                                                    className="w-12 h-14 bg-white border border-neutral-200 rounded p-1 flex items-center justify-center shrink-0 cursor-pointer hover:border-black transition-colors relative group"
                                                    title="Click to view full image"
                                                  >
                                                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] font-mono font-bold text-white uppercase rounded">
                                                      VIEW
                                                    </div>
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0 text-left">
                                                  <p className="text-xs font-mono font-bold text-black uppercase truncate">
                                                    {item.name}
                                                  </p>
                                                  <p className="text-[10px] font-mono text-neutral-500 uppercase mt-0.5">
                                                    QTY: {item.quantity} × {formatPrice(item.price)}
                                                  </p>
                                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase ${
                                                      isCustom ? "bg-amber-100 text-amber-900 border-amber-300 font-bold" : "bg-neutral-100 text-black border-neutral-200"
                                                    }`}>
                                                      SIZE: {displaySize}
                                                    </span>
                                                  </div>
                                                </div>
                                                <span className="text-xs font-mono font-extrabold text-black shrink-0">
                                                  {formatPrice(item.price * item.quantity)}
                                                </span>
                                              </div>

                                              {/* Custom Height & Weight Measurement Box */}
                                              {(hasHW || isCustom) && (
                                                <div className="bg-amber-50 border border-amber-300 p-2 rounded text-[10px] font-mono text-amber-950 uppercase font-black flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                  <span className="flex items-center gap-1 text-amber-900">
                                                    📐 CUSTOM MEASUREMENTS:
                                                  </span>
                                                  <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[10px] text-amber-950 font-black">
                                                    {item.userHeight ? `HEIGHT: ${item.userHeight}` : "HT: -"} • {item.userWeight ? `WEIGHT: ${item.userWeight}` : "WT: -"}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Column 3: FINANCIAL & PAYMENT SCREENSHOT */}
                                    <div className="space-y-3 lg:pl-5 flex flex-col justify-between">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 font-extrabold uppercase pb-1 border-b border-neutral-200">
                                          <span className="flex items-center gap-1.5"><Calendar size={12} /> PAYMENT BREAKDOWN</span>
                                          <span className="text-[9px] text-neutral-400">{dateString}</span>
                                        </div>

                                        {/* Financial Breakdown */}
                                        <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1.5 text-xs font-mono shadow-2xs">
                                          {order.subtotal && (
                                            <div className="flex justify-between text-neutral-600 text-[10px]">
                                              <span>ITEMS SUBTOTAL:</span>
                                              <span className="font-bold">{formatPrice(order.subtotal)}</span>
                                            </div>
                                          )}
                                          {order.deliveryCharge !== undefined && (
                                            <div className="flex justify-between text-neutral-600 text-[10px]">
                                              <span>DELIVERY CHARGE:</span>
                                              <span className="font-bold">{formatPrice(order.deliveryCharge)}</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between text-black font-black text-sm pt-1.5 border-t border-neutral-200">
                                            <span>TOTAL AMOUNT:</span>
                                            <span className="text-emerald-700">{formatPrice(order.totalAmount)}</span>
                                          </div>

                                          {order.paymentMethod === "cod" && (
                                            <div className="mt-2 bg-yellow-50 border border-yellow-200 p-2 rounded text-[10px] text-yellow-900 font-bold uppercase space-y-1">
                                              <p className="text-emerald-700">✓ ADVANCE DELIVERY FEE PAID: {formatPrice(order.deliveryCharge || 100)}</p>
                                              <p className="text-black">💵 CASH TO COLLECT ON DELIVERY: {formatPrice((order.subtotal || order.totalAmount - (order.deliveryCharge || 0)))}</p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Payment Screenshot (SS) Viewer */}
                                        {paymentSS ? (
                                          <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-2 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-mono font-black text-emerald-700 flex items-center gap-1 uppercase">
                                                <CheckCircle2 size={13} /> PAYMENT SCREENSHOT (SS)
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => setSelectedScreenshotModal(paymentSS)}
                                                className="bg-black hover:bg-neutral-800 text-white px-2 py-1 rounded text-[9px] font-mono font-bold uppercase cursor-pointer transition-colors"
                                              >
                                                ENLARGE SS
                                              </button>
                                            </div>
                                            <div 
                                              onClick={() => setSelectedScreenshotModal(paymentSS)}
                                              className="w-full h-32 bg-neutral-50 border border-neutral-200 rounded flex items-center justify-center overflow-hidden cursor-pointer group relative hover:border-black transition-colors"
                                            >
                                              <img 
                                                src={paymentSS} 
                                                alt="Payment Screenshot" 
                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                              />
                                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono font-bold uppercase">
                                                🔍 ENLARGE
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="bg-neutral-100 p-3 rounded border border-neutral-200 text-center text-[10px] font-mono text-neutral-500 uppercase">
                                            NO PAYMENT SCREENSHOT ATTACHED
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUB TAB 3: SETTINGS */}
      {activeSubTab === "SETTINGS" && (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <span className="text-[11px] font-mono tracking-widest text-[#767676] uppercase">
              GLOBAL SYSTEM PARAMETERS & DYNAMIC MEDIA (NANGSAL_V1)
            </span>
            <button
              onClick={handleSaveAll}
              disabled={saveStatus === "saving"}
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-[10px] font-mono tracking-widest font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : saveStatus === "success" ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>SAVED!</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>SAVE SETTINGS</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-8">
            {/* 1. HERO BANNER */}
            <div className="space-y-3 text-left border-b border-neutral-100 pb-6">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase">
                1. HERO LANDING BANNER & COUNTDOWN
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                  HERO BANNER IMAGE URL / UPLOAD
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.heroImage || ""}
                    onChange={(e) => updateSiteSettings({ heroImage: e.target.value })}
                    className="flex-1 border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black focus:bg-white rounded-lg"
                    placeholder="https://..."
                  />
                  <label className="bg-neutral-100 hover:bg-neutral-200 text-black px-4 py-2.5 text-[10px] font-mono tracking-widest uppercase cursor-pointer rounded-lg border border-neutral-200 font-bold flex items-center justify-center shrink-0">
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                    <span>UPLOAD</span>
                  </label>
                </div>
                {siteSettings.heroImage && (
                  <div className="aspect-[16/9] bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 mt-2 max-h-48">
                    <img src={siteSettings.heroImage} alt="Hero Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                  DROP COUNTDOWN TARGET DATE
                </label>
                <input
                  type="datetime-local"
                  value={(() => {
                    try {
                      if (!siteSettings.targetDate) return "";
                      const d = new Date(siteSettings.targetDate);
                      if (isNaN(d.getTime())) return "";
                      const pad = (n: number) => String(n).padStart(2, "0");
                      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    } catch (e) {
                      return "";
                    }
                  })()}
                  onChange={(e) => {
                    if (e.target.value) {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        updateSiteSettings({ targetDate: newDate.toISOString() });
                      }
                    }
                  }}
                  className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black focus:bg-white rounded-lg uppercase"
                />
              </div>
            </div>

            {/* 2. ABOUT BRAND MEDIA */}
            <div className="space-y-3 text-left border-b border-neutral-100 pb-6">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase">
                2. ABOUT BRAND SECTION MEDIA
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                  "MORE THAN CLOTHES" BANNER IMAGE URL
                </label>
                <input
                  type="text"
                  value={siteSettings.aboutBrandImage || ""}
                  onChange={(e) => updateSiteSettings({ aboutBrandImage: e.target.value })}
                  className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black focus:bg-white rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                  BRAND BACKGROUND VIDEO URL (.MP4)
                </label>
                <input
                  type="text"
                  value={siteSettings.aboutBrandVideo || ""}
                  onChange={(e) => updateSiteSettings({ aboutBrandVideo: e.target.value })}
                  className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black focus:bg-white rounded-lg"
                  placeholder="https://...mp4"
                />
              </div>
            </div>

            {/* 3. PAYMENT GATEWAYS */}
            <div className="space-y-4 text-left border-b border-neutral-100 pb-6">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase">
                3. PAYMENT GATEWAY QRS & ACCOUNTS
              </h3>

              {/* Bank Transfer Details */}
              <div className="space-y-2 p-3 bg-neutral-50 border border-neutral-150 rounded-lg">
                <span className="text-[10px] font-mono font-extrabold text-black uppercase block">
                  BANK TRANSFER DETAILS
                </span>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block">ACCOUNT HOLDER / BANK NAME</label>
                  <input
                    type="text"
                    value={siteSettings.bankAccountName || ""}
                    onChange={(e) => updateSiteSettings({ bankAccountName: e.target.value })}
                    className="w-full border border-neutral-200 bg-white px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="E.G. NANGSAL APPAREL (PRABHU BANK)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block">BANK QR CODE IMAGE URL</label>
                  <input
                    type="text"
                    value={siteSettings.bankQrImage || ""}
                    onChange={(e) => updateSiteSettings({ bankQrImage: e.target.value })}
                    className="w-full border border-neutral-200 bg-white px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* eSewa Details */}
              <div className="space-y-2 p-3 bg-neutral-50 border border-neutral-150 rounded-lg">
                <span className="text-[10px] font-mono font-extrabold text-black uppercase block">
                  ESEWA DIGITAL WALLET DETAILS
                </span>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block">ESEWA ACCOUNT HOLDER NAME</label>
                  <input
                    type="text"
                    value={siteSettings.esewaHolderName || ""}
                    onChange={(e) => updateSiteSettings({ esewaHolderName: e.target.value })}
                    className="w-full border border-neutral-200 bg-white px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="E.G. NANGSAL APPAREL"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block">ESEWA QR CODE IMAGE URL</label>
                  <input
                    type="text"
                    value={siteSettings.esewaQrImage || ""}
                    onChange={(e) => updateSiteSettings({ esewaQrImage: e.target.value })}
                    className="w-full border border-neutral-200 bg-white px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* 4. SOCIAL LINKS & WHATSAPP */}
            <div className="space-y-3 text-left border-b border-neutral-100 pb-6">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase">
                4. CONTACT & SOCIAL CHANNELS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block font-bold">WHATSAPP NUMBER</label>
                  <input
                    type="text"
                    value={siteSettings.whatsappNumber || ""}
                    onChange={(e) => updateSiteSettings({ whatsappNumber: e.target.value })}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="+977 984-7459808"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block font-bold">INSTAGRAM URL</label>
                  <input
                    type="text"
                    value={siteSettings.instagramUrl || ""}
                    onChange={(e) => updateSiteSettings({ instagramUrl: e.target.value })}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-500 uppercase block font-bold">TIKTOK URL</label>
                  <input
                    type="text"
                    value={siteSettings.tiktokUrl || ""}
                    onChange={(e) => updateSiteSettings({ tiktokUrl: e.target.value })}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-black rounded-md"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
            </div>

            {/* 5. DELIVERY & PROMO CODES */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase">
                5. LOGISTICS & PROMO DISCOUNTS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                    DELIVERY (INSIDE KTM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] font-mono font-bold uppercase">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={siteSettings.deliveryInsideKtm || 0}
                      onChange={(e) => updateSiteSettings({ deliveryInsideKtm: Math.max(0, Number(e.target.value)) })}
                      className="w-full border border-neutral-200 bg-neutral-50 px-3 pl-12 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                    DELIVERY (OUTSIDE KTM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] font-mono font-bold uppercase">
                      Rs.
                    </span>
                    <input
                      type="number"
                      value={siteSettings.deliveryOutsideKtm || 0}
                      onChange={(e) => updateSiteSettings({ deliveryOutsideKtm: Math.max(0, Number(e.target.value)) })}
                      className="w-full border border-neutral-200 bg-neutral-50 px-3 pl-12 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                    PROMO CODE
                  </label>
                  <input
                    type="text"
                    value={siteSettings.promoCode || ""}
                    onChange={(e) => updateSiteSettings({ promoCode: e.target.value.toUpperCase() })}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black rounded-lg"
                    placeholder="E.G. NANGSAL5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                    DISCOUNT PERCENTAGE
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[10px] font-mono font-bold uppercase">
                      %
                    </span>
                    <input
                      type="number"
                      value={siteSettings.promoDiscountPercent || 0}
                      onChange={(e) => updateSiteSettings({ promoDiscountPercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-full border border-neutral-200 bg-neutral-50 px-3 pl-10 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 6. CUSTOM TERMS & CONDITIONS */}
            <div className="space-y-3 text-left pt-2 border-t border-neutral-100">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase">
                6. CUSTOM TERMS & CONDITIONS POLICY
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest font-bold text-neutral-500 uppercase block">
                  CUSTOM TERMS TEXT (LEAVE BLANK TO USE DEFAULT NANGSAL STORE POLICIES)
                </label>
                <textarea
                  rows={6}
                  value={siteSettings.customTerms || ""}
                  onChange={(e) => updateSiteSettings({ customTerms: e.target.value })}
                  className="w-full border border-neutral-200 bg-neutral-50 p-3 text-[10px] font-mono focus:outline-none focus:border-black rounded-lg leading-relaxed"
                  placeholder="Enter custom Terms & Conditions text..."
                />
              </div>
            </div>

            {/* 6. AUTHORIZED ADMIN GMAIL LIST */}
            <div className="space-y-3 text-left pt-2 border-t border-neutral-100">
              <h3 className="text-xs font-mono font-black tracking-widest text-black uppercase flex items-center justify-between">
                <span>6. AUTHORIZED ADMIN GMAIL ADDRESSES</span>
                <span className="text-[9px] font-mono text-neutral-400 font-normal">ONLY LISTED GMAILS CAN OPEN ADMIN PANEL</span>
              </h3>
              
              <div className="space-y-2">
                {allowedAdminEmails.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-neutral-50 border border-neutral-200 px-3.5 py-2.5 rounded-lg text-xs font-mono">
                    <span className="font-bold text-neutral-800">{email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = allowedAdminEmails.filter((_, i) => i !== idx);
                        updateSiteSettings({ allowedAdminEmails: updated });
                      }}
                      className="text-rose-500 hover:text-rose-700 text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <input
                    type="email"
                    placeholder="ENTER NEW ADMIN GMAIL (e.g. yourgmail@gmail.com)"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="flex-1 border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-black rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAdminEmail.trim()) {
                        const formatted = newAdminEmail.trim().toLowerCase();
                        if (!allowedAdminEmails.map(e => e.toLowerCase()).includes(formatted)) {
                          const updated = [...allowedAdminEmails, formatted];
                          updateSiteSettings({ allowedAdminEmails: updated });
                          setNewAdminEmail("");
                        }
                      }
                    }}
                    className="bg-black text-white text-[10px] font-mono font-bold px-5 py-2.5 rounded-lg hover:bg-neutral-800 uppercase cursor-pointer transition-colors shrink-0"
                  >
                    ADD GMAIL
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={handleSaveAll}
                disabled={saveStatus === "saving"}
                className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white text-[11px] font-mono tracking-widest font-black uppercase rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {saveStatus === "saving" ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>SAVING ALL SETTINGS...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>SAVE ALL GLOBAL SETTINGS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG POPUP */}
      <AnimatePresence>
        {selectedProductToEdit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto max-w-2xl w-full p-6 md:p-8 space-y-6 text-black shadow-2xl relative select-text"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                    SYSTEM RECONFIGURING MODULE
                  </span>
                  <h3 className="text-xs font-mono font-black tracking-wider uppercase text-neutral-800 line-clamp-1">
                    EDIT: {selectedProductToEdit.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProductToEdit(null)}
                  className="p-1 px-2 text-[10px] font-mono hover:bg-neutral-100 rounded-md cursor-pointer transition-colors"
                >
                  [CLOSE X]
                </button>
              </div>

              {/* Name section input details */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest font-extrabold text-neutral-500 uppercase block">
                  PRODUCT NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black focus:bg-white rounded-lg"
                  />
                </div>
              </div>

              {/* Price section input details */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest font-extrabold text-neutral-500 uppercase block">
                  BASE PRODUCT PRICE (IN NEPALESE RUPEES - Rate convert calculations applies on other currencies)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 pl-12 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black focus:bg-white rounded-lg"
                  />
                </div>
                <p className="text-[9px] font-mono text-neutral-400 uppercase">
                  ENTER BASE VALUE IN NPR. CURRENT USD EQUIVALENT TO FRONTEND VIEWERS: <span className="text-neutral-700 font-bold">{formatPrice(editPrice)}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full block"></span>
                    SECTION (E.G. VESTS)
                  </label>
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value.toUpperCase())}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black focus:bg-white rounded-lg"
                    placeholder="e.g. VESTS"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full block"></span>
                    CATEGORY (E.G. VESTS)
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value.toUpperCase())}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black focus:bg-white rounded-lg"
                    placeholder="e.g. VESTS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full block"></span>
                    AVAILABLE SIZES (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={editSizes}
                    onChange={(e) => setEditSizes(e.target.value)}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black focus:bg-white rounded-lg"
                    placeholder="e.g. 1 (S-M), 2 (L-XL)"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full block"></span>
                    TOTAL STOCK QUANTITY (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    value={editStock === undefined ? "" : editStock}
                    onChange={(e) => setEditStock(e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)))}
                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-mono font-bold uppercase focus:outline-none focus:border-black focus:bg-white rounded-lg"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full block"></span>
                  SIZE CHART IMAGE URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editSizeChartUrl}
                    onChange={(e) => setEditSizeChartUrl(e.target.value)}
                    className="flex-1 border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs font-mono font-bold focus:outline-none focus:border-black focus:bg-white rounded-lg"
                    placeholder="https://..."
                  />
                  <label className="shrink-0 bg-neutral-100 hover:bg-neutral-200 text-black px-4 py-3 text-[10px] font-mono tracking-widest uppercase transition-colors cursor-pointer rounded-lg border border-neutral-200 font-bold flex items-center justify-center">
                    <input type="file" accept="image/*" onChange={handleSizeChartUpload} className="hidden" />
                    <span>UPLOAD</span>
                  </label>
                </div>
              </div>

              {/* Multi-view images editor controller lists */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-widest font-extrabold text-neutral-500 uppercase block">
                  RESOURCE IMAGE REVISIONS
                </label>

                {/* Previews grid thumbnail strips */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {editImages.map((imgUrl, imgIdx) => (
                    <div 
                      key={imgIdx} 
                      className="aspect-square bg-neutral-100 rounded-lg relative overflow-hidden group/thumb border border-neutral-100"
                    >
                      <img
                        src={imgUrl}
                        alt="Product preview thumbnail edit"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => handleRemoveImageUrl(imgIdx)}
                        className="absolute inset-0 bg-red-600/80 hover:bg-red-700/90 text-white font-mono text-[9px] font-bold tracking-widest flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer uppercase"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {editImages.length === 0 && (
                    <div className="col-span-full border border-dashed text-center py-6 text-[10px] font-mono text-neutral-400 uppercase">
                      NO RESOURCE IMAGES SAVED. PLEASE ATTACH AT LEAST ONE VIEW URL.
                    </div>
                  )}
                </div>

                {/* Adding dynamic new image URLs */}
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="PASTE WEB-ACCESSIBLE IMAGE URL LINK HERE"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[10px] font-mono focus:outline-none focus:border-black focus:bg-white rounded-lg"
                  />
                  <button
                    onClick={handleAddImageUrl}
                    className="bg-neutral-900 hover:bg-black text-[10px] text-white px-4.5 font-mono tracking-widest font-extrabold uppercase rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>ADD</span>
                  </button>
                  <label className="bg-neutral-100 hover:bg-neutral-200 text-[10px] text-neutral-600 border border-neutral-200 px-4.5 font-mono tracking-widest font-extrabold uppercase rounded-lg cursor-pointer flex items-center gap-1 transition-colors">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <span>UPLOAD</span>
                  </label>
                </div>
              </div>

              {/* Sync and close action controls */}
              <div className="pt-2 border-t flex flex-col sm:flex-row items-center justify-end gap-3">
                {saveStatus === "success" && (
                  <p className="text-[10px] font-mono text-emerald-600 uppercase flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-md self-stretch sm:self-auto text-center font-bold">
                    <CheckCircle2 size={12} />
                    <span>UPDATED SUCCESSFULLY! APPLYING CHANGES IN THE CLOUD FEED...</span>
                  </p>
                )}
                {saveStatus === "error" && (
                  <p className="text-[10px] font-mono text-rose-500 uppercase flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-md self-stretch sm:self-auto text-center font-bold">
                    <AlertCircle size={12} />
                    <span>WRITE FAILURE ENCOUNTERED. CHECK RULES AUTHENTICATOR.</span>
                  </p>
                )}

                <div className="flex w-full sm:w-auto gap-3">
                  <button
                    onClick={() => setSelectedProductToEdit(null)}
                    disabled={saveStatus === "saving"}
                    className="flex-1 sm:flex-initial border border-neutral-200 hover:bg-neutral-50 text-[10px] font-mono font-bold tracking-widest py-3 px-5 rounded-lg uppercase cursor-pointer transition-colors disabled:opacity-50"
                  >
                    DISCARD
                  </button>
                  <button
                    onClick={handleSaveProductFields}
                    disabled={saveStatus === "saving" || editImages.length === 0}
                    className="flex-1 sm:flex-initial bg-black hover:bg-neutral-800 text-[10px] text-white font-mono tracking-widest font-extrabold py-3 px-6 rounded-lg uppercase cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <span>COMMIT CHANGES</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Payment Screenshot & Image Modal */}
      {selectedScreenshotModal && (
        <div 
          onClick={() => setSelectedScreenshotModal(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 flex flex-col items-center shadow-2xl cursor-default"
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-neutral-800 text-white font-mono text-xs font-bold uppercase mb-3">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                VERIFY IMAGE / PAYMENT SCREENSHOT (SS)
              </span>
              <button 
                onClick={() => setSelectedScreenshotModal(null)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white p-1.5 rounded cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center max-h-[72vh] w-full bg-black/60 p-2 rounded border border-neutral-800">
              <img 
                src={selectedScreenshotModal} 
                alt="Enlarged Payment Screenshot" 
                className="max-h-full max-w-full object-contain rounded shadow-lg"
              />
            </div>
            <div className="w-full pt-3 mt-2 border-t border-neutral-800 flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] text-neutral-400 uppercase hidden sm:inline">
                Click anywhere outside or hit Close to exit
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <a
                  href={selectedScreenshotModal}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  OPEN ORIGINAL IN NEW TAB
                </a>
                <button
                  onClick={() => setSelectedScreenshotModal(null)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded font-bold uppercase transition-colors cursor-pointer"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
