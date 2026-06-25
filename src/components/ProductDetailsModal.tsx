import { useState, useEffect } from "react";
import { Product } from "../types";
import { X, Star, Check, ShoppingBag, ShieldCheck, Heart } from "lucide-react";
import { TRANSLATIONS } from "../data/translations";
import { formatPrice, formatSizeDisplay } from "../utils/translator";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string) => void;
  currentLang: string;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  currentLang,
  isFavorite,
  onToggleFavorite,
}: ProductDetailsModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  // Reset local state when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize("");
      setAdded(false);
      setSizeError(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(product, selectedSize || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        className="absolute inset-0 cursor-pointer touch-none" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-4xl bg-[#FAF9F4] text-[#131211] shadow-2xl border border-neutral-300/40 grid grid-cols-1 md:grid-cols-[58%_42%] lg:grid-cols-2 overflow-hidden animate-fade-in-up z-10 max-h-[90vh] overflow-y-auto overscroll-contain">
        
        {/* Close Button: Fixed on mobile viewports for absolute accessibility when scrolling, absolute on desktop */}
        <button
          onClick={onClose}
          className="fixed md:absolute top-4 right-4 z-50 p-3 rounded-full bg-[#FAF9F4] text-[#131211] hover:text-[#A37E2C] hover:bg-neutral-100 border border-neutral-300 shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
          aria-label={currentLang === "FR" ? "Fermer la page produit" : "Close product page"}
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Column 1: Image container - Styled to display the full image using object-contain and centering */}
        <div className="relative h-80 md:h-auto min-h-[350px] bg-neutral-100/60 flex items-center justify-center p-6 md:p-3 lg:p-6 border-b md:border-b-0 md:border-r border-neutral-200">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[320px] md:max-h-[520px] lg:max-h-[500px] object-contain transition-all duration-300 md:scale-[1.05] lg:scale-100"
          />
          
          <div className="absolute top-4 left-4 text-[#131211] space-y-1">
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] bg-[#A37E2C] text-[#FAF9F4] px-2.5 py-1 font-bold rounded-sm shadow-sm">
              {product.badge}
            </span>
          </div>
          
          <div className="absolute bottom-4 left-4">
            <p className="text-[10px] font-mono text-neutral-400 tracking-wide">
              Maison Atlis — Chamonix
            </p>
          </div>
        </div>

        {/* Column 2: Spec Sheets and Details */}
        <div className="p-6 md:p-5 lg:p-10 flex flex-col justify-between">
          <div className="space-y-6 md:space-y-3.5 lg:space-y-6">
            
            {/* Header portion */}
            <div className="space-y-2 md:space-y-1 lg:space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#A37E2C] font-bold">
                  {product.categoryLabel}
                </span>
                
                {product.isNew && (
                  <span className="text-[8px] tracking-widest font-bold uppercase text-[#1C2F22]">
                    • {t.newBadge}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl md:text-xl lg:text-3xl font-serif font-bold text-[#131211] tracking-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 pt-1 border-b border-neutral-300/20 pb-4 md:pb-2.5 lg:pb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.reviews?.notation || 4.8)
                          ? "fill-[#A37E2C] text-[#A37E2C]"
                          : "text-neutral-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-[#131211]">
                  {product.reviews?.notation || "4.8"}/5
                </span>
                <span className="text-xs text-neutral-500 font-sans">
                  ({product.reviews?.count || "48"} {t.reviewsLabel})
                </span>
              </div>
            </div>

            {/* Price tag */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                {currentLang === "FR" 
                  ? "Valeur d'Acquisition" 
                  : currentLang === "EN" 
                  ? "Acquisition Value" 
                  : currentLang === "DE" 
                  ? "Anschaffungswert" 
                  : "Valeur d'Acquisition d'Olympe"}
              </span>
              <p className="text-2xl md:text-xl lg:text-2xl font-serif font-bold text-[#2E2218]">
                {formatPrice(product.price, currentLang)}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs md:text-[10.5px] lg:text-xs text-neutral-600 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Atelier details list */}
            <div className="space-y-3 md:space-y-2 lg:space-y-3">
              <p className="text-[10px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.18em] text-[#131211]">
                {t.detailsTitle}
              </p>
              <ul className="space-y-2 md:space-y-1 lg:space-y-2 text-xs md:text-[10.5px] lg:text-xs text-neutral-600 border-l border-[#A37E2C]/30 pl-4 py-1">
                {product.details.map((detail, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5 md:space-y-1.5 lg:space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={`text-[9px] uppercase tracking-[0.2em] font-bold block ${sizeError ? "text-[#A37E2C]" : "text-neutral-500"}`}>
                    {t.selectSize} {sizeError && "*"}
                  </label>
                  {sizeError && (
                    <span className="text-[9px] font-mono font-bold text-[#A37E2C] uppercase animate-pulse">
                      {currentLang === "FR" ? "Sélection requise" : "Selection required"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`px-4 py-2 md:px-3 md:py-1.5 lg:px-4 lg:py-2 border text-xs md:text-[10px] lg:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#2E2218] border-[#2E2218] text-[#FAF9F4]"
                          : sizeError
                          ? "bg-white border-[#A37E2C] text-[#A37E2C] hover:bg-[#FAF9F4]"
                          : "bg-white border-neutral-300/70 hover:border-[#A37E2C] text-[#131211]"
                      }`}
                    >
                      {formatSizeDisplay(size, currentLang)}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Zone */}
          <div className="pt-8 md:pt-4 lg:pt-8 mt-6 md:mt-4 lg:mt-6 border-t border-neutral-300/20 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className={`flex-1 py-4 md:py-3 lg:py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                added 
                  ? "bg-[#1C2F22] text-[#FAF9F4]" 
                  : "bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4]"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>Réservé avec Succès</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.addCartBtn}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleFavorite(product)}
              className={`p-4 md:p-3 lg:p-4 border transition-all duration-250 cursor-pointer rounded-sm hover:scale-105 ${
                isFavorite 
                  ? "border-red-500 text-red-550 bg-red-50/70" 
                  : "border-neutral-300/50 hover:border-[#A37E2C] text-[#131211] bg-white"
              }`}
              title={
                currentLang === "FR" || currentLang === "CH"
                  ? "Ajouter aux favoris de la Maison"
                  : currentLang === "DE"
                  ? "Zu Favoriten hinzufügen"
                  : "Add to Maison favorites"
              }
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFavorite ? "fill-red-500 text-red-500" : "text-[#131211] hover:text-[#A37E2C]"}`} />
            </button>
          </div>

          {/* Luxury assurance mark */}
          <div className="mt-4 flex items-center gap-2 text-[9px] tracking-wider uppercase text-neutral-400 font-semibold justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A37E2C]" />
            <span>{t.authenticAssurance}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
