import { useState } from "react";
import { 
  ShieldCheck, 
  Hammer, 
  Ruler, 
  Award 
} from "lucide-react";

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: "garantie" | "personnalisation" | "tailles" | null;
  currentLang: string;
}

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  serviceType,
  currentLang,
}: ServiceDetailsModalProps) {
  // Monogram State
  const [monogramText, setMonogramText] = useState("A.S.C.");
  const [monogramStyle, setMonogramStyle] = useState<"serif" | "mono" | "sans">("serif");
  const [placement, setPlacement] = useState<"cadre" | "manche" | "cuir">("cadre");
  const [isEmbroideryApplied, setIsEmbroideryApplied] = useState(false);

  // Sizing Calculator State
  const [heightCm, setHeightCm] = useState(178);
  const [armLength, setArmLength] = useState(65);
  const [sportType, setSportType] = useState<"cycling" | "hiking" | "fitness">("cycling");

  // Warranty Status State
  const [serialNumber, setSerialNumber] = useState("ATL-1924-X49");
  const [warrantyChecked, setWarrantyChecked] = useState(false);
  const [warrantyResult, setWarrantyResult] = useState<any>(null);

  if (!isOpen || !serviceType) return null;

  const isFR = currentLang === "FR";

  const handleApplyEngraving = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmbroideryApplied(true);
    setTimeout(() => {
      setIsEmbroideryApplied(false);
    }, 4500);
  };

  const handleCheckWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    setWarrantyChecked(true);
    
    // Simulate lookup based on serial input
    const snLower = serialNumber.toLowerCase().trim();
    if (snLower.includes("1924") || snLower.includes("atl")) {
      setWarrantyResult({
        status: "active",
        model: isFR ? "Atlis Olympe Super-Carbon (Série bespoke)" : "Atlis Olympe Super-Carbon (Bespoke Series)",
        registeredDate: "14/03/2025",
        coverage: isFR ? "Garantie à vie Or - Pièces & Service Couture" : "Gold Lifetime Warranty - Parts & Tailoring Service",
        techAdvisor: "Dominique M., Atelier de Chamonix",
      });
    } else {
      setWarrantyResult({
        status: "custom",
        model: isFR ? "Création Atelier Atlis" : "Atlis Custom Creation",
        registeredDate: isFR ? "Date d'achat" : "Purchase Date",
        coverage: isFR ? "Garantie standard Maison [A-1 - 5 ans]" : "Maison Standard Warranty [A-1 - 5 years]",
        techAdvisor: "Service Client Atlis",
      });
    }
  };

  // Calculate size based on inputs
  const calculateBespokeSize = () => {
    let sizeDesignation = "M";
    let detailExplanation = "";

    if (sportType === "cycling") {
      const frameSize = Math.round(heightCm * 0.31);
      if (heightCm < 165) { sizeDesignation = "XS (48cm)"; }
      else if (heightCm < 173) { sizeDesignation = "S (51cm)"; }
      else if (heightCm < 182) { sizeDesignation = "M (54cm)"; }
      else if (heightCm < 190) { sizeDesignation = "L (57cm)"; }
      else { sizeDesignation = "XL (60cm)"; }

      detailExplanation = isFR 
        ? `Taille de cadre suggérée de ${frameSize}cm avec un recul de selle neutre. Votre allonge de bras de ${armLength}cm recommande une potence de 100mm.` 
        : `Suggested frame size of ${frameSize}cm with neutral saddle offset. Based on your ${armLength}cm reach, we recommend a 100mm stem.`;
    } else if (sportType === "hiking") {
      if (heightCm < 168) { sizeDesignation = "S"; }
      else if (heightCm < 180) { sizeDesignation = "M"; }
      else if (heightCm < 192) { sizeDesignation = "L"; }
      else { sizeDesignation = "XL"; }

      detailExplanation = isFR 
        ? `La longueur de bras développée est optimisée pour préserver l'élasticité dorsale lors de l'utilisation de bâtons de marche active.` 
        : `Sleeve articulation is optimized to preserve absolute dorsal elasticity when using active trekking poles.`;
    } else {
      // Fitness
      if (heightCm < 170) { sizeDesignation = "S"; }
      else if (heightCm < 183) { sizeDesignation = "M"; }
      else { sizeDesignation = "L"; }

      detailExplanation = isFR 
        ? "Coupe compressante ciblée de l'Équateur Atlis pour un maintien optimal à l'effort cardio-vasculaire." 
        : "Targeted compressive weave from the Atlis Equator to ensure peak oxygenation during intense training.";
    }

    return { sizeDesignation, detailExplanation };
  };

  const { sizeDesignation, detailExplanation } = calculateBespokeSize();

  return (
    <div 
      id="service-details-modal"
      className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
    >
      {/* Clickable Backdrop */}
      <div className="absolute inset-0 cursor-pointer touch-none" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#FAF9F4] text-[#131211] shadow-2xl rounded-xl border border-neutral-300/50 flex flex-col max-h-[90vh] overflow-hidden z-10">
        
        {/* Sticky Header */}
        <div className="p-6 border-b border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#A37E2C] font-bold">
              {isFR ? "Maison Atlis — Service d'Exception" : "Maison Atlis — Premium Atelier"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-3 border border-neutral-300 hover:border-[#A37E2C] text-[#131211] hover:text-[#A37E2C] transition-all cursor-pointer text-xs font-bold uppercase tracking-widest rounded-md"
          >
            {isFR ? "Fermer" : "Close"} ✕
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 overscroll-contain">
          
          {serviceType === "garantie" && (
            <div className="space-y-8 animate-slide-in">
              {/* Banner */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs text-[#A37E2C] font-mono tracking-widest uppercase">
                  <ShieldCheck className="w-5 h-5 text-[#A37E2C]" />
                  <span>{isFR ? "Assistance Permanente & Remplacement" : "Permanent Support & Lifespan Guarantee"}</span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-[#2E2218]">
                  {isFR ? "Garantie et Service Client d'Excellence" : "Executive Warranty & Lifetime Support"}
                </h2>
                <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-light">
                  {isFR
                    ? "Chaque création Maison Atlis est forgée pour traverser les décennies. L'excellence n'admet aucun compromis : nous assurons un support continu basé dans notre atelier d'origine à Chamonix-Mont-Blanc."
                    : "Every Maison Atlis creation is designed to traverse decades. Excellence admits no compromise: we provide continuous support directly run from our historic Chamonix-Mont-Blanc workshop."}
                </p>
              </div>

              {/* Detail list Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-white border border-neutral-200 rounded shadow-xs space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2E2218] text-sm">
                    <span className="text-[#A37E2C]">✦</span>
                    <h4>{isFR ? "Garantie à Vie d'Origine" : "Lifetime Origin Guarantee"}</h4>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {isFR 
                      ? "Nos cadres de vélos en carbone de haut module et nos soudures structurelles sont garantis à vie. Nous réparons ou remplaçons sans restriction."
                      : "Our high-modulus carbon bicycle frames and structural welds carry an absolute lifetime warranty. We repair or replace without limitation."}
                  </p>
                </div>

                <div className="p-5 bg-white border border-neutral-200 rounded shadow-xs space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2E2218] text-sm">
                    <span className="text-[#A37E2C]">✦</span>
                    <h4>{isFR ? "Le Service de Restauration Alpine" : "Alpine Restoration Service"}</h4>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {isFR 
                      ? "Après une saison rude dans les Alpes ou des impacts majeurs en descente, rapportez votre matériel pour une révision d'alignement au laser et une ré-imperméabilisation thermique."
                      : "After a heavy outdoor season in the Alps, return your equipment for custom laser-alignment testing and premium thermal re-proofing."}
                  </p>
                </div>
              </div>

              {/* Interactive simulated tools - Warranty serial check */}
              <div className="p-6 bg-[#211F1D] text-white rounded-lg space-y-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-[#A37E2C] font-bold uppercase">
                    {isFR ? "ATELIER DIRECT - VÉRIFICATEUR DE CERTIFICAT" : "CHAMONIX ATELIER - CERTIFICATE SEARCH"}
                  </span>
                  <h4 className="text-base font-serif font-medium text-white">
                    {isFR ? "Vérifiez l'état de garantie de votre équipement" : "Lookup your device warranty coverage"}
                  </h4>
                  <p className="text-xs text-neutral-400 font-light">
                    {isFR 
                      ? "Saisissez le numéro de série inscrit sous le boîtier de pédalier ou sur l'étiquette thermocollée de votre veste."
                      : "Input the serial number indicated on your carbon frame's underside or inside your technical jacket's collar."}
                  </p>
                </div>

                <form onSubmit={handleCheckWarranty} className="flex flex-col sm:flex-row gap-3 py-1">
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. ATL-1924-X49"
                    className="flex-1 bg-white/5 border border-white/20 focus:border-[#A37E2C] rounded px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[#A37E2C] hover:bg-[#b08b35] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded cursor-pointer shrink-0"
                  >
                    {isFR ? "Rechercher" : "Lookup Code"}
                  </button>
                </form>

                {warrantyChecked && warrantyResult && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded space-y-2 animate-fade-in text-xs font-mono">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-zinc-400">{isFR ? "Modèle identifié :" : "Product Identified :"}</span>
                      <span className="text-[#FAF9F4] font-medium">{warrantyResult.model}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-zinc-400">{isFR ? "Enregistrement :" : "Registered On :"}</span>
                      <span className="text-[#FAF9F4]">{warrantyResult.registeredDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-zinc-400">{isFR ? "Type de contrat :" : "Type of Coverage :"}</span>
                      <span className="text-[#A37E2C] font-bold">{warrantyResult.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">{isFR ? "Artisan Maître assigné :" : "Assigned Craftsman :"}</span>
                      <span className="text-[#FAF9F4] italic">{warrantyResult.techAdvisor}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {serviceType === "personnalisation" && (
            <div className="space-y-8 animate-slide-in">
              {/* Banner */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs text-[#A37E2C] font-mono tracking-widest uppercase">
                  <Hammer className="w-5 h-5 text-[#A37E2C]" />
                  <span>{isFR ? "Gravure Laser & Broderie Couture" : "Bespoke Engraving & Embroidery"}</span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-[#2E2218]">
                  {isFR ? "Personnalisation Unique à la Main" : "Signature Custom Monogramming"}
                </h2>
                <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-light">
                  {isFR
                    ? "Incorporez votre signature, vos initiales ou vos armoiries de club sportif pour que votre équipement devienne une pièce de collection unique au monde."
                    : "Engrave your initials, performance milestones, or club crests into the structural materials to turn your athletic gear into a customized work of art."}
                </p>
              </div>

              {/* Graphic Demonstration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {isFR 
                      ? "Nos tailleurs brodent à l'aide de fils d'or véritable et de fils techniques réfléchissants pour allier visibilité de nuit et prestige d'exception. Pour les vélos aérodynamiques, un laser picoseconde grave le vernis carbone ou le cuir de la selle."
                      : "Our artisans use real gold-lined thread and high-retroreflective synthetic weave to marry elite night visibility with aesthetic nobility. For frame components, precise fiber laser-etching is applied to the carbon clear coat."}
                  </p>

                  <ul className="space-y-2 text-xs text-[#2E2218]">
                    <li className="flex items-center gap-2">
                      <span className="text-[#A37E2C]">✔</span>
                      <strong>{isFR ? "Fils d'or 18 carat" : "18-Carat Gold Embroidery underlay"}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#A37E2C]">✔</span>
                      <strong>{isFR ? "Gravure nanométrique" : "Nanometer carbon clear coat engraving"}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#A37E2C]">✔</span>
                      <strong>{isFR ? "Certifié Chamonix Bespoke" : "Chamonix Bespoke certificate of provenance"}</strong>
                    </li>
                  </ul>
                </div>

                {/* Interactive Monogram Tool */}
                <div className="p-6 bg-white border border-neutral-300 rounded-lg shadow-sm space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-[#A37E2C] font-extrabold uppercase">
                      {isFR ? "CONFIGURATEUR DE MONOGRAMME" : "MONOGRAM CONFIGURATOR WORKSHOP"}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-neutral-800">
                      {isFR ? "Visualisez vos initiales sur l'équipement" : "Preview your custom initials on-gear"}
                    </h4>
                  </div>

                  <form onSubmit={handleApplyEngraving} className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">{isFR ? "Vos initiales" : "Your initials"}</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={monogramText}
                        onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1.5 text-xs text-[#131211] font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#A37E2C]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">{isFR ? "Police" : "Font style"}</label>
                        <select
                          value={monogramStyle}
                          onChange={(e: any) => setMonogramStyle(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-[11px] text-[#131211] focus:outline-none focus:ring-1 focus:ring-[#A37E2C]"
                        >
                          <option value="serif">Serif Classique</option>
                          <option value="mono">Tech Monospace</option>
                          <option value="sans">Modern Sans</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">{isFR ? "Support" : "Component"}</label>
                        <select
                          value={placement}
                          onChange={(e: any) => setPlacement(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-[11px] text-[#131211] focus:outline-none"
                        >
                          <option value="cadre">{isFR ? "Tube de selle" : "Carbon frame"}</option>
                          <option value="manche">{isFR ? "Manchette (veste)" : "Sleeve cuff"}</option>
                          <option value="cuir">{isFR ? "Selle cuir" : "Saddle leather"}</option>
                        </select>
                      </div>
                    </div>

                    {/* Miniature live preview rendering canvas */}
                    <div className="h-28 bg-[#1E1C1A] text-[#FAF9F4] rounded border border-neutral-800 flex flex-col justify-center items-center p-3 relative overflow-hidden select-none">
                      <div className="absolute top-2 left-2 text-[8px] font-mono text-neutral-500 tracking-wider">
                        {isFR ? "STUDIO VISUEL LIVE" : "VIRTUAL STUDIO LIVE"}
                      </div>

                      {/* Render of mockup structure based on selected tool */}
                      {placement === "cadre" && <div className="w-16 h-1 bg-gradient-to-r from-neutral-800 via-zinc-700 to-neutral-800 absolute transform rotate-12 opacity-80" />}
                      {placement === "cuir" && <div className="w-14 h-10 border border-amber-800 bg-[#3a2010] rounded-sm absolute opacity-80" />}
                      {placement === "manche" && <div className="w-12 h-16 border-l border-zinc-650 bg-neutral-800 absolute opacity-80" />}

                      <span 
                        className={`text-xl font-bold tracking-widest text-[#A37E2C] bg-black/40 px-3 py-1.5 border border-[#A37E2C]/20 rounded z-10 ${
                          monogramStyle === "serif" ? "font-serif italic" : monogramStyle === "mono" ? "font-mono" : "font-sans uppercase"
                        }`}
                        style={{ textShadow: "0 0 10px rgba(163, 126, 44, 0.4)" }}
                      >
                        {monogramText || "A.S.C."}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4] text-[10px] font-bold uppercase tracking-widest rounded transition-colors cursor-pointer"
                    >
                      {isFR ? "Confirmer la personnalisation" : "Save dynamic engraving"}
                    </button>

                    {isEmbroideryApplied && (
                      <p className="text-[10px] text-center text-emerald-600 font-mono italic animate-pulse">
                        ✓ {isFR ? "Marquage sauvegardé pour votre prochaine réservation d'atelier !" : "Custom configuration logged for your next workshop reservation!"}
                      </p>
                    )}
                  </form>
                </div>
              </div>

            </div>
          )}

          {serviceType === "tailles" && (
            <div className="space-y-8 animate-slide-in">
              {/* Banner */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-xs text-[#A37E2C] font-mono tracking-widest uppercase">
                  <Ruler className="w-5 h-5 text-[#A37E2C]" />
                  <span>{isFR ? "Alignement Biomécanique & Mesures" : "Biomechanical Alignment & Geometry"}</span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-[#2E2218]">
                  {isFR ? "Conseil de Taille Bespoke" : "Anatomical Size Advisor"}
                </h2>
                <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-light">
                  {isFR
                    ? "Choisissez l'équipement idéal sans hésitation. Remplissez vos données biométriques ci-dessous pour calculer instantanément votre cadre ou votre coupe de vêtement recommandée."
                    : "Choose your perfect model without overthinking. Fill in your physiological proportions below to calculate your ideal frame geometry or targeted textile cut in real-time."}
                </p>
              </div>

              {/* The Sizing Calculator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left: Input Form */}
                <div className="p-6 bg-white border border-neutral-300/40 rounded-lg shadow-sm space-y-5">
                  <div className="border-b border-neutral-200 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#131211]">
                      {isFR ? "Calculateur d'Anatomie Alpine" : "Alpine Biometrics Calculator"}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Sport dropdown */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">
                        {isFR ? "Votre Discipline" : "Specialty discipline"}
                      </label>
                      <select
                        value={sportType}
                        onChange={(e: any) => setSportType(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-[#131211] font-semibold focus:outline-none"
                      >
                        <option value="cycling">{isFR ? "Aérodynamisme (Vélo)" : "Aerodynamics (Cycling)"}</option>
                        <option value="fitness">{isFR ? "Résistance Active (Fitness)" : "Active Resistance (Fitness)"}</option>
                        <option value="hiking">{isFR ? "Exploration Sauvage (Alpin)" : "Wild Exploration (Hiking)"}</option>
                      </select>
                    </div>

                    {/* Height CM Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">
                          {isFR ? "Votre Taille (cm)" : "Your Height (cm)"}
                        </label>
                        <span className="font-mono text-xs font-bold text-[#A37E2C]">{heightCm} cm</span>
                      </div>
                      <input
                        type="range"
                        min={150}
                        max={210}
                        value={heightCm}
                        onChange={(e) => setHeightCm(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#A37E2C]"
                      />
                    </div>

                    {/* Arm Reach Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">
                          {isFR ? "Longueur de Bras (cm)" : "Inseam or Arm Reach (cm)"}
                        </label>
                        <span className="font-mono text-xs font-bold text-[#A37E2C]">{armLength} cm</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={90}
                        value={armLength}
                        onChange={(e) => setArmLength(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#A37E2C]"
                      />
                    </div>

                  </div>
                </div>

                {/* Right: Recommendation results card */}
                <div className="bg-[#2E2218] text-white p-6 rounded-lg space-y-4 shadow-md h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono tracking-widest text-[#A37E2C] font-bold uppercase">
                      {isFR ? "ALIGNEMENT RECOMMANDÉ" : "RECONCILED GEOMETRY"}
                    </span>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-400">
                        {isFR ? "Taille conseillée Maison Atlis :" : "Recommended Atlis bespoke size :"}
                      </p>
                      <p className="text-4xl font-serif font-black text-[#A37E2C] tracking-tight">
                        {sizeDesignation}
                      </p>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-light">
                      {detailExplanation}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 text-[10px] text-zinc-400 space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span>{isFR ? "Indice de compression" : "Compression Index"}</span>
                      <span className="text-white font-bold">{sportType === "fitness" ? "9.4/10" : "7.2/10"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isFR ? "Coefficient d'efficience" : "Efficiency Coefficient"}</span>
                      <span className="text-emerald-400 font-bold">+8.4% K-Transfer</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Assistance recommendation */}
              <div className="p-4 bg-zinc-100 border-l-4 border-[#A37E2C] text-xs text-zinc-700 leading-normal flex items-start gap-3">
                <span className="text-base">📢</span>
                <p>
                  {isFR 
                    ? "Besoin d'une validation encore plus minutieuse ? Nos maîtres-couturiers et experts biomec sont joignables directement via notre assistant de chat en direct en bas à droite de l'écran."
                    : "Need an even tighter fit assessment? Our master-tailors and biomechanics support staff can be engaged via the live chat icon in the lower-right margin of your screen."}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-neutral-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono uppercase font-light">
            <Award className="w-4 h-4 text-[#A37E2C] shrink-0" />
            <span>{isFR ? "Chamonix Haute Performance 1924" : "Chamonix High Performance Couture 1924"}</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#131211] hover:bg-[#A37E2C] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded cursor-pointer"
          >
            {isFR ? "Retourner au Catalogue" : "Return to Catalog"}
          </button>
        </div>

      </div>
    </div>
  );
}
