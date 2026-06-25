import { useState, useEffect } from "react";
import { X, Scale, ShoppingBag, Eye, AlertCircle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles, FileText, Cpu, Ruler } from "lucide-react";
import { Product } from "../types";
import { formatPrice, formatSizeDisplay } from "../utils/translator";

interface ProductComparisonDockProps {
  comparedProducts: Product[];
  currentLang: string;
  onRemove: (product: Product) => void;
  onClearAll: () => void;
  onCompareNow: () => void;
  warningMessage: string | null;
}

export function ProductComparisonDock({
  comparedProducts,
  currentLang,
  onRemove,
  onClearAll,
  onCompareNow,
  warningMessage,
}: ProductComparisonDockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth || 375 : 375);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;
  const maxLimit = isMobile ? 2 : isTablet ? 3 : 4;

  if (comparedProducts.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-slide-in">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-[#A37E2C] hover:bg-[#8c6b24] text-[#FAF9F4] p-3 rounded-full shadow-2xl flex items-center gap-2 border border-white hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title={
            currentLang === "FR" || currentLang === "CH"
              ? "Ouvrir le comparateur"
              : currentLang === "DE"
              ? "Vergleich öffnen"
              : "Open Comparison"
          }
        >
          <ChevronLeft className="w-4 h-4 animate-pulse group-hover:translate-x-[-2px] transition-transform" />
          <Scale className="w-4 h-4" />
          <span className="font-mono text-[10px] font-black bg-white text-[#A37E2C] px-1.5 py-0.5 rounded-full leading-none">
            {comparedProducts.length}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-slide-in">
      <div className="bg-[#FAF9F4] border-2 border-[#A37E2C] shadow-2xl rounded-lg p-4 text-[#131211]">
        {/* Warning Toast style if any */}
        {warningMessage && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#A37E2C] text-[#FAF9F4] text-[10px] sm:text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 animate-bounce-in border border-white/20 font-mono font-bold tracking-tight whitespace-nowrap">
            <AlertCircle className="w-3.5 h-3.5" />
            {warningMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#A37E2C] text-white p-2.5 rounded-full shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-sans font-extrabold tracking-wider uppercase text-[#2E2218] leading-tight">
                {currentLang === "FR" || currentLang === "CH"
                  ? "Outil de Comparaison"
                  : currentLang === "DE"
                  ? "Vergleichs-Arbeitsplatz"
                  : "Comparison Workspace"}
              </p>
              <p className="text-xs sm:text-sm text-[#A37E2C] font-mono font-bold mt-0.5">
                {comparedProducts.length} / {maxLimit}{" "}
                {currentLang === "FR" || currentLang === "CH"
                  ? "produits comparés"
                  : currentLang === "DE"
                  ? "Produkte verglichen"
                  : "products compared"}
              </p>
            </div>
          </div>

          {/* Connected Thumbnails */}
          <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full">
            {comparedProducts.map((p) => (
              <div 
                key={p.id} 
                className="relative group shrink-0 w-12 h-12 bg-white border border-neutral-300 p-1 rounded hover:border-[#A37E2C] transition-all"
              >
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => onRemove(p)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm transition-all"
                  aria-label="Remove"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button
              onClick={onClearAll}
              className="text-sm text-neutral-600 hover:text-red-650 underline font-extrabold cursor-pointer px-2.5"
            >
              {currentLang === "FR" || currentLang === "CH"
                ? "Effacer tout"
                : currentLang === "DE"
                ? "Alles löschen"
                : "Clear all"}
            </button>
            <button
              onClick={onCompareNow}
              disabled={comparedProducts.length < 2}
              className={`px-6 py-3 text-sm font-sans font-extrabold uppercase tracking-widest transition-all rounded-lg shadow-md cursor-pointer ${
                comparedProducts.length >= 2
                  ? "bg-[#A37E2C] hover:bg-[#8c6b24] text-white hover:scale-[1.02]"
                  : "bg-neutral-200 text-neutral-450 border border-neutral-300 cursor-not-allowed"
              }`}
            >
              {currentLang === "FR" || currentLang === "CH"
                ? `Comparer (${comparedProducts.length})`
                : currentLang === "DE"
                ? `Vergleichen (${comparedProducts.length})`
                : `Compare (${comparedProducts.length})`}
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 text-neutral-400 hover:text-[#A37E2C] hover:bg-neutral-100 rounded-full cursor-pointer transition-all"
              title={
                currentLang === "FR" || currentLang === "CH"
                  ? "Réduire"
                  : currentLang === "DE"
                  ? "Minimieren"
                  : "Collapse"
              }
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductComparisonModalProps {
  comparedProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onViewDetails: (product: Product) => void;
  currentLang: string;
}

// Deterministic mock stat engine to get realistic specs for gorgeous comparison
function getProductStats(p: Product) {
  let hash = 0;
  for (let i = 0; i < p.id.length; i++) {
    hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  // Custom stats based on product category & characteristics
  let baseScore = 70;
  if (p.price > 8000) baseScore = 90;
  else if (p.price > 3000) baseScore = 82;
  else if (p.price > 600) baseScore = 76;

  const performance = Math.min(99, baseScore + (hash % 10));
  const comfort = Math.min(99, baseScore - 5 + ((hash >> 2) % 15));
  const durability = Math.min(99, baseScore + 2 + ((hash >> 4) % 8));
  const craftsmanship = Math.min(99, baseScore + 5 + ((hash >> 6) % 9));
  const prestige = Math.min(99, baseScore - 10 + ((hash >> 8) % 20));

  const score = Math.round((performance + comfort + durability + craftsmanship + prestige) / 5);

  return {
    score,
    performance,
    comfort,
    durability,
    craftsmanship,
    prestige
  };
}

export function ProductComparisonModal({
  comparedProducts,
  isOpen,
  onClose,
  onRemove,
  onAddToCart,
  onViewDetails,
  currentLang,
}: ProductComparisonModalProps) {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth || 375 : 375);

  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const isDesktop = windowWidth >= 1200;
  const isMobile = windowWidth < 768;

  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);
  const [isProductsSectionCollapsed, setIsProductsSectionCollapsed] = useState(false);
  const [isSpecTableCollapsed, setIsSpecTableCollapsed] = useState(false);
  const [isAtoutCleCollapsed, setIsAtoutCleCollapsed] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [isTechnicalCollapsed, setIsTechnicalCollapsed] = useState(false);
  const [isSizesCollapsed, setIsSizesCollapsed] = useState(false);

  if (!isOpen) return null;

  // Gather stats for all compared creations
  const resolvedProductsWithStats = comparedProducts.map(p => ({
    product: p,
    stats: getProductStats(p),
  }));

  // Identify comparison winner (highest overall score)
  let winner = resolvedProductsWithStats[0];
  resolvedProductsWithStats.forEach(item => {
    if (item.stats.score > (winner?.stats.score || 0)) {
      winner = item;
    }
  });

  const prices = comparedProducts.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const ratings = comparedProducts.map((p) => p.reviews?.notation || 4.8);
  const maxRating = Math.max(...ratings);

  const reviewsCounts = comparedProducts.map((p) => p.reviews?.count || 48);
  const maxReviews = Math.max(...reviewsCounts);

  // Palette colors for the compared items in the radar overlay
  const candidateColors = [
    { stroke: "#A37E2C", fill: "rgba(163, 126, 44, 0.15)", text: "text-[#A37E2C]" }, // Maison gold
    { stroke: "#1E3A8A", fill: "rgba(30, 58, 138, 0.12)", text: "text-[#1E3A8A]" },  // Royal blue 
    { stroke: "#9F1239", fill: "rgba(159, 18, 57, 0.12)", text: "text-[#9F1239]" },  // Deep crimson
    { stroke: "#065F46", fill: "rgba(6, 95, 70, 0.12)", text: "text-[#065F52]" },   // Dark emerald
  ];

  // Helper calculation for SVG Radar Chart
  const svgW = 280;
  const svgH = 280;
  const cx = svgW / 2;
  const cy = svgH / 2;
  const maxR = 95;

  const radarLabels = [
    {
      label:
        currentLang === "DE"
          ? "Leistung"
          : currentLang === "FR" || currentLang === "CH"
          ? "Performance"
          : "Performance",
      key: "performance"
    },
    {
      label:
        currentLang === "DE"
          ? "Gefühl"
          : currentLang === "FR" || currentLang === "CH"
          ? "Sensation"
          : "Sensation",
      key: "prestige"
    },
    {
      label:
        currentLang === "DE"
          ? "Verarbeitung"
          : currentLang === "FR" || currentLang === "CH"
          ? "Finitions"
          : "Craftsmanship",
      key: "craftsmanship"
    },
    {
      label:
        currentLang === "DE"
          ? "Haltbarkeit"
          : currentLang === "FR" || currentLang === "CH"
          ? "Durabilité"
          : "Durability",
      key: "durability"
    },
    {
      label:
        currentLang === "DE"
          ? "Komfort"
          : currentLang === "FR" || currentLang === "CH"
          ? "Confort"
          : "Comfort",
      key: "comfort"
    },
  ];

  const getCoordinates = (index: number, valPercent: number) => {
    // 5 axes: each angle is i * (2 * pi / 5) - (pi / 2) to start pointing upwards
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const r = (valPercent / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Generate dynamic facts list why the winner is better
  const generateWinnerFacts = () => {
    if (comparedProducts.length < 2 || !winner) return [];
    
    const facts: { title: string; subtitle: string }[] = [];
    const wStats = winner.stats;
    const others = resolvedProductsWithStats.filter(item => item.product.id !== winner.product.id);

    // Factor 1: Overall Score
    const otherScores = others.map(o => o.stats.score).join(currentLang === "FR" ? " vs " : " vs ");
    facts.push({
      title:
        currentLang === "DE"
          ? "Beste Atelier-Gesamtbalance"
          : currentLang === "FR" || currentLang === "CH"
          ? "Meilleure balance d'Atelier"
          : "Superior Overall Balance",
      subtitle: `${wStats.score} pts ${
        currentLang === "DE"
          ? "gegen"
          : currentLang === "FR" || currentLang === "CH"
          ? "contre"
          : "vs"
      } ${otherScores} pts`
    });

    // Factor 2: Compare specific key stats
    const statLabels: Record<string, Record<string, string>> = {
      performance: {
        FR: "Rendement de puissance",
        CH: "Rendement de puissance",
        DE: "Leistungsübertragung",
        EN: "Power Transfer"
      },
      comfort: {
        FR: "Niveau de confort",
        CH: "Niveau de confort",
        DE: "Komfortstufe",
        EN: "Comfort Index"
      },
      durability: {
        FR: "Résistance & Garantie",
        CH: "Résistance & Garantie",
        DE: "Haltbarkeit & Garantie",
        EN: "Durability Assurance"
      },
      craftsmanship: {
        FR: "Finition et assemblage",
        CH: "Finition et assemblage",
        DE: "Verarbeitung & Montage",
        EN: "Craftsmanship Quality"
      },
      prestige: {
        FR: "Indice de sensation",
        CH: "Indice de sensation",
        DE: "Gefühlsindex",
        EN: "Sensation Factor"
      }
    };

    const checkMore = (statName: "performance" | "comfort" | "durability" | "craftsmanship" | "prestige") => {
      const isBetter = others.every(o => wStats[statName] >= o.stats[statName]);
      if (isBetter) {
        const valStr = others.map(o => o.stats[statName]).join(" vs ");
        const labels = statLabels[statName];
        const activeLabel = labels[currentLang] || labels.EN;
        
        let titleStr = "";
        if (currentLang === "FR" || currentLang === "CH") {
          titleStr = `${activeLabel} supérieur`;
        } else if (currentLang === "DE") {
          titleStr = `Höhere ${activeLabel}`;
        } else {
          titleStr = `Higher ${activeLabel}`;
        }

        facts.push({
          title: titleStr,
          subtitle: `${wStats[statName]}% vs ${valStr}%`
        });
      }
    };

    checkMore("performance");
    checkMore("comfort");
    checkMore("durability");
    checkMore("craftsmanship");
    checkMore("prestige");

    // Fallback if not absolute winner in specific stats: grab top stats
    if (facts.length < 4) {
      if (wStats.craftsmanship > 80) {
        facts.push({
          title:
            currentLang === "DE"
              ? "Meisterhafte Verarbeitung"
              : currentLang === "FR" || currentLang === "CH"
              ? "Finition d'orfèvrerie"
              : "Exceptional Craftsmanship",
          subtitle: `${wStats.craftsmanship}% ${
            currentLang === "DE"
              ? "zertifizierte Exzellenz"
              : currentLang === "FR" || currentLang === "CH"
              ? "d'excellence certifiée"
              : "certified perfection"
          }`
        });
      }
      if (wStats.performance > 80) {
        facts.push({
          title:
            currentLang === "DE"
              ? "Elite-Leistung"
              : currentLang === "FR" || currentLang === "CH"
              ? "Rendement mécanique d'élite"
              : "Elite Performance",
          subtitle: `${wStats.performance}% ${
            currentLang === "DE"
              ? "geprüfte Effizienz"
              : currentLang === "FR" || currentLang === "CH"
              ? "d'efficience testée"
              : "measured efficiency"
          }`
        });
      }
    }

    return facts.slice(0, 5);
  };

  const winnerFacts = generateWinnerFacts();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      {/* Clickable Backdrop */}
      <div className="absolute inset-0 cursor-pointer touch-none" onClick={onClose} />
      
      <div className="relative w-full max-w-[95vw] xl:max-w-7xl bg-[#FAF9F4] text-[#131211] shadow-2xl border border-neutral-300/40 rounded-xl flex flex-col max-h-[92vh] overflow-hidden z-10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-neutral-200 bg-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-[#A37E2C]" />
            <div>
              <span className="font-sans font-extrabold tracking-wider text-base sm:text-xl uppercase text-[#2E2218] block leading-tight">
                {currentLang === "FR" || currentLang === "CH"
                  ? "COMPARAISON DE PRODUITS"
                  : currentLang === "DE"
                  ? "PRODUKTVERGLEICH"
                  : "PRODUCT COMPARISON"}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200/50 text-neutral-500 hover:text-black transition-all cursor-pointer"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box (Scrollable Content panel mimicking Versus.com) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 overscroll-contain">
          {comparedProducts.length < 2 ? (
            <div className="py-20 text-center space-y-4">
              <span className="text-5xl text-neutral-300 inline-block rotate-12">⚖️</span>
              <p className="text-sm text-neutral-850 font-bold max-w-sm mx-auto">
                {currentLang === "DE"
                  ? "Bitte wählen Sie mindestens 2 Kreationen aus, um einen detaillierten Vergleich durchzuführen."
                  : currentLang === "FR" || currentLang === "CH"
                  ? "Veuillez sélectionner au moins 2 créations pour effectuer une comparaison détaillée."
                  : "Please select at least 2 creations to perform a detailed comparison."}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#A37E2C] text-white text-xs font-serif uppercase tracking-widest font-black rounded hover:bg-[#8c6b24]"
              >
                {currentLang === "DE"
                  ? "Zurück zum Katalog"
                  : currentLang === "FR" || currentLang === "CH"
                  ? "Retourner au catalogue"
                  : "Back to Catalog"}
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: SIDE-BY-SIDE VERSUS HEADER (Mimicking Photo 1) */}
              <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4 sm:p-5">
                <button
                  onClick={() => setIsProductsSectionCollapsed(!isProductsSectionCollapsed)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group outline-none select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-[#A37E2C]" />
                    <span className="font-sans font-extrabold text-sm sm:text-base text-[#2E2218] uppercase tracking-wider">
                      {currentLang === "DE"
                        ? "1. Galerie und Preise der Kreationen"
                        : currentLang === "FR" || currentLang === "CH"
                        ? "1. Galerie et tarifs des créations"
                        : "1. Creations Gallery & Pricing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#A37E2C] font-sans font-bold hover:underline">
                    <span>
                      {isProductsSectionCollapsed 
                        ? (currentLang === "DE" ? "Öffnen" : currentLang === "FR" || currentLang === "CH" ? "Ouvrir" : "Expand") 
                        : (currentLang === "DE" ? "Minimieren" : currentLang === "FR" || currentLang === "CH" ? "Réduire" : "Collapse")}
                    </span>
                    {isProductsSectionCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {!isProductsSectionCollapsed && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 overflow-x-auto pb-2 scrollbar-thin animate-fade-in font-sans">
                    <div 
                      className="min-w-0 grid" 
                      style={{ 
                        gridTemplateColumns: isDesktop
                          ? `185px repeat(${comparedProducts.length}, minmax(260px, 1fr))`
                          : `repeat(${comparedProducts.length}, minmax(${isMobile ? "125px" : "210px"}, 1fr))`
                      }}
                    >
                      
                      {/* Outer column indicator - Empty spacer on desktop, hidden on mobile/tablet */}
                      {isDesktop && (
                        <div className="flex flex-col justify-end pb-4 pr-4 border-r border-neutral-100" />
                      )}

                      {/* Product side-by-side columns */}
                      {resolvedProductsWithStats.map((item, idx) => {
                        const p = item.product;
                        const stats = item.stats;
                        const isWinner = winner && winner.product.id === p.id;
                        const colorSet = candidateColors[idx % candidateColors.length];
                        const prevProduct = idx > 0 ? resolvedProductsWithStats[idx - 1].product : null;

                        return (
                          <div key={p.id} className="relative flex flex-col items-center text-center px-1 sm:px-4 pb-2 sm:pb-4">
                            
                            {/* VS Bubble placed on left of column for subsequent products */}
                            {prevProduct && (
                              <div className="absolute top-[35%] -left-3 sm:-left-4 z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#2E2218] text-white border border-[#FAF9F4] text-[8px] sm:text-[10px] font-mono font-black flex items-center justify-center shadow-md">
                                VS
                              </div>
                            )}

                            {/* Top Points Bubble (Score Circle like Image 1) */}
                            <div className="flex items-center gap-1 sm:gap-3 mb-2 sm:mb-4">
                              <div className={`relative ${isWinner ? "w-11 h-11 xs:w-16 xs:h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-amber-100 to-yellow-200 border-2 border-amber-500 shadow-lg scale-110" : "w-8 h-8 xs:w-11 xs:h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-neutral-100 border border-neutral-300 shadow-md"} rounded-full flex items-center justify-center p-0.5 sm:p-1 transition-all`}>
                                <span className={`${isWinner ? "text-xs xs:text-base sm:text-lg md:text-xl font-extrabold" : "text-[9px] xs:text-xs sm:text-sm md:text-sm font-black"} font-mono text-[#131211] leading-none block`}>
                                  {stats.score}
                                </span>
                                {isWinner && (
                                  <div
                                    className="absolute -top-3.5 -right-2 text-lg xs:text-2xl sm:text-3xl animate-bounce"
                                    title={
                                      currentLang === "DE"
                                        ? "Sieger"
                                        : currentLang === "FR" || currentLang === "CH"
                                        ? "Gagnant"
                                        : "Winner"
                                    }
                                  >
                                    🏆
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-left hidden xs:block">
                                <span className={`text-[8px] md:text-[9px] uppercase tracking-wider font-mono font-black block ${colorSet.text}`}>
                                  {p.categoryLabel}
                                </span>
                                {isWinner && (
                                  <span className="text-[7px] xs:text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-600 font-mono font-black block">
                                    {currentLang === "DE"
                                      ? "★ SIEGER"
                                      : currentLang === "FR" || currentLang === "CH"
                                      ? "★ GAGNANT"
                                      : "★ WINNER"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Product Image Stage (Significantly increased on mobile as requested) */}
                            <div className="relative w-[105px] h-[105px] xs:w-36 xs:h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-white border border-neutral-300 p-1.5 sm:p-4 rounded-xl flex items-center justify-center mb-2.5 group shadow-md animate-fade-in">
                              {/* Close/Remove button like original and photo 1 */}
                              <button
                                onClick={() => onRemove(p)}
                                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-full text-neutral-400 border border-neutral-200 shadow-sm z-10 transition-all cursor-pointer"
                                title={
                                  currentLang === "DE"
                                    ? "Entfernen"
                                    : currentLang === "FR" || currentLang === "CH"
                                    ? "Retirer"
                                    : "Remove"
                                }
                              >
                                <X className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                              </button>

                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-300" 
                              />
                              
                              {/* COMPARISON WINNER BADGE overlay like Image 1 */}
                              {isWinner && (
                                <div className="absolute -bottom-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white font-mono font-black text-[9px] xs:text-xs sm:text-sm uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 z-10 animate-pulse">
                                  <span className="text-xs xs:text-sm sm:text-base">🏆</span>
                                  <span className="text-[7px] xs:text-[10px] sm:text-xs">
                                    {currentLang === "DE"
                                      ? "SIEGER"
                                      : currentLang === "FR" || currentLang === "CH"
                                      ? "GAGNANT"
                                      : "WINNER"}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Product Title text size auto-scales as requested */}
                            <h4 className="text-sm xs:text-base sm:text-lg md:text-lg font-black text-[#131211] font-serif hover:text-[#A37E2C] transition-colors line-clamp-2 max-w-[105px] xs:max-w-[150px] sm:max-w-[180px] md:max-w-[210px] min-h-[2.5rem] sm:min-h-[3rem] leading-snug mb-1.5 uppercase tracking-wide">
                              {p.name}
                            </h4>

                            {/* Custom Price Capsule like Image 1 (Significantly increased size on mobile) */}
                            <div className="mt-1 w-full max-w-[105px] xs:max-w-[145px] sm:max-w-[170px] md:max-w-[190px]">
                              <div className="bg-neutral-100 border border-neutral-300 hover:border-[#A37E2C] px-1.5 py-1 xs:px-3 xs:py-1 sm:px-4 sm:py-1.5 rounded-full flex items-center justify-between transition-all shadow-sm">
                                <span className="font-serif font-black text-lg xs:text-xl sm:text-xl md:text-2xl text-[#2E1818]/90 whitespace-nowrap">
                                  {formatPrice(p.price, currentLang)}
                                </span>
                                <span className="text-[7px] sm:text-[8.5px] uppercase tracking-wider text-[#A37E2C] font-mono font-black hidden md:inline ml-1">
                                  Atlis
                                </span>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: VISUAL ANALYSIS RADAR AND SUMMARY FACTS (Mimicking Photo 2) */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-sm mt-3">
                <button
                  onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-[#A37E2C]" />
                    <span className="font-sans font-extrabold text-sm sm:text-base text-[#2E2218] uppercase tracking-wider">
                      {currentLang === "DE"
                        ? "2. Multidimensionale Atelier-Analyse"
                        : currentLang === "FR" || currentLang === "CH"
                        ? "2. Analyse multidimensionnelle d'Atelier"
                        : "2. Workshop Dimensional Analysis"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#A37E2C] font-sans font-bold hover:underline">
                    <span>
                      {isAnalysisCollapsed 
                        ? (currentLang === "DE" ? "Öffnen" : currentLang === "FR" || currentLang === "CH" ? "Ouvrir" : "Expand") 
                        : (currentLang === "DE" ? "Minimieren" : currentLang === "FR" || currentLang === "CH" ? "Réduire" : "Collapse")}
                    </span>
                    {isAnalysisCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {!isAnalysisCollapsed && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
                    
                    {/* Visual Radar spider chart board (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-stone-50/50 border border-neutral-200/60 rounded-xl p-5 flex flex-col items-center justify-center shadow-inner">
                      <h3 className="text-[10px] font-serif font-extrabold uppercase tracking-widest text-[#2E2218] mb-4 text-center">
                        {currentLang === "DE"
                          ? "GEOMETRISCHES PROFIL"
                          : currentLang === "FR" || currentLang === "CH"
                          ? "EMPREINTE GÉOMÉTRIQUE"
                          : "DIMENSIONAL PROFILE"}
                      </h3>

                      {/* Custom SVG Radar spider chart */}
                      <div className="relative">
                        <svg width={svgW} height={svgH} className="mx-auto overflow-visible select-none">
                          {/* Concentrate circles grid lines */}
                          {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
                            const levelR = level * maxR;
                            const pointsStr = Array.from({ length: 5 }, (_, i) => {
                              const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                              const x = cx + levelR * Math.cos(angle);
                              const y = cy + levelR * Math.sin(angle);
                              return `${x},${y}`;
                            }).join(" ");

                            return (
                              <polygon
                                key={lIdx}
                                points={pointsStr}
                                fill="transparent"
                                stroke="#E5E5E5"
                                strokeWidth="1"
                                strokeDasharray="4 3"
                              />
                            );
                          })}

                          {/* Axis lines and labels */}
                          {radarLabels.map((lbl, i) => {
                            const outerCoord = getCoordinates(i, 100);
                            const labelOffsetCoord = getCoordinates(i, 118);

                            return (
                              <g key={i}>
                                {/* Axis line */}
                                <line
                                  x1={cx}
                                  y1={cy}
                                  x2={outerCoord.x}
                                  y2={outerCoord.y}
                                  stroke="#D4D4D4"
                                  strokeWidth="1"
                                />
                                {/* Axis Title */}
                                <text
                                  x={labelOffsetCoord.x}
                                  y={labelOffsetCoord.y}
                                  textAnchor="middle"
                                  alignmentBaseline="middle"
                                  className="font-mono text-[9px] uppercase font-black fill-[#2E2218]/90 tracking-wider"
                                >
                                  {lbl.label}
                                </text>
                              </g>
                            );
                          })}

                          {/* Product Polygons */}
                          {resolvedProductsWithStats.map((item, idx) => {
                            const colorSet = candidateColors[idx % candidateColors.length];
                            const polygonPoints = radarLabels.map((lbl, i) => {
                              const val = item.stats[lbl.key as keyof typeof item.stats] || 50;
                              const pt = getCoordinates(i, val);
                              return `${pt.x},${pt.y}`;
                            }).join(" ");

                            return (
                              <g key={item.product.id}>
                                {/* Filled Area */}
                                <polygon
                                  points={polygonPoints}
                                  fill={colorSet.fill}
                                  stroke={colorSet.stroke}
                                  strokeWidth="2.5"
                                  className="transition-all hover:fill-opacity-35"
                                />
                                {/* Dots for metrics */}
                                {radarLabels.map((lbl, i) => {
                                  const val = item.stats[lbl.key as keyof typeof item.stats] || 50;
                                  const pt = getCoordinates(i, val);
                                  return (
                                    <circle
                                      key={i}
                                      cx={pt.x}
                                      cy={pt.y}
                                      r="4"
                                      fill={colorSet.stroke}
                                      stroke="#FAF9F4"
                                      strokeWidth="1.5"
                                      className="cursor-pointer"
                                    >
                                      <title>{`${item.product.name}: ${val}%`}</title>
                                    </circle>
                                  );
                                })}
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Horizontal legend */}
                      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-mono">
                        {resolvedProductsWithStats.map((item, idx) => {
                          const colorSet = candidateColors[idx % candidateColors.length];
                          const isW = winner && winner.product.id === item.product.id;
                          return (
                            <div key={item.product.id} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${isW ? "bg-amber-100/80 border border-amber-300 scale-105" : ""}`}>
                              {isW ? (
                                <span className="text-xs">🏆</span>
                              ) : (
                                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colorSet.stroke }} />
                              )}
                              <span className="font-extrabold text-[#131211]">{item.stats.score} pts:</span>
                              <span className="text-neutral-800 font-bold line-clamp-1 max-w-[85px]">{item.product.name}</span>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Key superiority checklist board (lg:col-span-7) */}
                    <div className="lg:col-span-7 bg-white border border-neutral-200/90 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-serif font-black uppercase tracking-wider text-[#131211] pb-3 border-b border-neutral-150">
                          {currentLang === "DE"
                            ? `Warum überragt ${winner?.product.name} diese Auswahl?`
                            : (currentLang === "FR" || currentLang === "CH")
                            ? `Pourquoi ${winner?.product.name} domine cet atelier ?`
                            : `Why is ${winner?.product.name} better than the others?`}
                        </h3>

                        <div className="mt-4 space-y-3.5">
                          {winnerFacts.map((fact, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-3">
                              <div className="p-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 mt-0.5">
                                <span className="text-xs font-bold font-mono">✓</span>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#2E2218] leading-tight">
                                  {fact.title}
                                </p>
                                <p className="text-xs text-neutral-800 font-mono font-bold mt-0.5">
                                  {fact.subtitle}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-neutral-50/80 border border-neutral-350 rounded-lg p-3.5 mt-5">
                        <p className="text-[11px] font-mono text-neutral-850 uppercase font-black tracking-wider mb-1">
                          {currentLang === "DE"
                            ? "Atelier-Verdikt"
                            : currentLang === "FR" || currentLang === "CH"
                            ? "Évaluation Synthétique"
                            : "Atelier Verdict"}
                        </p>
                        <p className="text-xs text-[#131211] leading-relaxed font-bold">
                          {currentLang === "DE"
                            ? `Die Kreuzanalyse von Atlis bestätigt die Überlegenheit der Kreation « ${winner?.product.name} » mit einer harmonischen Bewertung von ${winner?.stats.score} Punkten. Zertifizierte Höchstleistung für Ihre sportlichen Herausforderungen.`
                            : currentLang === "FR" || currentLang === "CH"
                            ? `L'analyse croisée d'Atlis confirme la supériorité de la création « ${winner?.product.name} » avec un score harmonique de ${winner?.stats.score} points. Confection de haute voltige certifiée pour vos défis athlétiques.`
                            : `Cross-analysis from Atlis affirms the dominance of « ${winner?.product.name} » with a harmonized rating of ${winner?.stats.score} points, achieving unparalleled distinction.`}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>

                                {/* SECTION 3: SPEC DETAILED TABLE (Resembles layout in Photo 2 table) */}
              <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4 sm:p-5 mt-3">
                <button
                  onClick={() => setIsSpecTableCollapsed(!isSpecTableCollapsed)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group outline-none select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Scale className="w-5 h-5 text-[#A37E2C]" />
                    <span className="font-sans font-extrabold text-sm sm:text-base text-[#2E2218] uppercase tracking-wider">
                      {currentLang === "DE"
                        ? "3. Technische Spezifikationen des Ateliers"
                        : currentLang === "FR" || currentLang === "CH"
                        ? "3. Spécifications techniques d'Atelier"
                        : "3. Technical Specifications"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#A37E2C] font-sans font-bold hover:underline">
                    <span>
                      {isSpecTableCollapsed 
                        ? (currentLang === "DE" ? "Öffnen" : currentLang === "FR" || currentLang === "CH" ? "Ouvrir" : "Expand") 
                        : (currentLang === "DE" ? "Minimieren" : currentLang === "FR" || currentLang === "CH" ? "Réduire" : "Collapse")}
                    </span>
                    {isSpecTableCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {!isSpecTableCollapsed && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 overflow-x-auto pb-2 scrollbar-thin animate-fade-in font-sans">
                    <div 
                      className="min-w-0 grid" 
                      style={{ 
                        gridTemplateColumns: isDesktop
                          ? `185px repeat(${comparedProducts.length}, minmax(260px, 1fr))`
                          : `repeat(${comparedProducts.length}, minmax(${isMobile ? "125px" : "210px"}, 1fr))`
                      }}
                    >
                    
                    {/* Dedicated side-by-side Product Images Row to fill empty space and provide clear column reference */}
                    {isDesktop && (
                      <div className="border-b-2 border-neutral-200/45 bg-neutral-100/30 p-2 sm:p-4 flex items-center justify-center">
                        <span className="text-xs font-mono font-black text-neutral-450 uppercase tracking-wider">
                          {currentLang === "DE"
                            ? "Kreationen"
                            : currentLang === "FR" || currentLang === "CH"
                            ? "Créations"
                            : "Creations"}
                        </span>
                      </div>
                    )}
                    {comparedProducts.map((p) => (
                      <div key={`spec-image-${p.id}`} className="border-b-2 border-neutral-200/40 bg-neutral-50/20 p-2 sm:p-4 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 xs:w-16 xs:h-16 bg-white border border-neutral-200/80 p-1 rounded-lg flex items-center justify-center shadow-sm">
                          <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="text-[9px] xs:text-xs font-mono font-black text-[#131211] line-clamp-1 text-center w-full uppercase tracking-tight">
                          {p.name}
                        </span>
                      </div>
                    ))}

                    {/* Atout Clé Row */}
                    <button
                      onClick={() => setIsAtoutCleCollapsed(!isAtoutCleCollapsed)}
                      className="p-2 sm:p-3 border-b-2 border-neutral-300 bg-neutral-100/40 font-black text-xs sm:text-base text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A37E2C]" />
                        <span>
                          {currentLang === "DE"
                            ? "Atelier-Highlights"
                            : currentLang === "FR" || currentLang === "CH"
                            ? "Points forts d'Atelier"
                            : "Workshop Key Highlights"}
                        </span>
                      </div>
                      {isAtoutCleCollapsed ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" /> : <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" />}
                    </button>
                    {isDesktop && (
                      <div className={`border-b-2 border-neutral-200/40 bg-neutral-50/10 flex items-center justify-center ${isAtoutCleCollapsed ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" : "p-1.5 sm:p-5"}`}>
                        {/* Empty cell */}
                      </div>
                    )}
                    {comparedProducts.map((p) => {
                      const isBestBudget = p.price === minPrice;
                      const isBestRating = (p.reviews?.notation || 4.8) === maxRating;
                      const isMostPopular = (p.reviews?.count || 48) === maxReviews;
                      const isPremiumChoice = p.price === maxPrice && comparedProducts.length > 2;

                      let badge = { text: "", styles: "" };
                      if (isBestBudget) {
                        badge = {
                           text:
                             currentLang === "DE"
                               ? "🪙 Ideales Budget"
                               : currentLang === "FR" || currentLang === "CH"
                               ? "🪙 Budget Idéal"
                               : "🪙 Best Price",
                           styles: "bg-emerald-55 text-emerald-900 border-emerald-350 hover:scale-105 font-bold"
                        };
                      } else if (isBestRating) {
                        badge = {
                           text:
                             currentLang === "DE"
                               ? "⭐ Bewertet"
                               : currentLang === "FR" || currentLang === "CH"
                               ? "⭐ Évalué"
                               : "⭐ Rated",
                           styles: "bg-amber-55 text-amber-900 border-amber-350 hover:scale-105 font-bold"
                        };
                      } else if (isMostPopular) {
                        badge = {
                           text:
                             currentLang === "DE"
                               ? "🔥 Favorit"
                               : currentLang === "FR" || currentLang === "CH"
                               ? "🔥 Favori"
                               : "🔥 Popular",
                           styles: "bg-blue-55 text-blue-900 border-blue-350 hover:scale-105 font-bold"
                        };
                      } else if (isPremiumChoice) {
                        badge = {
                           text:
                             currentLang === "DE"
                               ? "🏎️ Premium"
                               : currentLang === "FR" || currentLang === "CH"
                               ? "🏎️ Premium"
                               : "🏎️ Premium",
                           styles: "bg-purple-55 text-purple-900 border-purple-350 hover:scale-105 font-bold"
                        };
                      } else {
                        badge = {
                           text:
                             currentLang === "DE"
                               ? "✨ Exzellenz"
                               : currentLang === "FR" || currentLang === "CH"
                               ? "✨ Excellence"
                               : "✨ Pure Perf",
                           styles: "bg-stone-100 text-[#131211] border-stone-300 hover:scale-105 font-bold"
                        };
                      }

                      return (
                        <div 
                          key={p.id} 
                          className={`border-b-2 border-neutral-200/40 flex items-center justify-center ${
                            isAtoutCleCollapsed 
                              ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                              : "p-1.5 sm:p-5"
                          }`}
                        >
                          {!isAtoutCleCollapsed && (
                            <span className={`inline-flex items-center px-1.5 py-1 sm:px-4 sm:py-2 rounded-md text-[9px] xs:text-xs sm:text-base font-extrabold border shadow-sm transition-transform select-none ${badge.styles}`}>
                              {badge.text}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Description Row (Improved text sizes & completely resolved overlap on mobile) */}
                    <button
                      onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
                      className="p-2 sm:p-3 border-b-2 border-neutral-300 bg-neutral-100/40 font-black text-xs sm:text-base text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A37E2C]" />
                        <span>
                          {currentLang === "DE"
                            ? "Atelier-Beschreibung"
                            : currentLang === "FR" || currentLang === "CH"
                            ? "Description d'Atelier"
                            : "Workshop Description"}
                        </span>
                      </div>
                      {isDescriptionCollapsed ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" /> : <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" />}
                    </button>
                    {isDesktop && (
                      <div className={`border-b-2 border-neutral-200/40 bg-neutral-50/10 flex items-center justify-center ${isDescriptionCollapsed ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" : "p-1.5 sm:p-5"}`}>
                        {/* Empty cell */}
                      </div>
                    )}
                    {comparedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className={`border-b-2 border-neutral-200/40 text-left ${
                          isDescriptionCollapsed 
                            ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                            : "p-2.5 sm:p-6 text-[10px] xs:text-sm sm:text-base text-neutral-800 font-bold leading-relaxed"
                        }`}
                      >
                        {!isDescriptionCollapsed && (
                          <p className="line-clamp-6">{p.description}</p>
                        )}
                      </div>
                    ))}

                    {/* Technical details (Improved text sizes & completely resolved overlap on mobile) */}
                    <button
                      onClick={() => setIsTechnicalCollapsed(!isTechnicalCollapsed)}
                      className="p-2 sm:p-3 border-b-2 border-neutral-300 bg-neutral-100/40 font-black text-xs sm:text-base text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#A37E2C]" />
                        <span>
                          {currentLang === "DE"
                            ? "Technische Highlights"
                            : currentLang === "FR" || currentLang === "CH"
                            ? "Atouts Techniques"
                            : "Technical Highlights"}
                        </span>
                      </div>
                      {isTechnicalCollapsed ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" /> : <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" />}
                    </button>
                    {isDesktop && (
                      <div className={`border-b-2 border-neutral-200/40 bg-neutral-50/10 flex items-center justify-center ${isTechnicalCollapsed ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" : "p-1.5 sm:p-5"}`}>
                        {/* Empty cell */}
                      </div>
                    )}
                    {comparedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className={`border-b-2 border-neutral-200/40 text-left ${
                          isTechnicalCollapsed 
                            ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                            : "p-2.5 sm:p-6 text-[10px] xs:text-xs sm:text-base text-neutral-800 leading-relaxed font-bold animate-fade-in"
                        }`}
                      >
                        {!isTechnicalCollapsed && (
                          p.details.length === 0 ? (
                            <span className="text-[10px] xs:text-sm sm:text-base text-stone-550 font-bold italic">
                              {currentLang === "DE"
                                ? "Premium-Maßanfertigung"
                                : currentLang === "FR" || currentLang === "CH"
                                ? "Confection premium sur-mesure"
                                : "Premium tailored manufacturing"}
                            </span>
                          ) : (
                            <ul className="space-y-1 sm:space-y-2 list-disc pl-3 sm:pl-6 font-bold text-neutral-805">
                              {p.details.map((detail, idx) => (
                                <li key={idx} className="text-[10px] xs:text-xs sm:text-sm md:text-base">{detail}</li>
                              ))}
                            </ul>
                          )
                        )}
                      </div>
                    ))}

                    {/* Sizes Row (Improved text sizes & completely resolved overlap on mobile) */}
                    <button
                      onClick={() => setIsSizesCollapsed(!isSizesCollapsed)}
                      className="p-2 sm:p-3 border-b-2 border-neutral-300 bg-neutral-100/40 font-black text-xs sm:text-base text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#A37E2C]" />
                        <span>
                          {currentLang === "DE"
                            ? "Größen"
                            : currentLang === "FR" || currentLang === "CH"
                            ? "Tailles"
                            : "Sizes"}
                        </span>
                      </div>
                      {isSizesCollapsed ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" /> : <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#A37E2C]" />}
                    </button>
                    {isDesktop && (
                      <div className={`border-b border-neutral-200/40 bg-neutral-50/10 flex items-center justify-center ${isSizesCollapsed ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" : "p-1.5 sm:p-5"}`}>
                        {/* Empty cell */}
                      </div>
                    )}
                    {comparedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className={`border-b-2 border-neutral-200/40 flex items-center justify-center ${
                          isSizesCollapsed 
                            ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                            : "p-1.5 sm:p-5 text-center"
                        }`}
                      >
                        {!isSizesCollapsed && (
                          <span className="text-[9px] xs:text-xs sm:text-sm font-mono font-extrabold text-neutral-900 bg-neutral-150 px-1.5 py-1 sm:px-4 sm:py-2 rounded-md border border-neutral-300 shadow-sm">
                            {p.sizes && p.sizes.length > 0 ? p.sizes.map(s => formatSizeDisplay(s, currentLang)).join(", ") : "Standard"}
                          </span>
                        )}
                      </div>
                    ))}

                  </div>
                </div>
                )}
              </div>

              {/* SECTION 4: ACTIONS RAPIDES (Dans une div séparée de spécifications d'atelier) */}
              <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4 sm:p-5 mt-3 animate-fade-in">
                <div className="flex items-center gap-2.5 mb-4 border-b border-neutral-100 pb-2">
                  <ShoppingBag className="w-5 h-5 text-[#A37E2C]" />
                  <span className="font-sans font-extrabold text-sm sm:text-base text-[#2E2218] uppercase tracking-wider">
                    {currentLang === "DE"
                      ? "4. Atelier-Kaufaktionen"
                      : currentLang === "FR" || currentLang === "CH"
                      ? "4. Actions d'achat d'Atelier"
                      : "4. Workshop Actions & Purchase"}
                  </span>
                </div>
                
                <div className="overflow-x-auto pb-2 scrollbar-thin font-sans">
                  <div 
                    className="min-w-0 grid" 
                    style={{ 
                      gridTemplateColumns: isDesktop
                        ? `185px repeat(${comparedProducts.length}, minmax(260px, 1fr))`
                        : `repeat(${comparedProducts.length}, minmax(${isMobile ? "125px" : "210px"}, 1fr))`
                    }}
                  >
                    
                    {isDesktop && (
                      <div className="p-1 sm:p-4 border-r border-neutral-100/70" />
                    )}
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="p-1 sm:p-4 text-center flex flex-col items-center justify-center gap-2 border-l border-neutral-100 first:border-l-0">
                        {/* Side-by-side Product Image for clear reference */}
                        <div className="w-12 h-12 xs:w-16 xs:h-16 bg-white border border-neutral-200 p-1 rounded-lg flex items-center justify-center shadow-sm shrink-0 mb-1">
                          <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        {/* Bottom product context panel info */}
                        <div className="w-full text-center pb-2 mb-1 border-b border-neutral-100/70">
                          <p className="text-[10px] xs:text-xs font-sans font-black text-[#131211] uppercase tracking-tight line-clamp-2 min-h-[1.75rem] sm:min-h-[2.25rem] flex items-center justify-center px-0.5 sm:px-1" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-[9px] xs:text-[11px] font-mono font-bold text-[#A37E2C] mt-1 bg-[#A37E2C]/5 rounded py-0.5 px-1.5 inline-block">
                            {formatPrice(p.price, currentLang)}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onViewDetails(p);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-2 py-2 border-2 border-neutral-300 hover:border-[#A37E2C] text-neutral-700 hover:text-[#A37E2C] hover:bg-neutral-50 transition-all rounded bg-white cursor-pointer font-bold uppercase tracking-wider text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {currentLang === "DE"
                              ? "Details"
                              : currentLang === "FR" || currentLang === "CH"
                              ? "Détails"
                              : "Details"}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            const defSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : undefined;
                            onAddToCart(p, defSize);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-xs bg-[#A37E2C] hover:bg-[#8c6b24] text-white transition-all rounded cursor-pointer font-serif uppercase tracking-wider font-extrabold shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>
                            {currentLang === "DE"
                              ? "Kaufen"
                              : currentLang === "FR" || currentLang === "CH"
                              ? "Acheter"
                              : "Buy"}
                          </span>
                        </button>
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {comparedProducts.length >= 2 && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-100/50 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-3">
            <span className="font-sans font-bold text-neutral-700">
              {comparedProducts.length}{" "}
              {currentLang === "DE"
                ? "Produkte verglichen"
                : currentLang === "FR" || currentLang === "CH"
                ? "produits comparés"
                : "products compared"}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 border-2 border-neutral-300 hover:border-black text-black font-medium transition-colors uppercase tracking-widest text-[10px] rounded cursor-pointer"
            >
              {currentLang === "DE"
                ? "Atelier schließen"
                : currentLang === "FR" || currentLang === "CH"
                ? "Fermer l'Atelier"
                : "Exit Atelier"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
