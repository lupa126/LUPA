import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import { ProductComparisonDock, ProductComparisonModal } from "./components/ProductComparison";
import CartDrawer from "./components/CartDrawer";
import FullCartDetailsModal from "./components/FullCartDetailsModal";
import ServiceDetailsModal from "./components/ServiceDetailsModal";
import Chatbot from "./components/Chatbot";
import AltisLogo from "./components/AltisLogo";
import AccountModal from "./components/AccountModal";
import { PRODUCTS } from "./data/products";
import { translateProductsList } from "./utils/translator";
import { TRANSLATIONS } from "./data/translations";
import { Product, CartItem } from "./types";
import { Sparkles, Award, Shield, Hammer, MapPin, Scale, X } from "lucide-react";

// Format price helper according to chosen language and currency
function formatRoundPrice(price: number, lang: string): string {
  const rounded = Math.round(price);
  if (lang === "CH") {
    return `${rounded.toLocaleString("de-CH")} CHF`;
  }
  if (lang === "EN") {
    return `£${rounded.toLocaleString("en-US")}`;
  }
  if (lang === "DE") {
    return `${rounded.toLocaleString("de-DE")} €`;
  }
  return `${rounded.toLocaleString("fr-FR")} €`;
}

// Normalization & Typo tolerance search functions
function cleanString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "");
}

function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j, val;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 1; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      val = a[i - 1] === b[j - 1] ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + val
      );
    }
  }
  return tmp[a.length][b.length];
}

function matchesProductWithTypos(product: Product, query: string): boolean {
  const normalizedQuery = cleanString(query).trim();
  if (!normalizedQuery) return true;

  const nameClean = cleanString(product.name || "");
  const descClean = cleanString(product.description || "");
  const catLabelClean = cleanString(product.categoryLabel || "");
  const catClean = cleanString(product.category || "");
  const specClean = cleanString(product.details?.join(" ") || "");

  const fullProductText = `${nameClean} ${descClean} ${catLabelClean} ${catClean} ${specClean}`;

  // 1. Direct substring match on the full text
  if (fullProductText.includes(normalizedQuery)) {
    return true;
  }

  // Also strip all spaces from both and check if query is a substring (handles "veloelectrique")
  const strippedProduct = fullProductText.replace(/\s+/g, "");
  const strippedQuery = normalizedQuery.replace(/\s+/g, "");
  if (strippedProduct.includes(strippedQuery)) {
    return true;
  }

  // 2. Word-by-word matching with typo tolerance (Levenshtein)
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  const productWords = fullProductText.split(/\s+/).filter(Boolean);

  // Check if ALL query words are matched by at least one product word (or substring of product text)
  const allWordsMatch = queryWords.every(qw => {
    // Is it a direct substring of the product name or full text?
    if (nameClean.includes(qw) || fullProductText.includes(qw)) {
      return true;
    }

    // Check Levenshtein distance against any word in the product
    for (const pw of productWords) {
      // Direct word-to-word match or startsWith / endsWith
      if (pw === qw || pw.startsWith(qw) || qw.startsWith(pw)) {
        return true;
      }

      // Levenshtein distance for typo tolerance
      const maxDist = qw.length > 5 ? 2 : qw.length > 3 ? 1 : 0;
      if (getLevenshteinDistance(qw, pw) <= maxDist) {
        return true;
      }
    }

    // Custom synonym matching (e.g., "velo" -> "vtt", "gravel", "cycling", "bike", "electrique", etc.)
    if (qw === "velo" || qw === "bike" || qw === "bicyclette" || qw === "cycling") {
      const bikeKeywords = ["velo", "vtt", "gravel", "cycling", "bike", "cyclisme", "bicyclette", "aerodynamisme"];
      if (bikeKeywords.some(bk => fullProductText.includes(bk))) {
        return true;
      }
    }

    return false;
  });

  return allWordsMatch;
}

const SUB_CATEGORIES: Record<string, Array<{ id: string; label: { FR: string; EN: string }; keywords: string[] }>> = {
  aerodynamisme: [
    { id: "electric", label: { FR: "Vélo Électrique", EN: "Electric Bike" }, keywords: ["electrique", "électrique", "assistance", "e-", "electric"] },
    { id: "gravel", label: { FR: "Gravel", EN: "Gravel" }, keywords: ["gravel", "grvl"] },
    { id: "route", label: { FR: "Vélo de Route", EN: "Road Bike" }, keywords: ["route", "rc", "course"] },
    { id: "vtt", label: { FR: "VTT (Tout Terrain)", EN: "Mountain Bike" }, keywords: ["vtt", "terrain", "rockrider", "st "] },
    { id: "ville", label: { FR: "Vélo de Ville & Pliant", EN: "City & Folding Bike" }, keywords: ["ville", "pliant", "elops", "tilt"] }
  ],
  "resistance-active": [
    { id: "tapis", label: { FR: "Tapis de Course", EN: "Treadmills" }, keywords: ["tapis", "course", "run", "treadmill"] },
    { id: "rameur", label: { FR: "Rameurs & Elliptiques", EN: "Rowers & Ellipticals" }, keywords: ["rameur", "elliptique", "rower"] },
    { id: "muscu", label: { FR: "Musculation & Poids", EN: "Strength & Weights" }, keywords: ["poids", "musculation", "haltère", "barre", "disque", "banc", "domyos"] },
    { id: "accessoires", label: { FR: "Accessoires & Yoga", EN: "Accessories & Yoga" }, keywords: ["tapis sol", "élastique", "ballon", "corde", "yoga", "pilates", "rouleau"] }
  ],
  "exploration-sauvage": [
    { id: "sac", label: { FR: "Sacs à Dos", EN: "Backpacks" }, keywords: ["sac", "backpack"] },
    { id: "tech", label: { FR: "Montres & GPS", EN: "Watches & GPS" }, keywords: ["montre", "gps", "coros", "boussole"] },
    { id: "chaussures", label: { FR: "Chaussures & Chaussettes", EN: "Footwear & Socks" }, keywords: ["chaussure", "botte", "chaussette", "shoes"] },
    { id: "vetements", label: { FR: "Vêtements & Vestes", EN: "Apparel & Jackets" }, keywords: ["veste", "polaire", "pantalon", "t-shirt", "chemise", "gant", "bonnet"] },
    { id: "bivouac", label: { FR: "Matériel de Bivouac", EN: "Camping & Hiking Gear" }, keywords: ["gourde", "bâton", "tente", "couchage", "matelas", "bouteille"] }
  ]
};

