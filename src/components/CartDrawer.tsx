import { useState } from "react";
import { CartItem } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { X, Trash2, ShieldCheck, Mail, CreditCard, ChevronRight } from "lucide-react";
import { formatPrice } from "../utils/translator";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, action: "increment" | "decrement", size?: string) => void;
  onRemoveItem: (productId: string, size?: string) => void;
  currentLang: string;
  onOpenFullCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  currentLang,
  onOpenFullCart,
}: CartDrawerProps) {
  const [successMode, setSuccessMode] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  if (!isOpen) return null;

  // Compute selected items only for accurate subtotal matching Image 2
  const selectedItems = items.filter(item => item.selected !== false);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMode(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in touch-none"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#FAF9F4] text-[#131211] shadow-2xl flex flex-col h-full border-l border-neutral-300/30 animate-slide-in">
          
          {/* Header portion */}
          <div className="p-5 border-b border-neutral-300/25 flex items-center justify-between bg-white">
            <h2 className="text-lg font-serif font-bold text-[#131211] tracking-wide uppercase">
              {t.myCart}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 px-3 border border-neutral-200 hover:border-[#A37E2C] text-[#131211] hover:text-[#A37E2C] shrink-0 transition-colors cursor-pointer text-[10px] uppercase tracking-widest font-bold rounded"
            >
              Fermer ✕
            </button>
          </div>

          {/* Subheader banner */}
          <div className="bg-[#2E2218] text-[#FAF9F4] px-5 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-center select-none">
            ⭐ {t.freeShipping} ⭐
          </div>

          {successMode ? (
            /* Succession Celebration Screen */
            <div className="flex-1 p-8 flex flex-col justify-center text-center space-y-6 overflow-y-auto overscroll-contain">
              <div className="w-16 h-16 bg-[#16A34A]/10 border border-[#16A34A] flex items-center justify-center rounded-full mx-auto animate-bounce">
                <ShieldCheck className="w-8 h-8 text-[#16A34A]" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] bg-[#A37E2C]/10 text-[#A37E2C] px-3 py-1 font-bold tracking-widest uppercase rounded">
                  Réservation Enregistrée
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2E2218]">
                  Commande Confidentielle Initiée
                </h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Notre maître d'œuvre d'Olympe prend actuellement contact avec votre atelier. Vos spécifications exclusives ont été reçues.
                </p>
              </div>

              <div className="bg-white p-5 border border-neutral-300/30 text-left rounded-md space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pb-2 border-b border-neutral-200">
                  <span>Modèle</span>
                  <span>Montant</span>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-700 truncate max-w-[180px]">
                      {item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ""} × {item.quantity}
                    </span>
                    <span className="font-mono text-neutral-600">{formatPrice(item.product.price * item.quantity, currentLang)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-bold">
                  <span>{currentLang === "FR" ? "Estimation Totale" : "Estimated Total"}</span>
                  <span className="text-[#A37E2C]">{formatPrice(totalAmount, currentLang)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessMode(false);
                  onClose();
                }}
                className="w-full py-3.5 bg-[#2E2218] hover:bg-[#A37E2C] text-white text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer rounded"
              >
                Fermer et Poursuivre le Catalogue
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="flex-1 px-6 flex flex-col justify-center items-center text-center space-y-4">
              <div className="p-4 bg-neutral-100 rounded-full">
                <X className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-[#131211]">
                {t.cartEmpty}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4] text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer rounded"
              >
                Découvrir l'Atelier
              </button>
            </div>
          ) : (
            /* Items List & Checkout Form */
            <>
              {/* Premium Subtotal Header inspired by Image 2 right side panel peek */}
              <div className="p-5 bg-white border-b border-neutral-200 space-y-3.5 shadow-xs">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-[#A37E2C] font-extrabold mb-1">
                    {currentLang === "FR" ? "Sous-total" : "Subtotal"}
                  </p>
                  <p className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
                    {formatPrice(totalAmount, currentLang)}
                  </p>
                  
                  {/* Eligibility check for free transport */}
                  <p className="text-[10px] text-neutral-500 leading-snug font-sans max-w-xs mx-auto mt-2">
                    {currentLang === "FR" 
                      ? "Votre commande est éligible à la livraison Standard gratuite en France métropolitaine."
                      : "Your order qualifies for complimentary prestige home delivery."}
                  </p>
                </div>

                {/* Highlighted Go To Cart Button Mimicking Image 2 ("Aller au panier") */}
                <button
                  onClick={onOpenFullCart}
                  className="w-full py-3 bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4] border border-neutral-350 text-xs uppercase tracking-widest font-black rounded-full transition-all duration-300 shadow-md hover:scale-[1.01] cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  🛒 {currentLang === "FR" ? "Aller au panier" : "View Full Cart Details"}
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-200/60 bg-neutral-50/50 overscroll-contain">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize || ""}`} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 bg-white shrink-0 border border-neutral-200 overflow-hidden rounded p-1.5 flex items-center justify-center">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-[#131211] leading-snug line-clamp-2">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer shrink-0"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {item.selectedSize && (
                            <span className="text-[8px] tracking-wider uppercase bg-[#A37E2C]/10 text-[#A37E2C] px-1.5 py-0.5 font-bold rounded-xs">
                              Taille : {item.selectedSize}
                            </span>
                          )}
                          <span className="text-[8px] tracking-wide text-emerald-700 bg-emerald-50 px-1.5 py-0.5 font-bold rounded-xs border border-emerald-100">
                            En stock
                          </span>
                        </div>
                      </div>

                      {/* Quantity Capsule and Price aligned side-by-side matching Image 2 */}
                      <div className="flex items-center justify-between pt-2">
                        
                        {/* AMZ style yellow-accented capsule with absolute perfection layout */}
                        <div className="inline-flex items-center bg-white border border-amber-400 rounded-full h-7 px-1 shadow-sm shrink-0">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, "decrement", item.selectedSize)}
                            className="w-6 h-5 flex items-center justify-center hover:bg-neutral-100 rounded-full text-neutral-600 font-bold cursor-pointer text-xs"
                            title="Moins"
                          >
                            🗑️
                          </button>
                          <span className="px-2 font-mono font-bold text-neutral-800 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, "increment", item.selectedSize)}
                            className="w-6 h-5 flex items-center justify-center hover:bg-neutral-100 rounded-full text-neutral-600 font-bold cursor-pointer text-xs"
                            title="Plus"
                          >
                            +
                          </button>
                        </div>

                        {/* Individual Item sum value */}
                        <span className="text-xs font-bold text-[#2E2218] font-mono">
                          {formatPrice(item.product.price * item.quantity, currentLang)}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Private Checkout Form */}
              <div className="p-5 bg-white border-t border-neutral-200 space-y-4">
                <form onSubmit={handleCheckout} className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#A37E2C] font-bold">
                      Réservation de Prestige
                    </p>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-sans">
                      Notre atelier Chamonix vous contactera pour finaliser les réglages de votre équipement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {/* Customer Email */}
                    <div className="relative flex items-center bg-neutral-50 focus-within:bg-white border border-neutral-300 rounded px-3 h-9 transition-all">
                      <Mail className="w-3.5 h-3.5 text-[#A37E2C] shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="votre.courriel@domaine.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-transparent px-3 py-1.5 text-xs text-[#131211] focus:outline-none"
                      />
                    </div>

                    {/* Customer Phone */}
                    <div className="relative flex items-center bg-neutral-50 focus-within:bg-white border border-neutral-300 rounded px-3 h-9 transition-all">
                      <CreditCard className="w-3.5 h-3.5 text-[#A37E2C] shrink-0" />
                      <input
                        type="tel"
                        required
                        placeholder="Numéro de téléphone (+33...)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-transparent px-3 py-1.5 text-xs text-[#131211] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Subtotal */}
                  <div className="flex justify-between items-baseline font-mono pb-1">
                    <span className="text-xs font-sans font-semibold tracking-wide uppercase text-neutral-500">
                      {t.total}
                    </span>
                    <span className="text-base font-bold text-[#2E2218]">
                      {formatPrice(totalAmount, currentLang)}
                    </span>
                  </div>

                  {/* Submit Command */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#23211F] hover:bg-[#A37E2C] text-[#FAF9F4] font-bold tracking-[0.18em] text-[10px] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 shadow cursor-pointer rounded"
                  >
                    <span>{t.checkoutBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
