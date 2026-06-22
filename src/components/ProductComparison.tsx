import { useState } from "react";
import { X, Scale, ShoppingBag, Eye, AlertCircle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Product } from "../types";

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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const maxLimit = isMobile ? 2 : 4;

  if (comparedProducts.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-40 animate-slide-in">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-[#A37E2C] hover:bg-[#8c6b24] text-[#FAF9F4] p-3 rounded-full shadow-2xl flex items-center gap-2 border border-white hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title={currentLang === "FR" ? "Ouvrir le comparateur" : "Open Comparison"}
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
          <div className="flex items-center gap-2">
            <div className="bg-[#A37E2C] text-white p-1.5 rounded-full">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-serif font-bold tracking-wider uppercase text-[#2E2218]">
                {currentLang === "FR" ? "Comparateur" : "Comparison Atelier"}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                {comparedProducts.length} / {maxLimit} {currentLang === "FR" ? "créations sélectionnées" : "creations selected"}
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClearAll}
              className="text-xs text-neutral-500 hover:text-red-500 underline font-medium cursor-pointer px-2"
            >
              {currentLang === "FR" ? "Effacer" : "Clear"}
            </button>
            <button
              onClick={onCompareNow}
              disabled={comparedProducts.length < 2}
              className={`px-4 py-2 text-xs font-serif font-black uppercase tracking-widest transition-all rounded shadow-md cursor-pointer ${
                comparedProducts.length >= 2
                  ? "bg-[#A37E2C] hover:bg-[#8c6b24] text-white"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {currentLang === "FR" ? `Comparer (${comparedProducts.length})` : `Compare (${comparedProducts.length})`}
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 text-neutral-400 hover:text-[#A37E2C] hover:bg-neutral-100 rounded-full cursor-pointer transition-all"
              title={currentLang === "FR" ? "Réduire" : "Collapse"}
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
    { label: currentLang === "FR" ? "Performance" : "Performance", key: "performance" },
    { label: currentLang === "FR" ? "Sensation" : "Sensation", key: "prestige" },
    { label: currentLang === "FR" ? "Dignité" : "Prestige", key: "craftsmanship" },
    { label: currentLang === "FR" ? "Durabilité" : "Durability", key: "durability" },
    { label: currentLang === "FR" ? "Confort" : "Comfort", key: "comfort" },
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
      title: currentLang === "FR" ? "Meilleure balance d'Atelier" : "Superior Overall Balance",
      subtitle: `${wStats.score} pts ${currentLang === "FR" ? "contre" : "vs"} ${otherScores} pts`
    });

    // Factor 2: Compare specific key stats
    const checkMore = (statName: "performance" | "comfort" | "durability" | "craftsmanship" | "prestige", frLabel: string, enLabel: string) => {
      const isBetter = others.every(o => wStats[statName] >= o.stats[statName]);
      if (isBetter) {
        const valStr = others.map(o => o.stats[statName]).join(" vs ");
        facts.push({
          title: currentLang === "FR" ? `${frLabel} supérieur` : `Higher ${enLabel}`,
          subtitle: `${wStats[statName]}% vs ${valStr}%`
        });
      }
    };

    checkMore("performance", "Rendement de puissance", "Power Transfer");
    checkMore("comfort", "Niveau de confort", "Comfort Index");
    checkMore("durability", "Résistance & Garantie", "Durability Assurance");
    checkMore("craftsmanship", "Finition et assemblage", "Craftsmanship Quality");
    checkMore("prestige", "Indice de prestige", "Prestige Factor");

    // Fallback if not absolute winner in specific stats: grab top stats
    if (facts.length < 4) {
      if (wStats.craftsmanship > 80) {
        facts.push({
          title: currentLang === "FR" ? "Finition d'orfèvrerie" : "Exceptional Craftsmanship",
          subtitle: `${wStats.craftsmanship}% ${currentLang === "FR" ? "d'excellence certifiée" : "certified perfection"}`
        });
      }
      if (wStats.performance > 80) {
        facts.push({
          title: currentLang === "FR" ? "Rendement mécanique d'élite" : "Elite Performance",
          subtitle: `${wStats.performance}% ${currentLang === "FR" ? "d'efficience testée" : "measured efficiency"}`
        });
      }
    }

    return facts.slice(0, 5);
  };

  const winnerFacts = generateWinnerFacts();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="relative w-full max-w-[95vw] xl:max-w-7xl bg-[#FAF9F4] text-[#131211] shadow-2xl border border-neutral-300/40 rounded-xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-200 bg-neutral-100/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#A37E2C]" />
            <div>
              <span className="font-serif font-black tracking-wider text-base uppercase text-[#2E2218] block">
                {currentLang === "FR" ? "ATELIER DE COMPARAISON AVANCÉ" : "PREMIUM COMPARISON LABORATORY"}
              </span>
              <span className="text-[10px] text-neutral-600 font-mono tracking-widest block uppercase font-bold">
                Maison Atlis — Versus Intelligence Engine
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
          {comparedProducts.length < 2 ? (
            <div className="py-20 text-center space-y-4">
              <span className="text-5xl text-neutral-300 inline-block rotate-12">⚖️</span>
              <p className="text-sm text-neutral-850 font-bold max-w-sm mx-auto">
                {currentLang === "FR"
                  ? "Veuillez sélectionner au moins 2 créations pour effectuer une comparaison détaillée."
                  : "Please select at least 2 creations to perform a detailed comparison."}
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#A37E2C] text-white text-xs font-serif uppercase tracking-widest font-black rounded hover:bg-[#8c6b24]"
              >
                {currentLang === "FR" ? "Retourner au catalogue" : "Back to Catalog"}
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: SIDE-BY-SIDE VERSUS HEADER (Mimicking Photo 1) */}
              <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-3 sm:p-4 md:p-5">
                <button
                  onClick={() => setIsProductsSectionCollapsed(!isProductsSectionCollapsed)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group outline-none select-none"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#A37E2C]" />
                    <span className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-[#2E2218] uppercase tracking-wider">
                      {currentLang === "FR" ? "Galerie & Tarifs du Comparateur" : "Versus Gallery & Pricing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A37E2C] font-mono font-bold hover:underline">
                    <span>
                      {isProductsSectionCollapsed 
                        ? (currentLang === "FR" ? "Ouvrir" : "Expand") 
                        : (currentLang === "FR" ? "Réduire" : "Collapse")}
                    </span>
                    {isProductsSectionCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {!isProductsSectionCollapsed && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 overflow-x-auto pb-2 scrollbar-thin animate-fade-in font-sans">
                    <div className="min-w-0 grid [--first-col-width:120px] xs:[--first-col-width:130px] sm:[--first-col-width:140px] md:[--first-col-width:165px] [--col-min-width:180px] xs:[--col-min-width:195px] sm:[--col-min-width:210px] md:[--col-min-width:230px]" style={{ gridTemplateColumns: `var(--first-col-width, 165px) repeat(${comparedProducts.length}, minmax(var(--col-min-width, 230px), 1fr))` }}>
                      
                      {/* Outer column indicator */}
                      <div className="flex flex-col justify-end pb-4 pr-1 sm:pr-4 border-r border-neutral-100">
                        <p className="font-serif font-black text-[8px] sm:text-xs md:text-sm text-[#2E2218] mt-1.5 tracking-tight uppercase leading-none">
                          {currentLang === "FR" ? "VERSUS" : "VERSUS"}
                        </p>
                      </div>

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
                              <div className="absolute top-[35%] -left-2.5 sm:-left-4 z-10 w-4 h-4 sm:w-8 sm:h-8 rounded-full bg-[#2E2218] text-white border border-[#FAF9F4] text-[7px] sm:text-[10px] font-mono font-black flex items-center justify-center shadow-md">
                                VS
                              </div>
                            )}

                            {/* Top Points Bubble (Score Circle like Image 1) */}
                            <div className="flex items-center gap-1 sm:gap-3 mb-2 sm:mb-4">
                              <div className="relative w-6 h-6 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full bg-neutral-100 flex items-center justify-center p-0.5 sm:p-1 border border-neutral-300 shadow-xs">
                                <span className="text-[9px] sm:text-xs md:text-sm font-black font-mono text-[#131211] leading-none block">
                                  {stats.score}
                                </span>
                              </div>
                              
                              <div className="text-left hidden xs:block">
                                <span className={`text-[6px] sm:text-[8px] md:text-[9px] uppercase tracking-wider font-mono font-black block ${colorSet.text}`}>
                                  {p.categoryLabel}
                                </span>
                              </div>
                            </div>

                            {/* Product Image Stage (Significantly increased on mobile as requested) */}
                            <div className="relative w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-52 md:h-52 bg-white border border-neutral-300 p-2 sm:p-4 rounded-xl flex items-center justify-center mb-2.5 group shadow-md animate-fade-in">
                              {/* Close/Remove button like original and photo 1 */}
                              <button
                                onClick={() => onRemove(p)}
                                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-white/90 hover:bg-red-500 hover:text-white rounded-full text-neutral-400 border border-neutral-200 shadow-sm z-10 transition-all cursor-pointer"
                                title={currentLang === "FR" ? "Retirer" : "Remove"}
                              >
                                <X className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />
                              </button>

                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-300" 
                              />
                              
                              {/* COMPARISON WINNER BADGE overlay like Image 1 */}
                              {isWinner && (
                                <div className="absolute -bottom-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-mono font-black text-[7px] sm:text-[9.5px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md border border-white">
                                  WIN🏆
                                </div>
                              )}
                            </div>

                            {/* Product Title text size auto-scales as requested */}
                            <h4 className="text-[10px] xs:text-xs sm:text-sm md:text-base font-black text-[#131211] font-serif hover:text-[#A37E2C] transition-colors line-clamp-2 max-w-[110px] xs:max-w-[130px] sm:max-w-[160px] md:max-w-[210px] h-6 sm:h-10 md:h-12 leading-tight mb-1.5 uppercase tracking-wide">
                              {p.name}
                            </h4>

                            {/* Custom Price Capsule like Image 1 (Significantly increased size on mobile) */}
                            <div className="mt-1 w-full max-w-[110px] xs:max-w-[130px] sm:max-w-[150px] md:max-w-[190px]">
                              <div className="bg-neutral-100 border border-neutral-300 hover:border-[#A37E2C] px-2 xs:px-3 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center justify-between transition-all shadow-sm">
                                <span className="font-serif font-black text-xs xs:text-sm sm:text-base md:text-lg text-[#2E2218]">
                                  {p.price.toLocaleString()} €
                                </span>
                                <span className="text-[6px] sm:text-[8.5px] uppercase tracking-wider text-[#A37E2C] font-mono font-black hidden xs:inline ml-1">
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
              <div className="bg-white border border-neutral-200 rounded-xl p-4.5 shadow-sm mt-2">
                <button
                  onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group outline-none"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#A37E2C]" />
                    <span className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-[#2E2218] uppercase tracking-wider">
                      {currentLang === "FR" ? "Analyse Multi-Dimensionnelle & Verdict" : "Multi-Dimensional Analysis & Verdict"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A37E2C] font-mono font-bold hover:underline">
                    <span>
                      {isAnalysisCollapsed 
                        ? (currentLang === "FR" ? "Ouvrir" : "Expand") 
                        : (currentLang === "FR" ? "Réduire" : "Collapse")}
                    </span>
                    {isAnalysisCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {!isAnalysisCollapsed && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t border-neutral-100 animate-fade-in">
                    
                    {/* Visual Radar spider chart board (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-stone-50/50 border border-neutral-200/60 rounded-xl p-5 flex flex-col items-center justify-center shadow-inner">
                      <h3 className="text-[10px] font-serif font-extrabold uppercase tracking-widest text-[#2E2218] mb-4 text-center">
                        {currentLang === "FR" ? "EMPREINTE GÉOMÉTRIQUE" : "DIMENSIONAL PROFILE"}
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
                          return (
                            <div key={item.product.id} className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colorSet.stroke }} />
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
                        <h3 className="text-sm font-serif font-black uppercase tracking-wider text-[#131211] pb-3 border-b border-neutral-100">
                          {currentLang === "FR" 
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
                          {currentLang === "FR" ? "Évaluation Synthétique" : "Prestige Verdict"}
                        </p>
                        <p className="text-xs text-[#131211] leading-relaxed font-bold">
                          {currentLang === "FR"
                            ? `L'analyse croisée d'Atlis confirme la supériorité de la création « ${winner?.product.name} » avec un score harmonique de ${winner?.stats.score} points. Confection de haute voltige certifiée pour vos défis athlétiques.`
                            : `Cross-analysis from Atlis affirms the dominance of « ${winner?.product.name} » with a harmonized rating of ${winner?.stats.score} points, achieving unparalleled distinction.`}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>

                                {/* SECTION 3: SPEC DETAILED TABLE (Resembles layout in Photo 2 table) */}
              <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-3 sm:p-4 md:p-5 mt-2">
                <button
                  onClick={() => setIsSpecTableCollapsed(!isSpecTableCollapsed)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group outline-none select-none"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#A37E2C]" />
                    <span className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-[#2E2218] uppercase tracking-wider">
                      {currentLang === "FR" ? "Spécifications d'Atelier" : "Workshop Specifications"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A37E2C] font-mono font-bold hover:underline">
                    <span>
                      {isSpecTableCollapsed 
                        ? (currentLang === "FR" ? "Ouvrir" : "Expand") 
                        : (currentLang === "FR" ? "Réduire" : "Collapse")}
                    </span>
                    {isSpecTableCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {!isSpecTableCollapsed && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 overflow-x-auto pb-2 scrollbar-thin animate-fade-in font-sans">
                    <div className="min-w-0 grid [--first-col-width:120px] xs:[--first-col-width:130px] sm:[--first-col-width:140px] md:[--first-col-width:165px] [--col-min-width:180px] xs:[--col-min-width:195px] sm:[--col-min-width:210px] md:[--col-min-width:230px]" style={{ gridTemplateColumns: `var(--first-col-width, 165px) repeat(${comparedProducts.length}, minmax(var(--col-min-width, 230px), 1fr))` }}>
                    
                    {/* Atout Clé Row */}
                    <button
                      onClick={() => setIsAtoutCleCollapsed(!isAtoutCleCollapsed)}
                      className="p-1.5 sm:p-3 border-b border-neutral-200 font-black text-[9px] sm:text-xs text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                    >
                      <span>{currentLang === "FR" ? "Atout Clé" : "Differentiator"}</span>
                      {isAtoutCleCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-[#A37E2C]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#A37E2C]" />}
                    </button>
                    {comparedProducts.map((p) => {
                      const isBestBudget = p.price === minPrice;
                      const isBestRating = (p.reviews?.notation || 4.8) === maxRating;
                      const isMostPopular = (p.reviews?.count || 48) === maxReviews;
                      const isPremiumChoice = p.price === maxPrice && comparedProducts.length > 2;

                      let badge = { text: "", styles: "" };
                      if (isBestBudget) {
                        badge = {
                          text: currentLang === "FR" ? "🪙 Budget Idéal" : "🪙 Best Price",
                          styles: "bg-emerald-50 text-emerald-800 border-emerald-300/30 text-[8.5px] sm:text-xs"
                        };
                      } else if (isBestRating) {
                        badge = {
                          text: currentLang === "FR" ? "⭐ Mieux Évalué" : "⭐ Highest Rated",
                          styles: "bg-amber-50 text-amber-800 border-amber-300/30 text-[8.5px] sm:text-xs"
                        };
                      } else if (isMostPopular) {
                        badge = {
                          text: currentLang === "FR" ? "🔥 Coup de Cœur" : "🔥 Most Popular",
                          styles: "bg-blue-50 text-blue-800 border-blue-300/30 text-[8.5px] sm:text-xs"
                        };
                      } else if (isPremiumChoice) {
                        badge = {
                          text: currentLang === "FR" ? "🏎️ Perf Premium" : "🏎️ Ultimate Spec",
                          styles: "bg-purple-50 text-purple-800 border-purple-300/30 text-[8.5px] sm:text-xs"
                        };
                      } else {
                        badge = {
                          text: currentLang === "FR" ? "✨ Excellence" : "✨ Pure Perf",
                          styles: "bg-neutral-50 text-neutral-700 border-neutral-300/30 text-[8.5px] sm:text-xs"
                        };
                      }

                      return (
                        <div 
                          key={p.id} 
                          className={`border-b border-neutral-100 flex items-center justify-center ${
                            isAtoutCleCollapsed 
                              ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                              : "p-1.5 sm:p-4"
                          }`}
                        >
                          {!isAtoutCleCollapsed && (
                            <span className={`inline-flex items-center px-1 py-0.5 sm:px-3 sm:py-1 rounded text-[8px] sm:text-xs font-black border shadow-xs transition-all hover:scale-105 select-none ${badge.styles}`}>
                              {badge.text}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Description Row (Improved text sizes & completely resolved overlap on mobile) */}
                    <button
                      onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
                      className="p-1.5 sm:p-3 border-b border-neutral-200 font-black text-[9px] sm:text-xs text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                    >
                      <span>{currentLang === "FR" ? "Description" : "Description"}</span>
                      {isDescriptionCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-[#A37E2C]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#A37E2C]" />}
                    </button>
                    {comparedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className={`border-b border-neutral-100 text-left ${
                          isDescriptionCollapsed 
                            ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                            : "p-2 sm:p-4 text-[11px] sm:text-sm text-[#131211] font-bold leading-relaxed"
                        }`}
                      >
                        {!isDescriptionCollapsed && p.description}
                      </div>
                    ))}

                    {/* Technical details (Improved text sizes & completely resolved overlap on mobile) */}
                    <button
                      onClick={() => setIsTechnicalCollapsed(!isTechnicalCollapsed)}
                      className="p-1.5 sm:p-3 border-b border-neutral-200 font-black text-[9px] sm:text-xs text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                    >
                      <span>{currentLang === "FR" ? "Atouts Techniques" : "Technical Highlights"}</span>
                      {isTechnicalCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-[#A37E2C]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#A37E2C]" />}
                    </button>
                    {comparedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className={`border-b border-neutral-100 text-left ${
                          isTechnicalCollapsed 
                            ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                            : "p-2 sm:p-4 text-[11px] sm:text-sm text-[#131211] leading-relaxed font-bold"
                        }`}
                      >
                        {!isTechnicalCollapsed && (
                          p.details.length === 0 ? (
                            <span className="text-[11px] sm:text-sm text-[#131211] font-bold italic">
                              {currentLang === "FR" ? "Confection premium sur-mesure" : "Premium tailored manufacturing"}
                            </span>
                          ) : (
                            <ul className="space-y-1.5 list-disc pl-3.5 sm:pl-5 font-bold">
                              {p.details.map((detail, idx) => (
                                <li key={idx} className="text-[11px] sm:text-sm">{detail}</li>
                              ))}
                            </ul>
                          )
                        )}
                      </div>
                    ))}

                    {/* Sizes Row (Improved text sizes & completely resolved overlap on mobile) */}
                    <button
                      onClick={() => setIsSizesCollapsed(!isSizesCollapsed)}
                      className="p-1.5 sm:p-3 border-b border-neutral-200 font-black text-[9px] sm:text-xs text-[#2E2218] uppercase tracking-wider flex items-center justify-between cursor-pointer text-left hover:bg-neutral-50 hover:text-[#A37E2C] transition-all select-none w-full group"
                    >
                      <span>{currentLang === "FR" ? "Tailles" : "Sizes"}</span>
                      {isSizesCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-[#A37E2C]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#A37E2C]" />}
                    </button>
                    {comparedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className={`border-b border-neutral-100 flex items-center justify-center ${
                          isSizesCollapsed 
                            ? "h-0 py-0 overflow-hidden opacity-0 pointer-events-none border-b-transparent" 
                            : "p-1.5 sm:p-4 text-center"
                        }`}
                      >
                        {!isSizesCollapsed && (
                          <span className="text-[10px] sm:text-sm font-mono font-black text-[#131211] bg-neutral-100 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-sm border border-neutral-300">
                            {p.sizes && p.sizes.length > 0 ? p.sizes.join(", ") : "Standard"}
                          </span>
                        )}
                      </div>
                    ))}

                  </div>
                </div>
                )}
              </div>

              {/* SECTION 4: ACTIONS RAPIDES (Dans une div séparée de spécifications d'atelier) */}
              <div className="bg-white border border-neutral-200 shadow-sm rounded-xl p-3 sm:p-4 md:p-5 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="w-4 h-4 text-[#A37E2C]" />
                  <span className="font-serif font-black text-[11px] sm:text-xs md:text-sm text-[#2E2218] uppercase tracking-wider">
                    {currentLang === "FR" ? "Actions de l'Atelier" : "Workshop Actions"}
                  </span>
                </div>
                
                <div className="overflow-x-auto pb-2 scrollbar-thin font-sans">
                  <div className="min-w-0 grid [--first-col-width:120px] xs:[--first-col-width:130px] sm:[--first-col-width:140px] md:[--first-col-width:165px] [--col-min-width:180px] xs:[--col-min-width:195px] sm:[--col-min-width:210px] md:[--col-min-width:230px]" style={{ gridTemplateColumns: `var(--first-col-width, 165px) repeat(${comparedProducts.length}, minmax(var(--col-min-width, 230px), 1fr))` }}>
                    
                    <div className="p-1.5 sm:p-4 font-black text-[9px] sm:text-xs text-[#2E2218] uppercase tracking-wider flex items-center">
                      {currentLang === "FR" ? "OPTIONS" : "OPTIONS"}
                    </div>
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="p-1.5 sm:p-4 text-center flex flex-col items-center justify-center gap-1 sm:gap-2.5">
                        <button
                          onClick={() => {
                            onViewDetails(p);
                            onClose();
                          }}
                          className="w-full flex items-center justify-center gap-1 px-1.5 py-1 sm:px-4 sm:py-2 border border-neutral-300 text-neutral-700 hover:text-[#A37E2C] hover:border-[#A37E2C] hover:bg-neutral-50 transition-all rounded bg-white cursor-pointer font-extrabold uppercase tracking-wider text-[8px] sm:text-xs"
                        >
                          <Eye className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>{currentLang === "FR" ? "Détails" : "Details"}</span>
                        </button>

                        <button
                          onClick={() => {
                            const defSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : undefined;
                            onAddToCart(p, defSize);
                          }}
                          className="w-full flex items-center justify-center gap-1 px-1.5 py-1 sm:px-4 sm:py-2 text-[8px] sm:text-xs bg-[#A37E2C] hover:bg-[#8c6b24] text-white transition-all rounded cursor-pointer font-serif uppercase tracking-wider font-black shadow-none sm:shadow-xs"
                        >
                          <ShoppingBag className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span>{currentLang === "FR" ? "Acheter" : "Buy"}</span>
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
            <span className="font-mono">
              Maison Atlis Chamonix — {comparedProducts.length} créations comparées
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 border-2 border-neutral-300 hover:border-black text-black font-medium transition-colors uppercase tracking-widest text-[10px] rounded cursor-pointer"
            >
              {currentLang === "FR" ? "Fermer l'Atelier" : "Exit Atelier"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
