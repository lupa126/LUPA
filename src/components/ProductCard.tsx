import { memo } from "react";
import { Product } from "../types";
import { Star, Scale, Heart } from "lucide-react";
import { TRANSLATIONS } from "../data/translations";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  currentLang: string;
  isComparing?: boolean;
  onToggleCompare?: (product: Product, e: React.MouseEvent) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product, e: React.MouseEvent) => void;
}

const ProductCard = memo(function ProductCard({
  product,
  onViewDetails,
  currentLang,
  isComparing = false,
  onToggleCompare,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  const rating = product.reviews?.notation || 4.8;
  const reviewsCount = product.reviews?.count || 48;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col h-full bg-[#FAF9F4] border border-neutral-300/30 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] cursor-pointer"
    >
      {/* Product Image and Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="text-[8px] tracking-[0.2em] font-bold uppercase bg-[#1C2F22] text-[#FAF9F4] px-2.5 py-1 rounded-sm shadow-sm">
              {t.newBadge}
            </span>
          )}
        </div>

        {/* Compare Button */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product, e);
            }}
            className={`absolute top-3 right-3 z-20 p-2 rounded-full border transition-all duration-300 shadow-md flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer hover:scale-110 active:scale-95 ${
              isComparing 
                ? "bg-[#A37E2C] text-[#FAF9F4] border-[#A37E2C]" 
                : "bg-[#FAF9F4]/90 text-[#131211] border-neutral-300 hover:border-[#A37E2C] hover:bg-[#FAF9F4]"
            }`}
            title={currentLang === "FR" ? `Comparer ${product.name}` : `Compare ${product.name}`}
            aria-label={currentLang === "FR" ? `Comparer ${product.name}` : `Compare ${product.name}`}
          >
            <Scale className={`w-4 h-4 transition-transform duration-300 ${isComparing ? "scale-110 rotate-12" : ""}`} />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A37E2C]">
              {product.category === "aerodynamisme" 
                ? (currentLang === "FR" ? "VÉLO / CYCLISME" : "BIKE / CYCLING") 
                : product.category === "exploration-sauvage" 
                ? (currentLang === "FR" ? "RANDONNÉE / OUTDOOR" : "HIKING / OUTDOOR") 
                : (currentLang === "FR" ? "TRAINING / FITNESS" : "TRAINING / FITNESS")}
            </span>
            
            {/* Reviews */}
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#A37E2C] text-[#A37E2C]" />
              <span className="text-[9px] font-bold font-mono text-[#131211]">
                {rating.toFixed(1)}
              </span>
              <span className="text-[9px] text-neutral-500 font-sans">
                ({reviewsCount})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-serif font-semibold text-[#131211] group-hover:text-[#A37E2C] transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price Only */}
        <div className="pt-3 border-t border-neutral-300/20 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold">
              {currentLang === "FR" ? "Prix" : "Price"}
            </p>
            <p className="text-base font-serif font-semibold text-[#2E2218] tracking-tight whitespace-nowrap">
              {product.price.toLocaleString()} €
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product, e);
                }}
                className={`p-1.5 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 z-20 ${
                  isFavorite 
                    ? "bg-[#D9383A] text-white border-[#D9383A]" 
                    : "bg-[#FAF9F4]/90 text-[#A37E2C] border-neutral-300 hover:text-[#D9383A] hover:border-[#D9383A]"
                }`}
                title={currentLang === "FR" ? "Ajouter aux favoris" : "Add to favorites"}
                aria-label={currentLang === "FR" ? "Ajouter aux favoris" : "Add to favorites"}
              >
                <Heart className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            )}
            
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A37E2C] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {currentLang === "FR" ? "Découvrir →" : "Discover →"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