export default function App() {
  const [currentLang, setCurrentLang] = useState<string>("FR");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("atlis_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [fullCartOpen, setFullCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("atlis_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareWarning, setCompareWarning] = useState<string | null>(null);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<"garantie" | "personnalisation" | "tailles" | null>(null);
  
  // Interactive triggers for searching or advising
  const [chatbotOpenTrigger, setChatbotOpenTrigger] = useState(false);
  const [chatbotInitialPrompt] = useState("");
  const [activeOverlay, setActiveOverlay] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Navigation sport, page slicing limits, and search inputs
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [userMinPrice, setUserMinPrice] = useState<number | null>(null);
  const [userMaxPrice, setUserMaxPrice] = useState<number | null>(null);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  // Localize all products based on active language
  const localizedProducts = useMemo(() => {
    return translateProductsList(PRODUCTS, currentLang);
  }, [currentLang]);

  // Lock body scroll when modals/drawers are open
  useEffect(() => {
    const isAnyModalOpen =
      !!selectedProduct ||
      cartOpen ||
      fullCartOpen ||
      isCompareModalOpen ||
      !!selectedServiceDetail ||
      isAccountOpen;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [selectedProduct, cartOpen, fullCartOpen, isCompareModalOpen, selectedServiceDetail, isAccountOpen]);

  const isPLPActive = useMemo(() => !!catalogSearchQuery.trim() || selectedSport !== null, [catalogSearchQuery, selectedSport]);

  // Base products matching Sport and Search (the criteria other than current price range)
  const baseProductsForSliders = useMemo(() => {
    return localizedProducts.filter((p) => {
      const matchesSport = selectedSport ? p.category === selectedSport : true;
      const matchesSearch = catalogSearchQuery ? matchesProductWithTypos(p, catalogSearchQuery) : true;
      
      let matchesSubCategory = true;
      if (selectedSport && selectedSubCategory) {
        const subCats = SUB_CATEGORIES[selectedSport] || [];
        const activeSub = subCats.find((s) => s.id === selectedSubCategory);
        if (activeSub) {
          const titleLower = p.name.toLowerCase();
          const descLower = p.description ? p.description.toLowerCase() : "";
          const specLower = p.details ? p.details.join(" ").toLowerCase() : "";
          const fullText = `${titleLower} ${descLower} ${specLower}`;
          matchesSubCategory = activeSub.keywords.some((kw) => fullText.includes(kw));
        }
      }

      return matchesSport && matchesSearch && matchesSubCategory;
    });
  }, [localizedProducts, selectedSport, selectedSubCategory, catalogSearchQuery]);

  const basePrices = useMemo(() => baseProductsForSliders.map(p => p.price), [baseProductsForSliders]);
  const absoluteMinPrice = useMemo(() => basePrices.length > 0 ? Math.min(...basePrices) : 0, [basePrices]);
  const absoluteMaxPrice = useMemo(() => basePrices.length > 0 ? Math.max(...basePrices) : 3000, [basePrices]);

  const currentMinPrice = useMemo(() => userMinPrice !== null ? Math.max(absoluteMinPrice, Math.min(userMinPrice, absoluteMaxPrice)) : absoluteMinPrice, [userMinPrice, absoluteMinPrice, absoluteMaxPrice]);
  const currentMaxPrice = useMemo(() => userMaxPrice !== null ? Math.min(absoluteMaxPrice, Math.max(userMaxPrice, absoluteMinPrice)) : absoluteMaxPrice, [userMaxPrice, absoluteMaxPrice, absoluteMinPrice]);

  // Compute products list according to sport, search selections, and noble prices
  const filteredProducts = useMemo(() => {
    return localizedProducts.filter((p) => {
      const matchesSport = selectedSport ? p.category === selectedSport : true;
      const matchesSearch = catalogSearchQuery ? matchesProductWithTypos(p, catalogSearchQuery) : true;
      
      let matchesSubCategory = true;
      if (selectedSport && selectedSubCategory) {
        const subCats = SUB_CATEGORIES[selectedSport] || [];
        const activeSub = subCats.find((s) => s.id === selectedSubCategory);
        if (activeSub) {
          const titleLower = p.name.toLowerCase();
          const descLower = p.description ? p.description.toLowerCase() : "";
          const specLower = p.details ? p.details.join(" ").toLowerCase() : "";
          const fullText = `${titleLower} ${descLower} ${specLower}`;
          matchesSubCategory = activeSub.keywords.some((kw) => fullText.includes(kw));
        }
      }

      // Custom price range filtering
      const matchesPrice = p.price >= currentMinPrice && p.price <= currentMaxPrice;

      return matchesSport && matchesSearch && matchesSubCategory && matchesPrice;
    });
  }, [localizedProducts, selectedSport, selectedSubCategory, catalogSearchQuery, currentMinPrice, currentMaxPrice]);

  // Sort products based on criteria
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "reviews-desc") {
        const ratingA = a.reviews?.notation ?? 0;
        const ratingB = b.reviews?.notation ?? 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        const countA = a.reviews?.count ?? 0;
        const countB = b.reviews?.count ?? 0;
        return countB - countA;
      }
      return 0; // default order
    });
  }, [filteredProducts, sortBy]);

  // Limit default count to 6 only on homepage, show all on PLP for premium shopping ease
  const displayedProducts = useMemo(() => {
    return (isPLPActive || showAllProducts)
      ? sortedProducts
      : sortedProducts.slice(0, 6);
  }, [isPLPActive, showAllProducts, sortedProducts]);

  // References for navigation scroll
  const productsGridRef = useRef<HTMLDivElement>(null);
  const workshopRef = useRef<HTMLDivElement>(null);
  const heritageRef = useRef<HTMLDivElement>(null);

  const handleScrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAddToCart = useCallback((product: Product, size?: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += 1;
        updated[existingIdx].selected = true;
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1, selectedSize: size, selected: true }];
      }
    });
  }, []);

  const handleToggleSelectItem = useCallback((productId: string, size?: string) => {
    setCart((prevCart) => prevCart.map((item) => {
      if (item.product.id === productId && item.selectedSize === size) {
        return { ...item, selected: item.selected !== false ? false : true };
      }
      return item;
    }));
  }, []);

  const handleToggleAllItems = useCallback((select: boolean) => {
    setCart((prevCart) => prevCart.map((item) => ({ ...item, selected: select })));
  }, []);

  const handleUpdateCartQuantity = useCallback((
    productId: string,
    action: "increment" | "decrement",
    size?: string
  ) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === productId && item.selectedSize === size
      );

      if (existingIdx === -1) return prevCart;

      const updated = [...prevCart];
      if (action === "increment") {
        updated[existingIdx].quantity += 1;
      } else {
        updated[existingIdx].quantity -= 1;
        if (updated[existingIdx].quantity <= 0) {
          updated.splice(existingIdx, 1);
        }
      }
      return updated;
    });
  }, []);

  const handleRemoveCartItem = useCallback((productId: string, size?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
  }, []);

  const handleSearchSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleToggleFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const handleToggleCompare = useCallback((product: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        const width = typeof window !== "undefined" ? window.innerWidth || 375 : 375;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1200;
        const limitCount = isMobile ? 2 : isTablet ? 3 : 4;

        if (prev.length > 0) {
          const firstProduct = prev[0];
          if (firstProduct.category !== product.category) {
            setCompareWarning(
              currentLang === "FR"
                ? "Comparez uniquement des créations de même sport."
                : "Only compare items within the same sport category."
            );
            setTimeout(() => setCompareWarning(null), 4000);
            return prev;
          }
        }
        if (prev.length >= limitCount) {
          setCompareWarning(
            currentLang === "FR"
              ? isMobile
                ? "Sur mobile, vous pouvez comparer jusqu'à 2 créations."
                : isTablet
                  ? "Sur tablette, vous pouvez comparer jusqu'à 3 créations."
                  : "Vous pouvez comparer jusqu'à 4 créations à la fois."
              : isMobile
                ? "On mobile, you can compare up to 2 creations."
                : isTablet
                  ? "On tablet, you can compare up to 3 creations."
                  : "You can compare up to 4 creations at a time."
          );
          setTimeout(() => setCompareWarning(null), 4500);
          return prev;
        }
        return [...prev, product];
      }
    });
  }, [currentLang]);

  const handleSportSelect = useCallback((sport: string | null) => {
    setSelectedSport(sport);
    setSelectedSubCategory(null);
    setShowAllProducts(false); // Reset to compressed view when changing sports filter
    setTimeout(() => {
      handleScrollToSection(productsGridRef);
    }, 150);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF9F4] text-[#131211] selection:bg-[#A37E2C]/20 flex flex-col relative font-sans">
      
      {/* Header Overlay Lock Controls */}
      <Header
        onSearchSelect={handleSearchSelect}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        activeOverlay={activeOverlay}
        setActiveOverlay={setActiveOverlay}
        currentLang={currentLang}
        onLangChange={(lang) => setCurrentLang(lang)}
        onSportSelect={handleSportSelect}
        selectedSport={selectedSport}
        searchQuery={catalogSearchQuery}
        onSearchQueryChange={setCatalogSearchQuery}
        favorites={favorites}
        onViewProduct={(p) => setSelectedProduct(p)}
        onToggleFavorite={handleToggleFavorite}
        onOpenAccount={() => setIsAccountOpen(true)}
        onLogoClick={() => {
          setCatalogSearchQuery("");
          setSelectedSport(null);
          setShowAllProducts(false);
          setUserMinPrice(null);
          setUserMaxPrice(null);
          setSortBy("default");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Hero Header Area - Hidden when search is active like Amazon */}
      {!isPLPActive && (
        <Hero
          currentLang={currentLang}
          onSelectCategory={handleSportSelect}
        />
      )}

      {/* Main Page Content */}
      <main className="flex-1 w-full space-y-2">

        {/* Product Catalog Grid Section - Shown in beautiful restored 3-column layout on Homepage, and 4-column layout on PLP */}
        <section 
          id="products-catalog-section"
          ref={productsGridRef} 
          className="max-w-7xl mx-auto px-4 md:px-12 py-16 w-full scroll-mt-20 animate-fade-in"
        >
          {!isPLPActive ? (
            /* ================= HOMEPAGE VIEW: RESTORED 6 PREMIUM PRODUCTS ================= */
            <>
              {/* Premium Heritage Subheading Titles */}
              <div className="text-center space-y-3 mb-12">
                <p className="text-xs uppercase tracking-[0.25em] text-[#A37E2C] font-bold">
                  {t.heritageSub}
                </p>
                <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#131211]">
                  {t.heritageTitle}
                </h2>
                <div className="h-0.5 bg-[#A37E2C] w-16 mx-auto" />
              </div>

              {/* Grid showcasing exactly the first 6 products in high-contrast 3-columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {localizedProducts.slice(0, 6).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onViewDetails={(prod) => setSelectedProduct(prod)}
                    onAddToCart={(prod) => handleAddToCart(prod)}
                    currentLang={currentLang}
                    isComparing={comparedProducts.some((item) => item.id === p.id)}
                    onToggleCompare={handleToggleCompare}
                    isFavorite={favorites.some((item) => item.id === p.id)}
                    onToggleFavorite={(prod) => handleToggleFavorite(prod)}
                  />
                ))}
              </div>
            </>

          ) : (
            /* ================= PLP VIEW: ACTIVE SEARCH / SPORT FILTERING ================= */
            <>
              {/* Custom PLP Header inspired by the high contrast, negative space editorial homepage */}
              <div className="text-center space-y-4 mb-16 animate-fade-in">
                <div className="inline-flex items-center gap-2 border border-[#A37E2C]/30 bg-[#FAF9F4] px-4 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A37E2C] animate-pulse" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#A37E2C] font-extrabold font-mono">
                    {currentLang === "FR" ? "Recherche de Produits" : "Product Search"}
                  </span>
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#131211] tracking-tight">
                  {catalogSearchQuery 
                    ? (currentLang === "FR" ? `Collection relative à « ${catalogSearchQuery} »` : `Matches containing "${catalogSearchQuery}"`)
                    : selectedSport === "aerodynamisme"
                    ? (currentLang === "FR" ? "Atelier Vélo & Cyclisme" : "Cycling & Bike Atelier")
                    : selectedSport === "resistance-active"
                    ? (currentLang === "FR" ? "Atelier Fitness & Musculation" : "Fitness & Training Atelier")
                    : (currentLang === "FR" ? "Atelier Randonnée & Extérieur" : "Hiking & Outdoor Atelier")}
                </h2>
                
                <p className="text-xs text-neutral-500 font-sans font-light max-w-xl mx-auto leading-relaxed">
                  {currentLang === "FR"
                    ? "Découvrez nos équipements de sport alliant innovation technique, confort optimal et look haut de gamme."
                    : "Discover our sport gear combining technical innovation, optimal comfort, and premium style."}
                </p>
                <div className="h-0.5 bg-[#A37E2C] w-12 mx-auto" />
              </div>

              {/* TWO COLUMN PLP LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-left items-start">
                
                {/* LEFT COLUMN: Organized Luxury Filters Panel (Wider column layout for improved accessibility) */}
                <div className="md:col-span-4 space-y-10 bg-[#FAF9F4] p-8 md:p-9 border border-neutral-300/30 rounded-md shadow-sm animate-fade-in self-start">
                  
                  {/* Section 1: Active Stats & Header */}
                  <div className="border-b border-neutral-200 pb-6">
                    <h3 className="text-sm uppercase tracking-widest font-extrabold text-[#2E2218] mb-2">
                      {currentLang === "FR" ? "FILTRES DISPONIBLES" : "AVAILABLE FILTERS"}
                    </h3>
                    <p className="text-xs text-neutral-500 font-light">
                      {filteredProducts.length} {currentLang === "FR" ? "produit(s) disponible(s)" : "product(s) available"}
                    </p>
                  </div>

                  {/* Section 1.5: Product Comparison Atelier in filters */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#A37E2C] flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" />
                        <span>{currentLang === "FR" ? "COMPARAISON" : "PRODUCT COMPARISON"}</span>
                      </h4>
                      {comparedProducts.length > 0 && (
                        <button 
                          onClick={() => setComparedProducts([])}
                          className="text-xs lowercase font-normal underline hover:text-[#2E2218] text-[#A37E2C] cursor-pointer"
                        >
                          {currentLang === "FR" ? "réinitialiser" : "reset"}
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-white border-2 border-[#A37E2C]/20 rounded-md p-5 space-y-4 shadow-sm">
                      {comparedProducts.length === 0 ? (
                        <p className="text-sm xs:text-base text-neutral-800 font-bold leading-relaxed">
                          {currentLang === "FR" 
                            ? "Aucun produit sélectionné. Cliquez sur l'icône de balance ⚖️ sur les produits pour comparer."
                            : "No products selected. Click the scale icon ⚖️ on products to compare them."}
                        </p>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {comparedProducts.map((p) => (
                              <div key={p.id} className="relative group w-12 h-12 border border-neutral-300 rounded p-1 bg-neutral-50 shrink-0">
                                <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCompare(p);
                                  }}
                                  className="absolute -top-1.5 -right-1.5 bg-red-55 hover:bg-red-650 text-white rounded-full p-1 shadow-sm cursor-pointer"
                                  title={currentLang === "FR" ? "Retirer" : "Remove"}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-700 font-sans font-bold">
                            {comparedProducts.length} / {typeof window !== "undefined" ? (window.innerWidth < 768 ? 2 : window.innerWidth < 1200 ? 3 : 4) : 4} {currentLang === "FR" ? "produit(s) sélectionné(s)" : "product(s) selected"}
                          </p>
                        </>
                      )}

                      <button
                        onClick={() => setIsCompareModalOpen(true)}
                        disabled={comparedProducts.length < 2}
                        className={`w-full py-3.5 text-sm sm:text-base font-sans font-black uppercase tracking-wider transition-all rounded shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] ${
                          comparedProducts.length >= 2
                            ? "bg-[#A37E2C] hover:bg-[#8c6b24] text-white"
                            : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                        }`}
                      >
                        <Scale className="w-4.5 h-4.5" />
                        {currentLang === "FR" ? `Comparer maintenant` : `Compare Now`}
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Disciplines (Category Filter) */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#A37E2C] flex items-center justify-between">
                      <span>{currentLang === "FR" ? "DISCIPLINES" : "SPECIALTIES"}</span>
                      {(selectedSport || selectedSubCategory) && (
                        <button 
                          onClick={() => {
                            setSelectedSport(null);
                            setSelectedSubCategory(null);
                          }}
                          className="text-xs lowercase font-normal underline hover:text-[#2E2218] text-[#A37E2C]"
                        >
                          {currentLang === "FR" ? "effacer tout" : "clear all"}
                        </button>
                      )}
                    </h4>
                    <div className="flex flex-col gap-3">
                      {[
                        { id: null, label: currentLang === "FR" ? "Toutes les créations" : "All Specialties", count: localizedProducts.length },
                        { id: "aerodynamisme", label: currentLang === "FR" ? "Vélo" : "Bike & Cycling", count: localizedProducts.filter(p => p.category === "aerodynamisme").length },
                        { id: "resistance-active", label: currentLang === "FR" ? "Fitness" : "Fitness & Training", count: localizedProducts.filter(p => p.category === "resistance-active").length },
                        { id: "exploration-sauvage", label: currentLang === "FR" ? "Randonnée" : "Hiking & Outdoor", count: localizedProducts.filter(p => p.category === "exploration-sauvage").length }
                      ].map((item) => {
                        const isSelected = selectedSport === item.id;
                        const hasSubCats = item.id && SUB_CATEGORIES[item.id];
                        return (
                          <div key={item.id === null ? "all" : item.id} className="space-y-2">
                            <button
                              onClick={() => {
                                if (item.id === null) {
                                  setSelectedSport(null);
                                  setSelectedSubCategory(null);
                                } else {
                                  handleSportSelect(item.id);
                                }
                              }}
                              className={`w-full flex items-center justify-between py-3.5 px-4 rounded-md text-sm transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? "bg-[#2E2218] text-[#FAF9F4] font-bold shadow-md scale-[1.01]"
                                  : "text-neutral-700 bg-white/50 border border-neutral-200/50 hover:bg-neutral-200/60 hover:text-[#131211]"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <span className="tracking-wide">{item.label}</span>
                              </span>
                              <span className={`text-xs font-mono font-semibold ${isSelected ? "text-[#A37E2C]" : "text-neutral-400"}`}>
                                ({item.count})
                              </span>
                            </button>

                            {/* Sub-filters list rendered gracefully under selected sport category */}
                            {isSelected && hasSubCats && (
                              <div className="pl-4 pr-1 py-1.5 flex flex-col gap-1.5 border-l-2 border-[#A37E2C]/30 bg-[#FAF9F4]/30 rounded-r-md">
                                {SUB_CATEGORIES[item.id!].map((sub) => {
                                  const isSubSelected = selectedSubCategory === sub.id;
                                  const countSub = localizedProducts.filter(p => {
                                    if (p.category !== item.id) return false;
                                    const titleLower = p.name.toLowerCase();
                                    const descLower = p.description ? p.description.toLowerCase() : "";
                                    const specLower = p.details ? p.details.join(" ").toLowerCase() : "";
                                    const fullText = `${titleLower} ${descLower} ${specLower}`;
                                    return sub.keywords.some(kw => fullText.includes(kw));
                                  }).length;

                                  if (countSub === 0) return null;

                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => setSelectedSubCategory(isSubSelected ? null : sub.id)}
                                      className={`w-full text-left py-2 px-3 rounded-md text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                                        isSubSelected
                                          ? "bg-[#FAF9F4] border border-[#A37E2C] text-[#2E2218] font-bold shadow-sm"
                                          : "text-neutral-600 hover:bg-neutral-100 hover:text-[#131211]"
                                      }`}
                                    >
                                      <span>{currentLang === "FR" ? sub.label.FR : sub.label.EN}</span>
                                      <span className="text-[10px] font-mono opacity-60">({countSub})</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Fine Sorting */}
                  <div className="space-y-4 pt-4 border-t border-neutral-200">
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#A37E2C]">
                      {currentLang === "FR" ? "TRIER LES PRODUITS" : "SORT PRODUCTS"}
                    </h4>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-md px-4 py-3 text-sm text-[#2E2218] focus:outline-none focus:border-[#A37E2C] focus:ring-1 focus:ring-[#A37E2C] shadow-sm font-sans cursor-pointer h-12"
                      >
                        <option value="default">{currentLang === "FR" ? "Ordre par défaut" : "Default order"}</option>
                        <option value="price-asc">{currentLang === "FR" ? "Prix : Ordre croissant" : "Price: Low to High"}</option>
                        <option value="price-desc">{currentLang === "FR" ? "Prix : Ordre décroissant" : "Price: High to Low"}</option>
                        <option value="reviews-desc">{currentLang === "FR" ? "Avis : Les mieux notés" : "Reviews: Highest Rated"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 4: Fine Luxury Price Filter range with custom dual range slider */}
                  <div className="space-y-5 pt-4 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#A37E2C]">
                        {currentLang === "FR" ? "SÉLECTIONNER UN BUDGET" : "CHOOSE BUDGET"}
                      </h4>
                      {(userMinPrice !== null || userMaxPrice !== null) && (
                        <button 
                          onClick={() => {
                            setUserMinPrice(null);
                            setUserMaxPrice(null);
                          }}
                          className="text-xs lowercase font-normal underline hover:text-[#2E2218] text-[#A37E2C]"
                        >
                          {currentLang === "FR" ? "réinitialiser" : "reset"}
                        </button>
                      )}
                    </div>
                    
                    {/* Price range summary */}
                    <div className="text-sm font-extrabold text-[#2E2218] flex items-center justify-between font-mono bg-white px-3 py-2 rounded border border-neutral-200/60 shadow-inner">
                      <span>{formatRoundPrice(currentMinPrice, currentLang)}</span>
                      <span className="text-neutral-300 font-normal">—</span>
                      <span>{formatRoundPrice(currentMaxPrice, currentLang)}</span>
                    </div>

                    {/* Highly polished, responsive dual range slider with larger touch targets */}
                    <div className="relative w-full h-8 pt-2 select-none">
                      {/* Track background */}
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-neutral-200 rounded-full" />
                      
                      {/* Selected range highlight */}
                      <div 
                        className="absolute h-1.5 bg-[#A37E2C] rounded-full top-1/2 -translate-y-1/2"
                        style={{
                          left: `${((currentMinPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100}%`,
                          right: `${100 - ((currentMaxPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice || 1)) * 100}%`
                        }}
                      />

                      {/* Minimum handle */}
                      <input
                        id="prices-slider-min"
                        type="range"
                        min={absoluteMinPrice}
                        max={absoluteMaxPrice}
                        value={currentMinPrice}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), currentMaxPrice);
                          setUserMinPrice(val);
                        }}
                        className="absolute w-full h-1.5 top-1/2 -translate-y-1/2 bg-transparent appearance-none pointer-events-none focus:outline-none accent-[#A37E2C] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2E2218] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FAF9F4] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#2E2218] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FAF9F4] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto"
                      />

                      {/* Maximum handle */}
                      <input
                        id="prices-slider-max"
                        type="range"
                        min={absoluteMinPrice}
                        max={absoluteMaxPrice}
                        value={currentMaxPrice}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), currentMinPrice);
                          setUserMaxPrice(val);
                        }}
                        className="absolute w-full h-1.5 top-1/2 -translate-y-1/2 bg-transparent appearance-none pointer-events-none focus:outline-none accent-[#A37E2C] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A37E2C] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FAF9F4] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#A37E2C] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FAF9F4] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto"
                      />
                    </div>

                    {/* Dynamic boundaries helpers */}
                    <div className="flex justify-between items-center text-xs text-[#A37E2C] font-mono mt-1 select-none">
                      <span>Min: {formatRoundPrice(absoluteMinPrice, currentLang)}</span>
                      <span>Max: {formatRoundPrice(absoluteMaxPrice, currentLang)}</span>
                    </div>
                  </div>

                  {/* Section 5: Master Artisan Concierge Invitation */}
                  <div className="pt-8 border-t border-neutral-200 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-xl border border-neutral-200">
                      🤝
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#A37E2C] uppercase tracking-wider">
                        {currentLang === "FR" ? "ASSISTANT VIRTUEL" : "VIRTUAL ASSISTANT"}
                      </p>
                      <p className="text-xs text-neutral-750 font-medium leading-normal font-sans mt-1.5 px-2">
                        {currentLang === "FR" 
                          ? "Besoin d'aide pour trouver un produit ? Posez vos questions à notre assistant." 
                          : "Need help finding a product? Ask our assistant."}
                      </p>
                    </div>
                    <button
                      onClick={() => setChatbotOpenTrigger(true)}
                      className="w-full py-3 bg-white hover:bg-[#2E2218] hover:text-[#FAF9F4] text-[#2E2218] border border-neutral-300 rounded text-xs uppercase tracking-widest font-extrabold transition-all duration-300 cursor-pointer shadow-sm hover:scale-102"
                    >
                      {currentLang === "FR" ? "LANCER L'ASSISTANT" : "START CHAT"}
                    </button>
                  </div>

                </div>

                {/* RIGHT COLUMN: The Products displaying with high performance organisation */}
                <div className="md:col-span-8 space-y-10">
                  
                  {/* Active Selection Breadcrumbs / Filter Tags Pillboxes feedback bar */}
                  <div className="bg-white border border-neutral-300/20 py-3.5 px-5 flex flex-wrap items-center justify-between gap-4 rounded-sm shadow-sm select-none">
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="text-neutral-400 font-light mr-1">
                        {currentLang === "FR" ? "Sélection actuelle :" : "Active criteria:"}
                      </span>
                      


                      {/* Sport Tag */}
                      {selectedSport && (
                        <span className="bg-[#A37E2C] text-[#FAF9F4] px-2.5 py-1 rounded-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                          <span>
                            {selectedSport === "aerodynamisme"
                              ? (currentLang === "FR" ? "Vélo" : "Bike & Cycling")
                              : selectedSport === "resistance-active"
                              ? (currentLang === "FR" ? "Fitness" : "Fitness & Training")
                              : (currentLang === "FR" ? "Randonnée" : "Hiking & Outdoor")}
                          </span>
                          <button onClick={() => setSelectedSport(null)} className="hover:text-white text-xs font-bold font-mono">×</button>
                        </span>
                      )}

                      {/* Price tag */}
                      {(userMinPrice !== null || userMaxPrice !== null) && (
                        <span className="bg-neutral-100 text-[#131211] border border-neutral-300/30 px-2.5 py-1 rounded-sm font-semibold flex items-center gap-2">
                          <span>
                            {formatRoundPrice(currentMinPrice, currentLang)} — {formatRoundPrice(currentMaxPrice, currentLang)}
                          </span>
                          <button onClick={() => { setUserMinPrice(null); setUserMaxPrice(null); }} className="hover:text-[#A37E2C] text-xs font-bold font-mono">×</button>
                        </span>
                      )}

                      {/* Default clear indicators */}
                      {!catalogSearchQuery.trim() && !selectedSport && userMinPrice === null && userMaxPrice === null && (
                        <span className="text-neutral-500 italic font-mono font-medium lowercase">
                          {currentLang === "FR" ? "tous les produits sont affichés" : "all products showing"}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] font-mono tracking-widest text-[#A37E2C] uppercase font-bold">
                      {filteredProducts.length} {currentLang === "FR" ? "RÉSULTATS" : "RESULTS"}
                    </div>
                  </div>

                  {/* The structured e-commerce product grid - beautiful 3 columns inside the right area */}
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                      {displayedProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onViewDetails={(prod) => setSelectedProduct(prod)}
                          onAddToCart={(prod) => handleAddToCart(prod)}
                          currentLang={currentLang}
                          isComparing={comparedProducts.some((item) => item.id === p.id)}
                          onToggleCompare={handleToggleCompare}
                          isFavorite={favorites.some((item) => item.id === p.id)}
                          onToggleFavorite={(prod) => handleToggleFavorite(prod)}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Elegant and immersive luxury empty state */
                    <div className="bg-neutral-50 border border-dashed border-neutral-300/35 py-16 px-8 text-center space-y-6 rounded-md">
                      <div className="text-4xl">🕊️</div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-serif font-semibold text-[#131211]">
                          {currentLang === "FR" ? "Aucun produit trouvé" : "No product found"}
                        </h4>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                          {currentLang === "FR"
                            ? "Aucun article ne correspond à vos filtres actuels. Essayez de réinitialiser vos critères ou demandez conseil à notre assistant virtuel."
                            : "No items match your active filters. Try to reset your criteria or seek assistance from our virtual helper."}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedSport(null);
                            setCatalogSearchQuery("");
                            setUserMinPrice(null);
                            setUserMaxPrice(null);
                            setSortBy("default");
                          }}
                          className="px-5 py-2.5 bg-[#2E2218] text-[#FAF9F4] text-[10px] uppercase tracking-wider font-extrabold shadow-sm hover:scale-102 transition-all cursor-pointer rounded-sm"
                        >
                          {currentLang === "FR" ? "RÉINITIALISER TOUT" : "CLEAR CRITERIA"}
                        </button>
                        <button
                          onClick={() => setChatbotOpenTrigger(true)}
                          className="px-5 py-2.5 bg-white border border-[#2E2218] text-[#2E2218] text-[10px] uppercase tracking-wider font-extrabold hover:bg-neutral-50 shadow-sm hover:scale-102 transition-all cursor-pointer rounded-sm"
                        >
                          {currentLang === "FR" ? "POSER UNE QUESTION" : "ASK A QUESTION"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Slicing / Showing more Controls matching home page style */}
                  {filteredProducts.length > displayedProducts.length && (
                    <div className="mt-14 text-center space-y-4 animate-fade-in">
                      <div className="text-[9px] font-mono tracking-widest text-[#A37E2C] font-extrabold uppercase select-none">
                        {currentLang === "FR" 
                          ? `Affichage de ${displayedProducts.length} sur ${filteredProducts.length} pièces d'exception`
                          : `Showing ${displayedProducts.length} out of ${filteredProducts.length} master models`}
                      </div>
                    </div>
                  )}

                  {/* Elegant Back to Homepage exit mechanism */}
                  <div className="flex flex-col items-center justify-center pt-16 border-t border-neutral-250/20 mt-16 space-y-4 bg-[#FAF9F4]/45 p-10 rounded-sm">
                    <p className="text-[10px] tracking-[0.2em] font-sans font-light text-neutral-400">
                      {currentLang === "FR" ? "Vous avez fini votre recherche ?" : "Finished with your custom search?"}
                    </p>
                    <button
                      onClick={() => {
                        setCatalogSearchQuery("");
                        setSelectedSport(null);
                        setUserMinPrice(null);
                        setUserMaxPrice(null);
                        setSortBy("default");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-8 py-3.5 bg-[#FAF9F4] border border-[#2E2218] text-[#2E2218] hover:bg-[#2E2218] hover:text-[#FAF9F4] tracking-[0.2em] text-[10px] uppercase font-bold transition-all cursor-pointer shadow-sm hover:scale-102 rounded-sm"
                    >
                      ← {currentLang === "FR" ? "REVENIR À L'ACCUEIL" : "BACK TO HOMEPAGE"}
                    </button>
                  </div>

                </div>

              </div>
            </>
          )}
        </section>

      {/* Section: Maison Atlis Heritage - NOW MUCH MORE ACCESSIBLE */}
      {!isPLPActive && (
        <section 
          ref={heritageRef}
          className="bg-[#2E2218] text-[#FAF9F4] py-20 px-4 md:px-12 w-full border-t border-white/5"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-sm sm:text-base uppercase tracking-[0.3em] text-[#A37E2C] font-bold block">
                {currentLang === "FR" ? "NOTRE HISTOIRE DEPUIS 1924" : "OUR HISTORY SINCE 1924"}
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
                {currentLang === "FR" 
                  ? "Créateurs de vêtements et d'équipements de sport à Chamonix"
                  : "Creators of high-performance sportswear and equipment in Chamonix"}
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans font-light">
                {currentLang === "FR"
                  ? "Née à Chamonix lors des mémorables Jeux Olympiques d'hiver de 1924, la Maison Atlis incarne l'alliance parfaite entre hautes performances sportives et finitions soignées. Tous nos vélos et vêtements techniques sont fabriqués pour vous garantir un confort thermique optimal et une liberté de mouvement maximale."
                  : "Founded in Chamonix during the historic 1924 Winter Olympics, Maison Atlis represents the perfect association of high performance and elegant tailoring. Our custom cycling frames and technical garments are carefully made to ensure optimal temperature control and complete freedom of motion."}
              </p>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-serif text-[#A37E2C] font-black">1924</p>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 font-bold">Fondation</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-serif text-[#A37E2C] font-black">100%</p>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 font-bold">Main d'œuvre</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-serif text-[#A37E2C] font-black">UTC+1</p>
                  <p className="text-xs sm:text-sm uppercase tracking-wider text-zinc-300 font-bold">Origine Alpes</p>
                </div>
              </div>
            </div>

            {/* Illustrated graphic card frame */}
            <div className="relative aspect-[4/3] bg-neutral-900 border border-white/10 overflow-hidden group shadow-2xl">
              <img
                src="https://contents.mediadecathlon.com/p2500724/k$12e175a896fb0390b6a21d0ddef5c821/picture.jpg"
                alt="Atelier d'excellence Chamonix 1924"
                className="w-full h-full object-cover filter brightness-[0.6] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 space-y-2 text-center rounded">
                <Award className="w-5 h-5 text-[#A37E2C] mx-auto" />
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] font-bold text-[#A37E2C]">La Chaux-de-Fonds & Chamonix</p>
                <p className="text-sm sm:text-base text-zinc-200">
                  {currentLang === "FR" ? "Ateliers de couture et d'unification mécanique" : "Textile tailoring & mechanical alignment workshops"}
                </p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Section: Maison Atlis Private Service Atelier */}
      {!isPLPActive && (
        <section 
          ref={workshopRef}
          className="max-w-7xl mx-auto px-4 md:px-12 py-20 w-full text-center space-y-10"
        >
          <div className="space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#A37E2C] font-black">
              {currentLang === "FR" ? "VOTRE MATÉRIEL PERSONNALISÉ" : "YOUR CUSTOM GEAR"}
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#131211]">
              {currentLang === "FR" ? "Un Service et un Accompagnement Dédiés" : "Specialized Services & Consultation"}
            </h2>
            <div className="h-0.5 bg-[#A37E2C] w-12 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Service 1 */}
            <div 
              onClick={() => setSelectedServiceDetail("garantie")}
              className="p-6 bg-white border border-neutral-300/30 hover:border-[#A37E2C]/60 space-y-4 rounded shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#A37E2C]/10 group-hover:bg-[#A37E2C]/20 flex items-center justify-center text-[#A37E2C] transition-colors rounded">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#131211] group-hover:text-[#A37E2C] transition-colors flex items-center justify-between">
                <span>{currentLang === "FR" ? "Garantie et Service Client" : "Customer Support & Warranty"}</span>
                <span className="text-xs text-[#A37E2C] opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                {currentLang === "FR"
                  ? "Tous nos équipements sont garantis de par leur excellence. Cliquez pour ouvrir notre assistance de proximité et vérifier de vos contrats."
                  : "All of our products are fully warrantied and benefit from local customer assistance for absolute satisfaction. Click to inspect your contract."}
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs sm:text-sm text-[#A37E2C] font-mono tracking-widest font-black uppercase">
                <span>{currentLang === "FR" ? "Voir la Garantie" : "Inspect Warranty"}</span>
                <span>→</span>
              </div>
            </div>

            {/* Service 2 */}
            <div 
              onClick={() => setSelectedServiceDetail("personnalisation")}
              className="p-6 bg-white border border-neutral-300/30 hover:border-[#A37E2C]/60 space-y-4 rounded shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#A37E2C]/10 group-hover:bg-[#A37E2C]/20 flex items-center justify-center text-[#A37E2C] transition-colors rounded">
                <Hammer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#131211] group-hover:text-[#A37E2C] transition-colors flex items-center justify-between">
                <span>{currentLang === "FR" ? "Personnalisation Unique" : "Customization"}</span>
                <span className="text-xs text-[#A37E2C] opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                {currentLang === "FR"
                  ? "Ajoutez vos initiales ou logos personnalisés sur vos cadres de vélos, sacs et vêtements. Cliquez pour essayer notre outil de gravure."
                  : "Add your initials or custom logos to your cycling frames, bags, or apparel. Click to open our live embroidery and engraving workshop."}
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs sm:text-sm text-[#A37E2C] font-mono tracking-widest font-black uppercase">
                <span>{currentLang === "FR" ? "Lancer l'Atelier" : "Open Workshop"}</span>
                <span>→</span>
              </div>
            </div>

            {/* Service 3 */}
            <div 
              onClick={() => setSelectedServiceDetail("tailles")}
              className="p-6 bg-white border border-neutral-300/30 hover:border-[#A37E2C]/60 space-y-4 rounded shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#A37E2C]/10 group-hover:bg-[#A37E2C]/20 flex items-center justify-center text-[#A37E2C] transition-colors rounded">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-[#131211] group-hover:text-[#A37E2C] transition-colors flex items-center justify-between">
                <span>{currentLang === "FR" ? "Conseils pour les Tailles" : "Size Advisors"}</span>
                <span className="text-xs text-[#A37E2C] opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                {currentLang === "FR"
                  ? "Choisissez la taille idéale à l'aide de notre conseiller biomec interactif en adaptant les côtes géométriques à vos mesures corporelles."
                  : "Choose the perfect size for your bike frame, clothing, or footwear. Click to open our instant physiological scale calculator."}
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs sm:text-sm text-[#A37E2C] font-mono tracking-widest font-black uppercase">
                <span>{currentLang === "FR" ? "Calculer ma Taille" : "Calculate My Size"}</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </section>
      )}

      </main>

      {/* Footer Area */}
      <footer className="bg-[#131211] text-[#FAF9F4]/70 border-t border-white/5 py-12 px-4 md:px-12 w-full text-xs font-sans tracking-wide">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AltisLogo className="w-6 h-6 text-[#A37E2C]" />
              <span className="text-lg font-serif font-bold text-white tracking-[0.2em] uppercase">ATLIS S.C.</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">
              {currentLang === "FR"
                ? "L'excellence athlétique, l'art plastique de Chamonix — Inspiré par l'Olympe depuis 1924."
                : "Athletic excellence, plastic art form of Chamonix — Inspired by Olympus since index 1924."}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#A37E2C] font-extrabold">Ateliers & Salons</p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#A37E2C]" /> Chamonix-Mont-Blanc</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#A37E2C]" /> Place Vendôme, Paris</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#A37E2C]" /> Bahnhofstrasse, Zürich</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#A37E2C] font-extrabold">Assistance</p>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
              <li><button onClick={() => setChatbotOpenTrigger(true)} className="hover:text-white transition-colors cursor-pointer text-left">Contacter un conseiller d'Olympe</button></li>
              <li>{currentLang === "FR" ? "Politique de confidentialité" : "Privacy Policies"}</li>
              <li>{currentLang === "FR" ? "Conditions d'Acquisition" : "Acquisition Agreements"}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#A37E2C] font-extrabold">Notre Gazette</p>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {currentLang === "FR" ? "Recevez confidentiellement les récits de nos expéditions." : "Receive confidential records of our seasonal wild routes."}
            </p>
            <div className="flex border border-white/10 overflow-hidden focus-within:border-[#A37E2C] transition-colors rounded">
              <input 
                type="email" 
                placeholder="courriel@domaine.com" 
                className="bg-transparent text-white px-3.5 py-2 text-xs sm:text-sm focus:outline-none w-full"
              />
              <button className="bg-[#A37E2C] hover:bg-[#BC9C52] text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer">OK</button>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-6 text-xs tracking-widest text-[#FAF9F4]/50 flex flex-col md:flex-row md:justify-between items-center gap-4 max-w-7xl mx-auto md:pr-28">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
            <span>© {new Date().getFullYear()} MAISON ATLIS SPORT COUTURE. TOUS DROITS RÉSERVÉS.</span>
            <span className="hidden md:inline text-zinc-600 font-serif">|</span>
            <span className="font-serif italic text-zinc-400 text-sm sm:text-base md:text-lg">« Plus vite, plus haut, plus fort — ensemble »</span>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Drawer Side Case */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        currentLang={currentLang}
        onOpenFullCart={() => {
          setCartOpen(false);
          setFullCartOpen(true);
        }}
      />

      {/* Full Detailed Screen Overlay Box Case */}
      <FullCartDetailsModal
        isOpen={fullCartOpen}
        onClose={() => setFullCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onToggleSelectItem={handleToggleSelectItem}
        onToggleAllItems={handleToggleAllItems}
        currentLang={currentLang}
      />

      {/* Product Details Sheet Overlay Case */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, s) => handleAddToCart(p, s)}
        currentLang={currentLang}
        isFavorite={selectedProduct ? favorites.some((item) => item.id === selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Service Deep-Dive Overlay Cases */}
      <ServiceDetailsModal
        isOpen={!!selectedServiceDetail}
        onClose={() => setSelectedServiceDetail(null)}
        serviceType={selectedServiceDetail}
        currentLang={currentLang}
      />

      {/* Account / Profile Space */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentLang={currentLang}
      />

      {/* Artificial Intelligence Artisan Guide */}
      <Chatbot
        currentLang={currentLang}
        itemsInCart={cartCount}
        featuredProducts={localizedProducts}
        onSelectProduct={(p) => setSelectedProduct(p)}
        openTrigger={chatbotOpenTrigger}
        onClearTrigger={() => setChatbotOpenTrigger(false)}
        initialPrompt={chatbotInitialPrompt}
      />

      {/* Product Comparison Atelier */}
      <ProductComparisonDock
        comparedProducts={comparedProducts}
        currentLang={currentLang}
        onRemove={handleToggleCompare}
        onClearAll={() => setComparedProducts([])}
        onCompareNow={() => setIsCompareModalOpen(true)}
        warningMessage={compareWarning}
      />

      <ProductComparisonModal
        comparedProducts={comparedProducts}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemove={handleToggleCompare}
        onAddToCart={(p, s) => {
          handleAddToCart(p, s);
          setIsCompareModalOpen(false);
        }}
        onViewDetails={(p) => setSelectedProduct(p)}
        currentLang={currentLang}
      />

    </div>
  );
}
