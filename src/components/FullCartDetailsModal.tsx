import { useState } from "react";
import { CartItem } from "../types";
import { Trash2, ShieldCheck, Mail, CreditCard, ChevronRight } from "lucide-react";
import { formatPrice } from "../utils/translator";

interface FullCartDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, action: "increment" | "decrement", size?: string) => void;
  onRemoveItem: (productId: string, size?: string) => void;
  onToggleSelectItem: (productId: string, size?: string) => void;
  onToggleAllItems: (select: boolean) => void;
  currentLang: string;
}

export default function FullCartDetailsModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelectItem,
  onToggleAllItems,
  currentLang,
}: FullCartDetailsModalProps) {
  const [successMode, setSuccessMode] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [savedForLater, setSavedForLater] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter items that are currently checked/selected
  const selectedItems = items.filter(item => item.selected !== false);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const allDeselected = selectedItems.length === 0;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert(currentLang === "FR" ? "Veuillez sélectionner au moins un article pour réserver." : "Please select at least one item to reserve.");
      return;
    }
    setSuccessMode(true);
  };

  const handleSaveForLater = (productId: string) => {
    if (!savedForLater.includes(productId)) {
      setSavedForLater([...savedForLater, productId]);
    }
  };

  const handleShare = (productName: string) => {
    setCopiedLink(productName);
    setTimeout(() => {
      setCopiedLink(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
      {/* Clickable Backdrop */}
      <div className="absolute inset-0 cursor-pointer touch-none" onClick={onClose} />
      
      {/* Container Card mimicking Amazon Layout but dressed in high fashion */}
      <div 
        id="full-cart-container"
        className="relative w-full max-w-6xl bg-[#FAF9F4] text-[#131211] shadow-2xl rounded-lg border border-neutral-300/40 flex flex-col max-h-[90vh] overflow-hidden z-10"
      >
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-[#2E2218]">
              {currentLang === "FR" ? "Votre coffret de sélection" : "Your Selection Box"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 border border-neutral-300 hover:border-[#A37E2C] text-[#2E2218] hover:text-[#A37E2C] transition-all cursor-pointer font-semibold text-xs uppercase tracking-widest rounded-md"
          >
            Retour {currentLang === "FR" ? "Atelier" : "Atelier"} ✕
          </button>
        </div>

        {/* Modal Content - Two Column layout */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 overscroll-contain">
          {successMode ? (
            /* Success screen state */
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
              <div className="w-20 h-20 bg-[#1C2F22]/10 border-2 border-[#1C2F22] flex items-center justify-center rounded-full mx-auto animate-bounce">
                <ShieldCheck className="w-10 h-10 text-[#1C2F22]" />
              </div>
              
              <div className="space-y-3">
                <span className="text-xs bg-[#A37E2C]/10 text-[#A37E2C] px-4 py-1.5 font-bold tracking-widest uppercase rounded">
                  {currentLang === "FR" ? "Service d'excellence initié" : "Premium order initiated"}
                </span>
                <h3 className="text-3xl font-serif font-black text-[#2E2218]">
                  {currentLang === "FR" ? "Demande Enregistrée" : "Request Registered"}
                </h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed font-light">
                  {currentLang === "FR"
                    ? "Nos maîtres d'armes et tailleurs de l'Atelier de Chamonix examinent vos mesures de performance sportive. Un courriel de configuration sur-mesure vous a été envoyé."
                    : "Our master tailliers and craftspeople in Chamonix are analyzing your custom dimensions. A tailored confirmation email was dispatched."}
                </p>
              </div>

              <div className="bg-white p-6 border border-neutral-300/40 text-left rounded-md shadow-sm space-y-4 max-w-lg mx-auto">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pb-2 border-b border-neutral-200 text-[#2E2218]">
                  <span>{currentLang === "FR" ? "ÉQUIPEMENT BESPOKE" : "BESPOKE EQUIPMENT"}</span>
                  <span>{currentLang === "FR" ? "ESTIMATION" : "ESTIMATE"}</span>
                </div>
                {selectedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-neutral-700">
                    <span className="truncate max-w-[280px]">
                      {item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ""} × {item.quantity}
                    </span>
                    <span className="font-mono">{formatPrice(item.product.price * item.quantity, currentLang)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-sm font-bold">
                  <span>{currentLang === "FR" ? "Valeur totale estimée" : "Total Estimated Value"}</span>
                  <span className="text-[#A37E2C] font-mono text-base">{formatPrice(totalAmount, currentLang)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessMode(false);
                  onClose();
                }}
                className="px-8 py-3.5 bg-[#2E2218] hover:bg-[#A37E2C] text-white text-xs font-bold tracking-widest uppercase transition-all rounded shadow-md cursor-pointer"
              >
                {currentLang === "FR" ? "Revenir au catalogue sportif" : "Back to Sports Catalog"}
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="py-16 text-center space-y-5">
              <div className="text-5xl">🛒</div>
              <h3 className="text-xl font-serif font-bold text-neutral-600">
                {currentLang === "FR" ? "Votre panier Amazon-luxury est vide" : "Your Amazon-luxury cart is empty"}
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                {currentLang === "FR" 
                  ? "Explorez notre gamme de vélos aérodynamiques, d'équipements de fitness et de vêtements techniques de haute couture."
                  : "Explore our collection of premium aerodynamic bicycles, custom fitness rigs, and high performance tailoring."}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#2E2218] hover:bg-[#A37E2C] text-white text-xs font-bold tracking-widest uppercase transition-colors rounded shadow"
              >
                {currentLang === "FR" ? "Visiter l'atelier" : "Browse products"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Side: Detailed Amazon Style list */}
              <div className="lg:col-span-2 bg-white p-6 border border-neutral-300/30 rounded-lg shadow-sm space-y-6">
                
                {/* Section Header */}
                <div className="border-b border-neutral-200 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-sans font-medium text-neutral-900">
                      {currentLang === "FR" ? "Votre panier" : "Shopping Cart"}
                    </h3>
                    
                    {/* Select / Deselect and headers */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {allDeselected ? (
                        <button
                          onClick={() => onToggleAllItems(true)}
                          className="text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                        >
                          {currentLang === "FR" ? "Sélectionner tous les éléments" : "Select all items"}
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleAllItems(false)}
                          className="text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                        >
                          {currentLang === "FR" ? "Désélectionner tous les éléments" : "Deselect all items"}
                        </button>
                      )}
                    </div>
                  </div>

                  <span className="hidden sm:inline text-xs text-neutral-400 font-medium self-end capitalize">
                    {currentLang === "FR" ? "Prix" : "Price"}
                  </span>
                </div>

                {/* Items loop */}
                <div className="divide-y divide-neutral-200">
                  {items.map((item) => {
                    const isSelected = item.selected !== false;
                    const isSaved = savedForLater.includes(item.product.id);
                    
                    return (
                      <div 
                        key={`${item.product.id}-${item.selectedSize || ""}`}
                        className={`py-6 flex flex-col sm:flex-row gap-5 first:pt-0 last:pb-0 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-60 bg-neutral-50/50"
                        }`}
                      >
                        {/* Selector checkbox & Thumbnail */}
                        <div className="flex items-start gap-3 shrink-0">
                          <div className="pt-2 flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSelectItem(item.product.id, item.selectedSize)}
                              className="w-[17px] h-[17px] rounded border-neutral-300 text-[#A37E2C] focus:ring-[#A37E2C] cursor-pointer accent-[#2E2218]"
                            />
                          </div>

                          <div className="w-28 h-28 bg-neutral-100 flex items-center justify-center border border-neutral-200 p-2 rounded overflow-hidden relative shrink-0">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Middle detailed description column */}
                        <div className="flex-1 space-y-2">
                          <div className="space-y-1">
                            <h4 className="text-sm sm:text-base font-medium text-neutral-900 leading-snug">
                              {item.product.name}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Custom high-performance product badge mimic Amazon */}
                              <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wide">
                                #1 {currentLang === "FR" ? "Meilleure vente" : "Best Seller"}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-light font-mono">
                                {currentLang === "FR" ? "dans Équipements de Chamonix" : "in Chamonix Gear"}
                              </span>
                            </div>
                          </div>

                          {/* Extra metadata precisely extracted from Amazon theme */}
                          <div className="space-y-1 text-xs text-neutral-600">
                            <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
                              {currentLang === "FR" ? "En stock" : "In stock"}
                            </p>
                            
                            <div className="flex items-center gap-1 text-neutral-500 font-light">
                              <input 
                                type="checkbox" 
                                id={`gift-${item.product.id}`} 
                                className="w-3.5 h-3.5 rounded border-neutral-300 text-[#A47E2C] cursor-pointer"
                              />
                              <label htmlFor={`gift-${item.product.id}`} className="cursor-pointer text-[11px]">
                                {currentLang === "FR" ? "Ceci sera un cadeau." : "This is a gift."} <span className="text-sky-700 hover:underline">{currentLang === "FR" ? "En savoir plus" : "Learn more"}</span>
                              </label>
                            </div>

                            <p className="font-medium text-neutral-700">
                              Style: <span className="font-light text-neutral-500">{currentLang === "FR" ? "Bespoke Unique" : "Custom Unique"}</span>
                            </p>
                            
                            {item.selectedSize && (
                              <p className="font-medium text-neutral-700">
                                Size: <span className="text-[#A37E2C] font-bold px-2 py-0.5 bg-[#A37E2C]/10 rounded-sm">{item.selectedSize}</span>
                              </p>
                            )}
                          </div>

                          {/* Bottom Action bar with quantity capsule and action links */}
                          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                            {/* AMZ style yellow-accented capsule with absolute perfection layout */}
                            <div className="inline-flex items-center bg-neutral-100 hover:bg-neutral-200/50 border border-amber-400/80 rounded-full h-8 px-1 shadow-sm transition-all">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, "decrement", item.selectedSize)}
                                className="w-7 h-6 flex items-center justify-center hover:bg-white rounded-full text-neutral-600 font-black cursor-pointer text-sm"
                                title="Moins"
                              >
                                {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-neutral-600" /> : "−"}
                              </button>
                              <span className="px-3 font-mono font-bold text-neutral-800 text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, "increment", item.selectedSize)}
                                className="w-7 h-6 flex items-center justify-center hover:bg-white rounded-full text-neutral-600 font-bold cursor-pointer text-sm"
                                title="Plus"
                              >
                                +
                              </button>
                            </div>

                            {/* Separator block with link utilities */}
                            <span className="text-neutral-300">|</span>

                            <button 
                              onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                              className="text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                            >
                              {currentLang === "FR" ? "Supprimer" : "Delete"}
                            </button>

                            <span className="text-neutral-300">|</span>

                            <button 
                              onClick={() => handleSaveForLater(item.product.id)}
                              className={`text-sky-700 hover:text-sky-800 hover:underline cursor-pointer ${isSaved ? "text-neutral-400 cursor-not-allowed line-through" : ""}`}
                              disabled={isSaved}
                            >
                              {isSaved ? (currentLang === "FR" ? "Enregistré" : "Saved") : (currentLang === "FR" ? "Enregistrer pour plus tard" : "Save for later")}
                            </button>

                            <span className="text-neutral-300">|</span>

                            <button 
                              onClick={() => {
                                onClose();
                                setTimeout(() => {
                                  const section = document.getElementById("products-catalog-section");
                                  if (section) section.scrollIntoView({ behavior: "smooth" });
                                }, 150);
                              }}
                              className="text-sky-700 hover:text-sky-800 hover:underline cursor-pointer"
                            >
                              {currentLang === "FR" ? "Produits similaires" : "Similar items"}
                            </button>

                            <span className="text-neutral-300">|</span>

                            <button 
                              onClick={() => handleShare(item.product.name)}
                              className="text-sky-700 hover:text-sky-800 hover:underline cursor-pointer flex items-center gap-1"
                            >
                              {currentLang === "FR" ? "Partager" : "Share"}
                            </button>

                            {copiedLink === item.product.name && (
                              <span className="text-[10px] text-emerald-600 font-mono italic animate-pulse">
                                ✓ {currentLang === "FR" ? "Lien copié !" : "Link copied !"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Absolute right column detailing exact price */}
                        <div className="shrink-0 text-right sm:pt-2">
                          <span className="text-base sm:text-lg font-bold text-neutral-950 font-mono">
                            {formatPrice(item.product.price, currentLang)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-neutral-400 font-mono">
                              ({formatPrice(item.product.price, currentLang)} / {currentLang === "FR" ? "unité" : "unit"})
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal summary precisely positioned on bottom-right of the item list cards */}
                <div className="pt-6 border-t border-neutral-200 text-right space-y-1">
                  <p className="text-sm md:text-base text-neutral-800">
                    {currentLang === "FR" ? "Sous-total" : "Subtotal"}{" "}
                    <span>
                      ({totalQuantity} {totalQuantity > 1 ? (currentLang === "FR" ? "articles" : "items") : (currentLang === "FR" ? "article" : "item")})
                    </span>{" "}
                    :{" "}
                    <span className="text-lg md:text-xl font-bold font-mono text-neutral-900">
                      {formatPrice(totalAmount, currentLang)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Side: Check-out controller side panel mimic Image 2 */}
              <div className="space-y-6">
                
                {/* Free Shipping validation notice card */}
                <div className="bg-white p-6 border border-neutral-300/30 rounded-lg shadow-sm space-y-4">
                  {/* Free shipping check indicator */}
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-md leading-relaxed font-sans font-medium flex items-start gap-2">
                      <span className="text-base">✓</span>
                      <span>
                        {currentLang === "FR" 
                          ? "Votre commande est éligible à la livraison Standard gratuite en France métropolitaine." 
                          : "Your order is eligible for free standard luxury delivery."}
                      </span>
                    </p>
                  </div>

                  {/* Quick summary totals */}
                  <div className="space-y-1.5 pb-2 border-b border-neutral-150">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{currentLang === "FR" ? "Total Articles" : "Total Items"}</span>
                      <span>{totalQuantity}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{currentLang === "FR" ? "Maison Livraison" : "Mansion Delivery"}</span>
                      <span className="text-emerald-700 font-bold uppercase tracking-wide">Gratuit</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline font-mono pb-2">
                    <span className="text-sm font-sans font-bold text-neutral-800">
                      {currentLang === "FR" ? "Sous-total :" : "Subtotal:"}
                    </span>
                    <span className="text-xl font-black text-[#2E2218]">
                      {formatPrice(totalAmount, currentLang)}
                    </span>
                  </div>

                  {/* Private Checkout client detail collection form */}
                  <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">
                      {currentLang === "FR" 
                        ? "Veuillez spécifier votre courriel de consultation afin de réserver votre sélection exclusive." 
                        : "Specify your personal contact details to complete the standard high-performance reservation."}
                    </p>

                    {/* Input 1: Email */}
                    <div className="relative flex items-center bg-neutral-50 focus-within:bg-white border border-neutral-300 rounded-md px-3 h-10 transition-all">
                      <Mail className="w-4 h-4 text-[#A37E2C] shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="votre.courriel@domaine.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-transparent px-3 py-1 text-xs text-[#131211] focus:outline-none"
                      />
                    </div>

                    {/* Input 2: Telefon */}
                    <div className="relative flex items-center bg-neutral-50 focus-within:bg-white border border-neutral-300 rounded-md px-3 h-10 transition-all">
                      <CreditCard className="w-4 h-4 text-[#A37E2C] shrink-0" />
                      <input
                        type="tel"
                        required
                        placeholder="Téléphone (+33...)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-transparent px-3 py-1 text-xs text-[#131211] focus:outline-none"
                      />
                    </div>

                    {/* Submission button styled like Amazon amber button but classy */}
                    <button
                      type="submit"
                      disabled={selectedItems.length === 0}
                      className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-stone-900 border border-amber-500 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <span>{currentLang === "FR" ? "Aller au règlement / Réserver" : "Proceed to premium checkout"}</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </form>
                </div>

                {/* Secure Trust note */}
                <p className="text-[10px] text-neutral-400 text-center uppercase tracking-widest font-bold">
                  🛡️ {currentLang === "FR" ? "Atelier Sécurisé Maison Atlis" : "Atlis Secured Atelier"}
                </p>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
