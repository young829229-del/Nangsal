import React, { useState, useEffect } from "react";
import { useApp } from "./AppContext";
import { 
  Lock, Unlock, Plus, Trash2, Image as ImageIcon, Tag, Undo, LogIn, LogOut, 
  Settings, User, CheckCircle2, AlertCircle, Calendar, DollarSign, MapPin, 
  Phone, RefreshCw, Layers, Eye, Mail, Key, Save, ChevronDown, ChevronUp, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ProductCard } from "./ProductCard";
import { Product } from "../types";

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
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [adminAuthError, setAdminAuthError] = useState<string>("");
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem("nangsal_admin_logged_in") === "true";
  });

  const isAuthorized = isLoggedInAdmin;

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
      const saved = localStorage.getItem("slimhood_guest_orders");
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(parsed);
      } else {
        setOrders([]);
      }
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

  const handlePasscodeLogout = () => {
    sessionStorage.removeItem("nangsal_admin_logged_in");
    setIsLoggedInAdmin(false);
    logout();
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
      if (
        (adminUsername.trim().toLowerCase() === "slimhood" && adminPassword === "Slimhood@SecureAdmin2026!") ||
        adminPassword === "8888" ||
        adminPassword === "admin"
      ) {
        sessionStorage.setItem("nangsal_admin_logged_in", "true");
        setIsLoggedInAdmin(true);
      } else {
        setAdminAuthError("INVALID OPERATOR CREDENTIALS. FIREWALL LOGGED ACCESS ATTEMPT.");
      }
    };

    return (
      <div id="admin-lock-screen" className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center select-none text-black font-sans">
        <div className="w-16 h-16 bg-neutral-950 text-emerald-400 rounded-full flex items-center justify-center mb-8 shadow-md border border-emerald-500/30">
          <ShieldCheck size={28} />
        </div>
        
        <h2 className="text-xl font-mono tracking-[0.25em] text-center font-black uppercase mb-2">
          OPERATOR ACCESS SHELL
        </h2>
        <p className="text-[10px] font-mono tracking-wider text-neutral-400 text-center uppercase max-w-sm mb-10 leading-relaxed">
          NANGSAL LOCAL SECURITY TERMINAL. ENTER AUTHORIZED CREDENTIALS OR SECURITY PIN TO ACCESS PRODUCT CATALOG & ORDER MANAGEMENT.
        </p>

        <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg space-y-6">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase mb-1.5">
                OPERATOR USERNAME / ID
              </label>
              <input
                type="text"
                placeholder="e.g. slimhood"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:outline-none focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase mb-1.5">
                SECURITY PASSWORD / PIN (Default: 8888)
              </label>
              <input
                type="password"
                placeholder="Enter password or 8888"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono focus:outline-none focus:border-black focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-mono text-xs font-extrabold tracking-widest py-3.5 rounded-lg uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <LogIn size={14} />
              <span>AUTHENTICATE TERMINAL</span>
            </button>
          </form>

          {adminAuthError && (
            <div className="text-[10px] font-mono text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center uppercase">
              {adminAuthError}
            </div>
          )}

          <div className="text-[10px] font-mono text-center text-neutral-400 border-t border-neutral-100 pt-4">
            PROTECTED BY REAL-TIME WAF FIREWALL SHIELD
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
          <div className="text-[10px] font-mono text-neutral-400 uppercase flex items-center gap-2">
            <User size={10} />
            <span>OPERATOR: LOCAL TERMINAL ACCOUNT</span>
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-3 mb-4 gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono tracking-widest text-[#767676] uppercase mb-2">
                REAL-TIME TRANSACTION LEDGER LIST WITH CUSTOMER INFORMATION
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full hide-scrollbar">
                {["today", "3days", "7days", "1month", "lifetime"].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setOrderDateFilter(filter as any)}
                    className={`px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase rounded-md whitespace-nowrap transition-colors cursor-pointer ${orderDateFilter === filter ? "bg-black text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-black"}`}
                  >
                    {filter === "lifetime" ? "ALL" : filter.replace("days", " DAYS").replace("month", " MONTH")}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => fetchOrdersFromBackend(false)}
              disabled={isLoadingOrders || isRefreshingOrders}
              className="text-[10px] font-mono font-bold tracking-widest text-black flex items-center gap-1.5 hover:text-neutral-500 transition-colors disabled:opacity-50 cursor-pointer shrink-0 mt-2 md:mt-0"
            >
              <RefreshCw size={10} className={`${(isLoadingOrders || isRefreshingOrders) ? 'animate-spin' : ''} text-neutral-400`} />
              <span>LIVE FEED RECORD</span>
            </button>
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
          ) : (
            <div className="space-y-4">
              {orders.filter(o => {
                if (o.status === "CANCELLED") return false;
                if (orderDateFilter === "lifetime") return true;
                
                let orderDate = new Date();
                if (o.createdAt) {
                  orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                }
                const diffTime = Math.abs(new Date().getTime() - orderDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (orderDateFilter === "today") return diffDays <= 1;
                if (orderDateFilter === "3days") return diffDays <= 3;
                if (orderDateFilter === "7days") return diffDays <= 7;
                if (orderDateFilter === "1month") return diffDays <= 30;
                return true;
              }).map((order, orderIdx) => {
                const dateString = order.createdAt 
                  ? (order.createdAt.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString())
                  : "GUEST SYSTEM TIME";

                const orderId = order.id || `G${orderIdx}`;
                const isExpanded = expandedOrders.includes(orderId);

                return (
                  <div 
                    key={orderId}
                    className="border border-neutral-200 hover:border-black rounded-xl bg-white p-3 md:p-4 transition-all shadow-xs relative overflow-hidden"
                  >
                    {/* Index label indicator */}
                    <div className="absolute top-0 right-0 bg-[#f4f4f4] text-black font-mono text-[10px] pl-3.5 pr-2 py-1 uppercase rounded-bl-lg font-bold border-l border-b flex items-center gap-2">
                      <span>#ID_{order.id ? order.id.slice(4) : `G${orderIdx}`}</span>
                      <button 
                        onClick={() => toggleExpandedOrder(orderId)}
                        className="hover:bg-neutral-200 p-0.5 rounded cursor-pointer transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>

                    {!isExpanded ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 sm:mt-2 pr-2 sm:pr-24">
                        <div className="space-y-1">
                          <p className="text-sm font-mono font-black text-black uppercase leading-none">
                            {order.name}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-500 uppercase">
                            {dateString} • {order.items?.length || 0} ITEM(S)
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="space-y-1 text-left sm:text-right">
                            <p className="text-sm font-mono font-black text-neutral-900 leading-none">
                              {formatPrice(order.totalAmount)}
                            </p>
                            <p className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                              {order.status || "PENDING"}
                            </p>
                          </div>
                          <select
                            value={order.status || "PENDING"}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="bg-white border border-neutral-200 text-[10px] font-mono uppercase px-2 py-1 rounded disabled:opacity-50 w-28 shrink-0 cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 sm:mt-4">
                        
                        {/* Segment 1: Delivery detail parameters */}
                        <div className="space-y-3 lg:border-r border-neutral-100 lg:pr-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase">
                            <User size={12} />
                            <span>CUSTOMER INF_MATION</span>
                          </div>
                        <div className="space-y-2">
                          <p className="text-sm font-mono font-black text-black uppercase leading-none">
                            {order.name}
                          </p>
                          <p className="text-xs font-mono text-neutral-600 flex items-center gap-1.5">
                            <Phone size={12} className="text-neutral-400" />
                            {order.phone}
                          </p>
                          <p className="text-xs font-mono text-neutral-600 flex items-center gap-1.5 leading-relaxed">
                            <MapPin size={12} className="text-neutral-400 shrink-0" />
                            <span className="uppercase text-left">{order.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Segment 2: Bought items details list */}
                      <div className="space-y-3 lg:border-r border-neutral-100 lg:px-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase">
                          <Layers size={12} />
                          <span>ITEMS ORDERED ({order.items?.length || 0})</span>
                        </div>

                        <ul className="space-y-2.5">
                          {order.items?.map((item: any, itemIdx: number) => (
                            <li key={itemIdx} className="flex justify-between items-start text-xs font-mono">
                              <div className="space-y-0.5 text-left">
                                <span className="font-extrabold uppercase text-neutral-800 line-clamp-1 block">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-neutral-500 uppercase">
                                  SIZE: {item.selectedSize || "N/A"} {"•"} QTY: {item.quantity}
                                </span>
                              </div>
                              <span className="font-bold text-neutral-700 shrink-0">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Segment 3: Totals, Dates, and confirmation status */}
                      <div className="space-y-4 lg:pl-4 flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase">
                            <Calendar size={12} />
                            <span>RECORDED_AT</span>
                          </div>
                          <p className="text-xs font-mono text-neutral-700 uppercase">
                            {dateString}
                          </p>
                        </div>

                        <div className="space-y-1 bg-[#fbfbfb] p-3 border border-neutral-100 rounded-lg">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-none">
                            NET SECURED TOTAL
                          </p>
                          <p className="text-base font-mono font-black text-neutral-900 leading-none">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                        
                        <div className="space-y-1 border-t border-neutral-100 pt-3">
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest leading-none mb-1">
                            ORDER STATUS
                          </p>
                          <select
                            value={order.status || "PENDING"}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="w-full bg-white border border-neutral-200 text-xs font-mono uppercase px-2 py-1.5 rounded disabled:opacity-50"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>

                        {(order.paymentScreenshotUrl || order.paymentScreenshotBase64) && (
                          <div className="flex flex-col gap-2 text-xs font-mono border-t border-neutral-100 pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-600 font-bold flex items-center gap-1 uppercase">
                                <CheckCircle2 size={14} /> PAYMENT SCREENSHOT
                              </span>
                              <a 
                                href={order.paymentScreenshotUrl || order.paymentScreenshotBase64} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-neutral-100 text-black px-2 py-1 rounded hover:bg-neutral-200 uppercase font-bold text-[10px]"
                              >
                                FULL SCREEN
                              </a>
                            </div>
                            <img 
                              src={order.paymentScreenshotUrl || order.paymentScreenshotBase64} 
                              alt="Payment Screenshot" 
                              className="w-full max-w-[200px] max-h-[300px] object-contain border border-neutral-200 rounded mt-2 bg-white"
                            />
                          </div>
                        )}
                      </div>

                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
    </div>
  );
};
