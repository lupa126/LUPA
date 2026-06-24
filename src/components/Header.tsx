import { useState, useEffect, useRef } from "react";
import { Search, Globe, ShoppingBag, User, X, Heart, Trash2 } from "lucide-react";
import { Product, SearchSuggestion } from "../types";
import { PRODUCTS } from "../data/products";
import { TRANSLATIONS } from "../data/translations";
import AltisLogo from "./AltisLogo";
import { translateProduct, formatPrice } from "../utils/translator";

interface HeaderProps {
  onSearchSelect: (product: Product) => void;
  cartCount: number;
  onOpenCart: () => void;
  activeOverlay: boolean;
  setActiveOverlay: (active: boolean) => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
  onSportSelect?: (sport: string | null) => void;
  selectedSport?: string | null;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onLogoClick?: () => void;
  favorites: Product[];
  onViewProduct: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  onOpenAccount?: () => void;
}

export default function Header({
  onSearchSelect,
  cartCount,
  onOpenCart,
  activeOverlay,
  setActiveOverlay,
  currentLang,
  onLangChange,
  onSportSelect,
  selectedSport = null,
  searchQuery: searchQueryProp,
  onSearchQueryChange,
  onLogoClick,
  favorites,
  onViewProduct,
  onToggleFavorite,
  onOpenAccount,
}: HeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const isControlled = searchQueryProp !== undefined;
  const searchQuery = isControlled ? searchQueryProp : localSearchQuery;

  const setSearchQuery = (val: string) => {
    if (isControlled && onSearchQueryChange) {
      onSearchQueryChange(val);
    } else {
      setLocalSearchQuery(val);
    }
  };

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSportsMenu, setShowSportsMenu] = useState(false);
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const isPLPActive = !!searchQuery?.trim() || selectedSport !== null;
  const [showHeader, setShowHeader] = useState(true);
  const [isFixed, setIsFixed] = useState(false);

  // Scroll detection: Sticky & Visible on scroll up ONLY on listing page, otherwise static at original position
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 140) {
        setShowHeader(true);
        setIsFixed(false);
      } else {
        if (isPLPActive) {
          if (currentY < lastY) {
            setShowHeader(true);
            setIsFixed(true);
          } else {
            setShowHeader(false);
            setIsFixed(true);
          }
        } else {
          setShowHeader(false);
          setIsFixed(false);
        }
      }
      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPLPActive]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const sportsRef = useRef<HTMLDivElement>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (sportsRef.current && !sportsRef.current.contains(event.target as Node)) {
        setShowSportsMenu(false);
      }
      if (favoritesRef.current && !favoritesRef.current.contains(event.target as Node)) {
        setShowFavoritesMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const suggestionsList: SearchSuggestion[] = [];

    // Filter products translated into the current language
    const translatedProducts = PRODUCTS.map((p) => translateProduct(p, currentLang));
    const matchingProducts = translatedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(query))
    );

    matchingProducts.forEach((p) => {
      suggestionsList.push({
        text: p.name,
        type: "product",
        item: p,
      });
    });

    setSuggestions(suggestionsList.slice(0, 5));
  }, [searchQuery, currentLang]);

  const handleFocusSearch = () => {
    setActiveOverlay(true);
    setShowSuggestions(true);
  };

  const handleBlurSearch = () => {
    setTimeout(() => {
      if (!searchQuery) {
        setActiveOverlay(false);
      }
    }, 200);
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery("");
    setShowSuggestions(false);
    setActiveOverlay(false);

    if (suggestion.type === "product" && suggestion.item) {
      onSearchSelect(suggestion.item);
    }
  };

  return (
    <>
      {/* Universal Header Blurred Lock Overlay */}
      {activeOverlay && (
        <div 
          id="header-overlay"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300"
          onClick={() => {
            setActiveOverlay(false);
            setShowSuggestions(false);
          }}
        />
      )}

      <header className={`z-50 w-full bg-[#2E2218] text-[#FAF9F4] border-b border-white/10 shadow-lg px-4 md:px-12 py-3 transition-transform duration-300 ease-out ${
        isPLPActive && isFixed
          ? "fixed top-0 left-0 right-0" 
          : "relative"
      } ${
        isPLPActive && isFixed && !showHeader
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left Block: Logo ATLIS with custom SVG hand-crafted design */}
          <div className="flex items-center justify-between md:justify-start gap-8">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (onLogoClick) {
                  onLogoClick();
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <AltisLogo className="w-8 h-8 text-[#A37E2C] group-hover:scale-105 transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(163,126,44,0.3)]" />
              <span className="text-2xl font-serif font-bold tracking-[0.25em] text-[#FAF9F4] hover:text-[#A37E2C] transition-colors duration-250 select-none">
                {t.logoTitle}
              </span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAF9F4]/80">
              <span 
                className="hover:text-[#A37E2C] cursor-pointer transition-colors" 
                onClick={() => {
                  const section = document.getElementById("products-catalog-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
              >
              </span>
            </nav>
          </div>

          {/* Middle Block: Large Intelligent Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-auto w-full">
            <div className="relative flex items-center bg-white/10 focus-within:bg-[#FAF9F4] focus-within:text-[#131211] transition-all duration-300">
              <span className="pl-4 text-white/60 focus-within:text-[#131211]">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="header-search-bar"
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!activeOverlay) setActiveOverlay(true);
                }}
                onFocus={handleFocusSearch}
                onBlur={handleBlurSearch}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSuggestions(false);
                    setActiveOverlay(false);
                    e.currentTarget.blur();
                  }
                }}
                className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none placeholder-white/50 focus:placeholder-neutral-500 text-inherit font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-4 text-white/60 hover:text-[#131211]"
                >
                  <X className="w-4 h-4 cursor-pointer" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                id="search-suggestions-box"
                className="absolute left-0 right-0 mt-1 bg-[#FAF9F4] text-[#131211] border border-neutral-300/30 shadow-2xl z-50 py-2 divide-y divide-neutral-200 animate-fade-in"
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    id={`suggest-item-${idx}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-100 flex items-center justify-between cursor-pointer group transition-luxury"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#131211] group-hover:text-[#A37E2C] transition-colors">
                        {suggestion.text}
                      </p>
                    </div>
                    <span className="text-[9px] uppercase bg-[#A37E2C]/10 text-[#A37E2C] px-2 py-0.5 font-bold tracking-wider rounded-sm">
                      Maison Atlis
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Block: Sports Select Dropdown & Utilities */}
          <div className="flex items-center justify-between md:justify-end gap-6 text-[10px] font-semibold tracking-wider uppercase">
            
            {/* Sports Selector Dropdown */}
            <div ref={sportsRef} className="relative">
              <button
                id="sports-selector-btn"
                onClick={() => setShowSportsMenu(!showSportsMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FAF9F4]/15 hover:bg-[#FAF9F4]/25 border border-white/20 hover:border-[#A37E2C]/80 text-xs sm:text-sm font-bold tracking-widest text-[#FAF9F4] rounded-full transition-all cursor-pointer shadow-md"
                title="Choisir une discipline"
              >
                <span>Sports</span>
                <span className={`text-[8px] text-[#A37E2C] font-black transition-transform duration-200 ${showSportsMenu ? "rotate-180" : ""}`}>▼</span>
              </button>

              {showSportsMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FAF9F4] text-[#131211] border-2 border-[#A37E2C]/50 shadow-2xl z-50 py-2 divide-y-2 divide-neutral-200/80 font-bold text-xs sm:text-sm tracking-wider uppercase rounded-lg overflow-hidden animate-fade-in">
                  <button
                    onClick={() => {
                      if (onSportSelect) onSportSelect(null);
                      setShowSportsMenu(false);
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-[#A37E2C]/10 hover:text-[#A37E2C] cursor-pointer flex items-center justify-between transition-all ${
                      selectedSport === null ? "text-[#A37E2C] bg-[#A37E2C]/5" : ""
                    }`}
                  >
                    <span className="tracking-widest">
                      {currentLang === "FR" ? "Tous les sports" : currentLang === "EN" ? "All Sports" : currentLang === "DE" ? "Alle Sportarten" : "Alle Sportarten"}
                    </span>
                    {selectedSport === null && (
                      <span className="w-2.5 h-2.5 bg-[#A37E2C] rounded-full shadow-sm" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onSportSelect) onSportSelect("aerodynamisme");
                      setShowSportsMenu(false);
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-[#A37E2C]/10 hover:text-[#A37E2C] cursor-pointer flex items-center justify-between transition-all ${
                      selectedSport === "aerodynamisme" ? "text-[#A37E2C] bg-[#A37E2C]/5" : ""
                    }`}
                  >
                    <span className="tracking-widest">
                      {currentLang === "FR" ? "Vélo (Cyclisme)" : currentLang === "EN" ? "Cycling & Bike" : "Radsport / Velos"}
                    </span>
                    {selectedSport === "aerodynamisme" && (
                      <span className="w-2.5 h-2.5 bg-[#A37E2C] rounded-full shadow-sm" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onSportSelect) onSportSelect("resistance-active");
                      setShowSportsMenu(false);
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-[#A37E2C]/10 hover:text-[#A37E2C] cursor-pointer flex items-center justify-between transition-all ${
                      selectedSport === "resistance-active" ? "text-[#A37E2C] bg-[#A37E2C]/5" : ""
                    }`}
                  >
                    <span className="tracking-widest">
                      {currentLang === "FR" ? "Fitness & Musculation" : currentLang === "EN" ? "Fitness & Training" : "Fitness & Training"}
                    </span>
                    {selectedSport === "resistance-active" && (
                      <span className="w-2.5 h-2.5 bg-[#A37E2C] rounded-full shadow-sm" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onSportSelect) onSportSelect("exploration-sauvage");
                      setShowSportsMenu(false);
                    }}
                    className={`w-full text-left px-5 py-4 hover:bg-[#A37E2C]/10 hover:text-[#A37E2C] cursor-pointer flex items-center justify-between transition-all ${
                      selectedSport === "exploration-sauvage" ? "text-[#A37E2C] bg-[#A37E2C]/5" : ""
                    }`}
                  >
                    <span className="tracking-widest">
                      {currentLang === "FR" ? "Randonnée & Outdoor" : currentLang === "EN" ? "Hiking & Outdoor" : "Rucksack / Wandern"}
                    </span>
                    {selectedSport === "exploration-sauvage" && (
                      <span className="w-2.5 h-2.5 bg-[#A37E2C] rounded-full shadow-sm" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div ref={langRef} className="relative">
              <button
                id="language-selector-btn"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 py-1 hover:text-[#A37E2C] cursor-pointer transition-colors text-white/90"
              >
                <Globe className="w-3.5 h-3.5 text-[#A37E2C]" />
                <span>{currentLang}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-[#FAF9F4] text-[#131211] border border-neutral-300/40 shadow-xl z-50 py-1 font-semibold">
                  {["FR", "EN", "DE", "CH"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLangChange(lang);
                        setShowLangMenu(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs hover:bg-[#A37E2C]/5 hover:text-[#A37E2C] cursor-pointer"
                    >
                      {lang === "FR" ? "Français" : lang === "EN" ? "English" : lang === "DE" ? "Deutsch" : "Schweiz"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <button onClick={onOpenAccount} className="text-white/85 hover:text-[#A37E2C] cursor-pointer transition-colors" title="Accéder au compte">
              <User className="w-4 h-4" />
            </button>

              {/* Favorites (Heart) Trigger & Dropdown Menu */}
              <div ref={favoritesRef} className="relative">
                <button
                  id="favorites-trigger-btn"
                  onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                  className="relative flex items-center gap-1 text-white/90 hover:text-[#A37E2C] cursor-pointer transition-colors"
                  title={currentLang === "FR" ? "Mes Favoris" : "My Favorites"}
                >
                  <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-red-500 text-red-550 active:scale-125" : ""}`} />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center border border-white transition-all scale-95 shadow-sm">
                      {favorites.length}
                    </span>
                  )}
                </button>

                {/* Favorites dropdown */}
                {showFavoritesMenu && (
                  <>
                    {/* Backdrop only on mobile for elegant dismiss and shield */}
                    <div 
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
                      onClick={() => setShowFavoritesMenu(false)}
                    />
                    <div 
                      id="favorites-dropdown-box"
                      className="fixed md:absolute top-1/2 left-1/2 md:top-auto md:left-auto md:right-0 transform -translate-x-1/2 -translate-y-1/2 md:transform-none mt-0 md:mt-3 w-[calc(100vw-32px)] sm:w-96 max-w-md bg-[#FAF9F4] text-[#131211] border-2 border-[#A37E2C]/30 shadow-2xl z-50 py-3 rounded-lg overflow-hidden animate-fade-in divide-y divide-neutral-200 flex flex-col max-h-[85vh] md:max-h-none"
                    >
                      <div className="px-4 py-2.5 pb-3 flex items-center justify-between">
                        <span className="font-serif font-black tracking-widest text-[#2E2218] text-xs">
                          {currentLang === "FR" ? "MES FAVORIS" : "MY FAVORITES"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-zinc-400 bg-neutral-200/50 px-2 py-0.5 rounded-full">
                            {favorites.length} {favorites.length === 1 ? (currentLang === "FR" ? "pièce" : "item") : (currentLang === "FR" ? "pièces" : "items")}
                          </span>
                          {/* Close button for easy mobile dismissal */}
                          <button 
                            onClick={() => setShowFavoritesMenu(false)}
                            className="md:hidden text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {favorites.length === 0 ? (
                        <div className="px-4 py-8 text-center space-y-2">
                          <span className="text-xl">🕊️</span>
                          <p className="text-xs text-neutral-500 font-light">
                            {currentLang === "FR" ? "Aucune création dans vos favoris." : "No creations in your favorites."}
                          </p>
                          <button
                            onClick={() => {
                              const section = document.getElementById("products-catalog-section");
                              if (section) section.scrollIntoView({ behavior: "smooth" });
                              setShowFavoritesMenu(false);
                            }}
                            className="text-[9px] font-bold text-[#A37E2C] hover:underline uppercase tracking-wider cursor-pointer"
                          >
                            {currentLang === "FR" ? "Découvrir la collection" : "Explore collection"}
                          </button>
                        </div>
                      ) : (
                        <div className="max-h-72 overflow-y-auto divide-y divide-neutral-200/60 no-scrollbar">
                          {favorites.map((product) => (
                            <div 
                              key={product.id}
                              className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-150/30 transition-colors group"
                            >
                              {/* Image thumbnail clickable to view details */}
                              <div 
                                onClick={() => {
                                  onViewProduct(product);
                                  setShowFavoritesMenu(false);
                                }}
                                className="w-12 h-12 bg-neutral-100 border border-neutral-300/40 rounded flex items-center justify-center p-1 shrink-0 cursor-pointer overflow-hidden group-hover:border-[#A37E2C] transition-all"
                              >
                                <img 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>

                              {/* Info clickable to view details */}
                              <div 
                                onClick={() => {
                                  onViewProduct(product);
                                  setShowFavoritesMenu(false);
                                }}
                                className="flex-1 min-w-0 cursor-pointer text-left"
                              >
                                <p className="text-xs font-bold text-[#131211] group-hover:text-[#A37E2C] transition-colors truncate">
                                  {product.name}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-mono">
                                  {product.categoryLabel}
                                </p>
                                <p className="text-xs font-serif font-black text-[#2E2218]">
                                  {formatPrice(product.price, currentLang)}
                                </p>
                              </div>

                              {/* Delete from favorites */}
                              <button
                                onClick={() => onToggleFavorite(product)}
                                className="p-1 px-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded cursor-pointer"
                                title={currentLang === "FR" ? "Retirer" : "Remove"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {favorites.length > 0 && (
                        <div className="px-4 py-2 pt-3 flex justify-between items-center text-[10px] bg-neutral-50/50 border-t border-neutral-250 shrink-0">
                          <span className="text-neutral-500 font-light font-mono">Maison Atlis Chamonix</span>
                          <button
                            onClick={() => {
                              const section = document.getElementById("products-catalog-section");
                              if (section) section.scrollIntoView({ behavior: "smooth" });
                              setShowFavoritesMenu(false);
                            }}
                            className="font-bold text-[#A37E2C] hover:underline uppercase tracking-wider cursor-pointer"
                          >
                            {currentLang === "FR" ? "Commander" : "Buy Now"}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

            {/* Shopping Cart Trigger */}
            <button
              id="cart-trigger-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-1 text-white/90 hover:text-[#A37E2C] cursor-pointer transition-colors"
              title={t.myCart}
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#1C2F22] text-[#FAF9F4] text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-[#FAF9F4] transition-all">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>
    </>
  );
}
