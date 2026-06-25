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

const T: Record<string, Record<string, string>> = {
  EN: {
    atelierTitle: "Maison Atlis — Premium Atelier",
    close: "Close ✕",
    warrantyTitle: "Permanent Support & Lifespan Guarantee",
    warrantyHeader: "Executive Warranty & Lifetime Support",
    warrantyDesc: "Every Maison Atlis creation is designed to traverse decades. Excellence admits no compromise: we provide continuous support directly run from our historic Chamonix-Mont-Blanc workshop.",
    lifetimeGuarantee: "Lifetime Origin Guarantee",
    lifetimeGuaranteeDesc: "Our high-modulus carbon bicycle frames and structural welds carry an absolute lifetime warranty. We repair or replace without limitation.",
    alpineRestoration: "Alpine Restoration Service",
    alpineRestorationDesc: "After a heavy outdoor season in the Alps, return your equipment for custom laser-alignment testing and premium thermal re-proofing.",
    certificateSearch: "CHAMONIX ATELIER - CERTIFICATE SEARCH",
    lookupHeader: "Lookup your device warranty coverage",
    lookupDesc: "Input the serial number indicated on your carbon frame's underside or inside your technical jacket's collar.",
    lookupBtn: "Lookup Code",
    modelIdentified: "Product Identified:",
    registeredOn: "Registered On:",
    coverageType: "Type of Coverage:",
    assignedCraftsman: "Assigned Craftsman:",
    goldWarranty: "Gold Lifetime Warranty - Parts & Tailoring Service",
    bespokeSeries: "Atlis Olympe Super-Carbon (Bespoke Series)",
    stdWarranty: "Maison Standard Warranty [A-1 - 5 years]",
    atlisCreation: "Atlis Custom Creation",
    purchaseDate: "Purchase Date",
    clientService: "Atlis Customer Service",
    
    // Customization
    customTitle: "Bespoke Engraving & Embroidery",
    customHeader: "Signature Custom Monogramming",
    customDesc: "Engrave your initials, performance milestones, or club crests into the structural materials to turn your athletic gear into a customized work of art.",
    customBody: "Our artisans use real gold-lined thread and high-retroreflective synthetic weave to marry elite night visibility with aesthetic nobility. For frame components, precise fiber laser-etching is applied to the carbon clear coat.",
    goldThread: "18-Carat Gold Embroidery underlay",
    nanoEngraving: "Nanometer carbon clear coat engraving",
    provenanceCert: "Chamonix Bespoke certificate of provenance",
    monogramWorkshop: "MONOGRAM CONFIGURATOR WORKSHOP",
    previewInitials: "Preview your custom initials on-gear",
    yourInitials: "Your initials",
    fontStyle: "Font style",
    component: "Component",
    seatTube: "Carbon frame",
    sleeveCuff: "Sleeve cuff",
    saddleLeather: "Saddle leather",
    liveStudio: "VIRTUAL STUDIO LIVE",
    saveEngraving: "Save dynamic engraving",
    markingSaved: "Custom configuration logged for your next workshop reservation!",
    
    // Sizes
    biomechanicalTitle: "Biomechanical Alignment & Geometry",
    advisorHeader: "Anatomical Size Advisor",
    advisorDesc: "Choose your perfect model without overthinking. Fill in your physiological proportions below to calculate your ideal frame geometry or targeted textile cut in real-time.",
    biometricsCalc: "Alpine Biometrics Calculator",
    discipline: "Specialty discipline",
    cycling: "Aerodynamics (Cycling)",
    fitness: "Active Resistance (Fitness)",
    hiking: "Wild Exploration (Hiking)",
    heightLabel: "Your Height (cm)",
    armLabel: "Inseam or Arm Reach (cm)",
    reconciledGeometry: "RECONCILED GEOMETRY",
    recommendedBespoke: "Recommended Atlis bespoke size:",
    compressionIndex: "Compression Index",
    efficiencyCoef: "Efficiency Coefficient",
    moreValidation: "Need an even tighter fit assessment? Our master-tailors and biomechanics support staff can be engaged via the live chat icon in the lower-right margin of your screen.",
    
    // Footer
    highPerformance: "Chamonix High Performance Couture 1924",
    returnCatalog: "Return to Catalog"
  },
  FR: {
    atelierTitle: "Maison Atlis — Service d'Exception",
    close: "Fermer ✕",
    warrantyTitle: "Assistance Permanente & Remplacement",
    warrantyHeader: "Garantie et Service Client d'Excellence",
    warrantyDesc: "Chaque création Maison Atlis est forgée pour traverser les décennies. L'excellence n'admet aucun compromis : nous assurons un support continu basé dans notre atelier d'origine à Chamonix-Mont-Blanc.",
    lifetimeGuarantee: "Garantie à Vie d'Origine",
    lifetimeGuaranteeDesc: "Nos cadres de vélos en carbone de haut module et nos soudures structurelles sont garantis à vie. Nous réparons ou remplaçons sans restriction.",
    alpineRestoration: "Le Service de Restauration Alpine",
    alpineRestorationDesc: "Après une saison rude dans les Alpes ou des impacts majeurs en descente, rapportez votre matériel pour une révision d'alignement au laser et une ré-imperméabilisation thermique.",
    certificateSearch: "ATELIER DIRECT - VÉRIFICATEUR DE CERTIFICAT",
    lookupHeader: "Vérifiez l'état de garantie de votre équipement",
    lookupDesc: "Saisissez le numéro de série inscrit sous le boîtier de pédalier ou sur l'étiquette thermocollée de votre veste.",
    lookupBtn: "Rechercher",
    modelIdentified: "Modèle identifié :",
    registeredOn: "Enregistrement :",
    coverageType: "Type de contrat :",
    assignedCraftsman: "Artisan Maître assigné :",
    goldWarranty: "Garantie à vie Or - Pièces & Service Couture",
    bespokeSeries: "Atlis Olympe Super-Carbon (Série bespoke)",
    stdWarranty: "Garantie standard Maison [A-1 - 5 ans]",
    atlisCreation: "Création Atelier Atlis",
    purchaseDate: "Date d'achat",
    clientService: "Service Client Atlis",
    
    // Customization
    customTitle: "Gravure Laser & Broderie Couture",
    customHeader: "Personnalisation Unique à la Main",
    customDesc: "Incorporez votre signature, vos initiales ou vos armoiries de club sportif pour que votre équipement devienne une pièce de collection unique au monde.",
    customBody: "Nos tailleurs brodent à l'aide de fils d'or véritable et de fils techniques réfléchissants pour allier visibilité de nuit et prestige d'exception. Pour les vélos aérodynamiques, un laser picoseconde grave le vernis carbone ou le cuir de la selle.",
    goldThread: "Fils d'or 18 carat",
    nanoEngraving: "Gravure nanométrique",
    provenanceCert: "Certifié Chamonix Bespoke",
    monogramWorkshop: "CONFIGURATEUR DE MONOGRAMME",
    previewInitials: "Visualisez vos initiales sur l'équipement",
    yourInitials: "Vos initiales",
    fontStyle: "Police",
    component: "Support",
    seatTube: "Tube de selle",
    sleeveCuff: "Manchette (veste)",
    saddleLeather: "Selle cuir",
    liveStudio: "STUDIO VISUEL LIVE",
    saveEngraving: "Confirmer la personnalisation",
    markingSaved: "Marquage sauvegardé pour votre prochaine réservation d'atelier !",
    
    // Sizes
    biomechanicalTitle: "Alignement Biomécanique & Mesures",
    advisorHeader: "Conseil de Taille Bespoke",
    advisorDesc: "Choisissez l'équipement idéal sans hésitation. Remplissez vos données biométriques ci-dessous pour calculer instantanément votre cadre ou votre coupe de vêtement recommandée.",
    biometricsCalc: "Calculateur d'Anatomie Alpine",
    discipline: "Votre Discipline",
    cycling: "Aérodynamisme (Vélo)",
    fitness: "Résistance Active (Fitness)",
    hiking: "Exploration Sauvage (Alpin)",
    heightLabel: "Votre Taille (cm)",
    armLabel: "Longueur de Bras (cm)",
    reconciledGeometry: "ALIGNEMENT RECOMMANDÉ",
    recommendedBespoke: "Taille conseillée Maison Atlis :",
    compressionIndex: "Indice de compression",
    efficiencyCoef: "Coefficient d'efficience",
    moreValidation: "Besoin d'une validation encore plus minutieuse ? Nos maîtres-couturiers et experts biomec sont joignables directement via notre assistant de chat en direct en bas à droite de l'écran.",
    
    // Footer
    highPerformance: "Chamonix Haute Performance 1924",
    returnCatalog: "Retourner au Catalogue"
  },
  DE: {
    atelierTitle: "Maison Atlis — Premium-Atelier",
    close: "Schließen ✕",
    warrantyTitle: "Lebenslange Garantie & Unterstützung",
    warrantyHeader: "Garantie & Erstklassiger Kundendienst",
    warrantyDesc: "Jedes Produkt von Maison Atlis ist darauf ausgelegt, Jahrzehnte zu überdauern. Exzellenz duldet keine Kompromisse: Wir bieten fortlaufende Unterstützung direkt aus unserem historischen Atelier in Chamonix-Mont-Blanc.",
    lifetimeGuarantee: "Lebenslange Originalgarantie",
    lifetimeGuaranteeDesc: "Unsere hochmoduligen Carbonrahmen und strukturellen Schweißnähte haben eine lebenslange Garantie. Wir reparieren oder ersetzen ohne Einschränkungen.",
    alpineRestoration: "Alpiner Restaurierungsservice",
    alpineRestorationDesc: "Bringen Sie Ihre Ausrüstung nach einer anspruchsvollen Outdoor-Saison in den Alpen zu uns zurück, um eine präzise Laserausrichtung und eine erstklassige thermische Neuimprägnierung durchführen zu lassen.",
    certificateSearch: "ATELIER DIREKT - ZERTIFIKATSPRÜFUNG",
    lookupHeader: "Garantiestatus Ihrer Ausrüstung prüfen",
    lookupDesc: "Geben Sie die Seriennummer ein, die sich unter dem Tretlager oder auf der Innenseite des Jackenkragens befindet.",
    lookupBtn: "Suchen",
    modelIdentified: "Identifiziertes Modell:",
    registeredOn: "Registriert am:",
    coverageType: "Garantie-Abdeckung:",
    assignedCraftsman: "Zugeordneter Handwerksmeister:",
    goldWarranty: "Goldene lebenslange Garantie - Teile & Schneiderservice",
    bespokeSeries: "Atlis Olympe Super-Carbon (Bespoke-Serie)",
    stdWarranty: "Standardgarantie Maison [A-1 - 5 Jahre]",
    atlisCreation: "Maison Atlis Maßanfertigung",
    purchaseDate: "Kaufdatum",
    clientService: "Atlis Kundendienst",
    
    // Customization
    customTitle: "Lasergravur & Maßgeschneiderte Stickerei",
    customHeader: "Einzigartige Personalisierung per Hand",
    customDesc: "Lassen Sie Ihre Unterschrift, Ihre Initialen oder das Wappen Ihres Sportclubs eingravieren, um Ihre Ausrüstung in ein einzigartiges Kunstwerk zu verwandeln.",
    customBody: "Unsere Kunsthandwerker verwenden echten Goldfaden und hochgradig retroreflektierende Fäden, um beste Sichtbarkeit bei Nacht mit außergewöhnlichem Prestige zu verbinden. Carbonrahmen werden präzise mit Lasergravur veredelt.",
    goldThread: "18-Karat Goldbestickung",
    nanoEngraving: "Präzise Lasergravur",
    provenanceCert: "Zertifizierte Herkunft aus Chamonix",
    monogramWorkshop: "MONOGRAMM-KONFIGURATOR",
    previewInitials: "Initialen auf der Ausrüstung visualisieren",
    yourInitials: "Ihre Initialen",
    fontStyle: "Schriftstil",
    component: "Komponente",
    seatTube: "Carbonrahmen",
    sleeveCuff: "Ärmelbund",
    saddleLeather: "Ledersattel",
    liveStudio: "LIVE-VORSCHAU-STUDIO",
    saveEngraving: "Personalisierung speichern",
    markingSaved: "✓ Personalisierung für Ihre nächste Atelierbuchung gespeichert!",
    
    // Sizes
    biomechanicalTitle: "Biomechanische Ausrichtung & Geometrie",
    advisorHeader: "Anatomischer Größenberater",
    advisorDesc: "Wählen Sie ohne Bedenken Ihr perfektes Modell. Geben Sie unten Ihre biometrischen Daten ein, um sofort die empfohlene Rahmengeometrie oder den Textilschnitt zu berechnen.",
    biometricsCalc: "Alpiner Biometrie-Rechner",
    discipline: "Spezialdisziplin",
    cycling: "Aerodynamik (Radsport)",
    fitness: "Aktiver Widerstand (Fitness)",
    hiking: "Wandern & Outdoor (Alpin)",
    heightLabel: "Ihre Größe (cm)",
    armLabel: "Armreichweite (cm)",
    reconciledGeometry: "EMPFOHLENE GEOMETRIE",
    recommendedBespoke: "Empfohlene Maison Atlis Größe:",
    compressionIndex: "Kompressionsindex",
    efficiencyCoef: "Effizienzkoeffizient",
    moreValidation: "Benötigen Sie eine noch genauere Passformberatung? Unsere Schneidermeister und Biomechanik-Experten sind direkt über den Live-Chat unten rechts auf dem Bildschirm erreichbar.",
    
    // Footer
    highPerformance: "Chamonix Hochleistungs-Schneiderei 1924",
    returnCatalog: "Zurück zum Katalog"
  },
  CH: {
    atelierTitle: "Maison Atlis — Premium-Atelier",
    close: "Schliessen ✕",
    warrantyTitle: "Lebenslange Garantie & Unterstützung",
    warrantyHeader: "Garantie & Erstklassiger Kundendienst",
    warrantyDesc: "Jedes Produkt von Maison Atlis ist darauf ausgelegt, Jahrzehnte zu überdauern. Exzellenz duldet keine Kompromisse: Wir bieten fortlaufende Unterstützung direkt aus unserem historischen Atelier in Chamonix-Mont-Blanc.",
    lifetimeGuarantee: "Lebenslange Originalgarantie",
    lifetimeGuaranteeDesc: "Unsere hochmoduligen Carbonrahmen und strukturellen Schweissnähte haben eine lebenslange Garantie. Wir reparieren oder ersetzen ohne Einschränkungen.",
    alpineRestoration: "Alpiner Restaurierungsservice",
    alpineRestorationDesc: "Bringen Sie Ihre Ausrüstung nach einer anspruchsvollen Outdoor-Saison in den Alpen zu uns zurück, um eine präzise Laserausrichtung und eine erstklassige thermische Neuimprägnierung durchführen zu lassen.",
    certificateSearch: "ATELIER DIREKT - ZERTIFIKATSPRÜFUNG",
    lookupHeader: "Garantiestatus Ihrer Ausrüstung prüfen",
    lookupDesc: "Geben Sie die Seriennummer ein, die sich unter dem Tretlager oder auf der Innenseite des Jackenkragens befindet.",
    lookupBtn: "Suchen",
    modelIdentified: "Identifiziertes Modell:",
    registeredOn: "Registriert am:",
    coverageType: "Garantie-Abdeckung:",
    assignedCraftsman: "Zugeordneter Handwerksmeister:",
    goldWarranty: "Goldene lebenslange Garantie - Teile & Schneiderservice",
    bespokeSeries: "Atlis Olympe Super-Carbon (Bespoke-Serie)",
    stdWarranty: "Standardgarantie Maison [A-1 - 5 Jahre]",
    atlisCreation: "Maison Atlis Massanfertigung",
    purchaseDate: "Kaufdatum",
    clientService: "Atlis Kundendienst",
    
    // Customization
    customTitle: "Lasergravur & Massgeschneiderte Stickerei",
    customHeader: "Einzigartige Personalisierung per Hand",
    customDesc: "Lassen Sie Ihre Unterschrift, Ihre Initialen oder das Wappen Ihres Sportclubs eingravieren, um Ihre Ausrüstung in ein einzigartiges Kunstwerk zu verwandeln.",
    customBody: "Unsere Kunsthandwerker verwenden echten Goldfaden und hochgradig retroreflektierende Fäden, um beste Sichtbarkeit bei Nacht mit aussergewöhnlichem Prestige zu verbinden. Carbonrahmen werden präzise mit Lasergravur veredelt.",
    goldThread: "18-Karat Goldbestickung",
    nanoEngraving: "Präzise Lasergravur",
    provenanceCert: "Zertifizierte Herkunft aus Chamonix",
    monogramWorkshop: "MONOGRAMM-KONFIGURATOR",
    previewInitials: "Initialen auf der Ausrüstung visualisieren",
    yourInitials: "Ihre Initialen",
    fontStyle: "Schriftstil",
    component: "Komponente",
    seatTube: "Carbonrahmen",
    sleeveCuff: "Ärmelbund",
    saddleLeather: "Ledersattel",
    liveStudio: "LIVE-VORSCHAU-STUDIO",
    saveEngraving: "Personalisierung speichern",
    markingSaved: "✓ Personalisierung für Ihre nächste Atelierbuchung gespeichert!",
    
    // Sizes
    biomechanicalTitle: "Biomechanische Ausrichtung & Geometrie",
    advisorHeader: "Anatomischer Grössenberater",
    advisorDesc: "Wählen Sie ohne Bedenken Ihr perfektes Modell. Geben Sie unten Ihre biometrischen Daten ein, um sofort die empfohlene Rahmengeometrie oder den Textilschnitt zu berechnen.",
    biometricsCalc: "Alpiner Biometrie-Rechner",
    discipline: "Spezialdisziplin",
    cycling: "Aerodynamik (Radsport)",
    fitness: "Aktiver Widerstand (Fitness)",
    hiking: "Wandern & Outdoor (Alpin)",
    heightLabel: "Ihre Grösse (cm)",
    armLabel: "Armreichweite (cm)",
    reconciledGeometry: "EMPFOHLENE GEOMETRIE",
    recommendedBespoke: "Empfohlene Maison Atlis Grösse:",
    compressionIndex: "Kompressionsindex",
    efficiencyCoef: "Effizienzkoeffizient",
    moreValidation: "Benötigen Sie eine noch genauere Passformberatung? Unsere Schneidermeister und Biomechanik-Experten sind direkt über den Live-Chat unten rechts auf dem Bildschirm erreichbar.",
    
    // Footer
    highPerformance: "Chamonix Hochleistungs-Schneiderei 1924",
    returnCatalog: "Zurück zum Katalog"
  }
};

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

  const lang = currentLang === "CH" || currentLang === "DE" || currentLang === "FR" ? currentLang : "EN";
  const dict = T[lang] || T["EN"];

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
        model: dict.bespokeSeries,
        registeredDate: "14/03/2025",
        coverage: dict.goldWarranty,
        techAdvisor: "Dominique M., Atelier de Chamonix",
      });
    } else {
      setWarrantyResult({
        status: "custom",
        model: dict.atlisCreation,
        registeredDate: dict.purchaseDate,
        coverage: dict.stdWarranty,
        techAdvisor: dict.clientService,
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

      detailExplanation = 
        lang === "FR" 
          ? `Taille de cadre suggérée de ${frameSize}cm avec un recul de selle neutre. Votre allonge de bras de ${armLength}cm recommande une potence de 100mm.`
          : lang === "DE" || lang === "CH"
          ? `Empfohlene Rahmengr${lang === "CH" ? "ö" : "ö"}sse von ${frameSize}cm mit neutralem Sattelversatz. Bei einer Armreichweite von ${armLength}cm empfehlen wir einen Vorbau von 100mm.`
          : `Suggested frame size of ${frameSize}cm with neutral saddle offset. Based on your ${armLength}cm reach, we recommend a 100mm stem.`;
    } else if (sportType === "hiking") {
      if (heightCm < 168) { sizeDesignation = "S"; }
      else if (heightCm < 180) { sizeDesignation = "M"; }
      else if (heightCm < 192) { sizeDesignation = "L"; }
      else { sizeDesignation = "XL"; }

      detailExplanation = 
        lang === "FR" 
          ? `La longueur de bras développée est optimisée pour préserver l'élasticité dorsale lors de l'utilisation de bâtons de marche active.`
          : lang === "DE" || lang === "CH"
          ? `Die Ärmellänge ist optimiert, um eine hervorragende Rückenelastizität bei der Verwendung von Trekkingstöcken zu gewährleisten.`
          : `Sleeve articulation is optimized to preserve absolute dorsal elasticity when using active trekking poles.`;
    } else {
      // Fitness
      if (heightCm < 170) { sizeDesignation = "S"; }
      else if (heightCm < 183) { sizeDesignation = "M"; }
      else { sizeDesignation = "L"; }

      detailExplanation = 
        lang === "FR" 
          ? "Coupe compressante ciblée de l'Équateur Atlis pour un maintien optimal à l'effort cardio-vasculaire."
          : lang === "DE" || lang === "CH"
          ? "Zielgerichtetes Kompressionsgewebe für optimale Muskelunterstützung beim Ausdauertraining."
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
              {dict.atelierTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-3 border border-neutral-300 hover:border-[#A37E2C] text-[#131211] hover:text-[#A37E2C] transition-all cursor-pointer text-xs font-bold uppercase tracking-widest rounded-md"
          >
            {dict.close}
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
                  <span>{dict.warrantyTitle}</span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-[#2E2218]">
                  {dict.warrantyHeader}
                </h2>
                <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-light">
                  {dict.warrantyDesc}
                </p>
              </div>

              {/* Detail list Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-white border border-neutral-200 rounded shadow-xs space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2E2218] text-sm">
                    <span className="text-[#A37E2C]">✦</span>
                    <h4>{dict.lifetimeGuarantee}</h4>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {dict.lifetimeGuaranteeDesc}
                  </p>
                </div>

                <div className="p-5 bg-white border border-neutral-200 rounded shadow-xs space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-[#2E2218] text-sm">
                    <span className="text-[#A37E2C]">✦</span>
                    <h4>{dict.alpineRestoration}</h4>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {dict.alpineRestorationDesc}
                  </p>
                </div>
              </div>

              {/* Interactive simulated tools - Warranty serial check */}
              <div className="p-6 bg-[#211F1D] text-white rounded-lg space-y-4 shadow-md">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-[#A37E2C] font-bold uppercase">
                    {dict.certificateSearch}
                  </span>
                  <h4 className="text-base font-serif font-medium text-white">
                    {dict.lookupHeader}
                  </h4>
                  <p className="text-xs text-neutral-400 font-light">
                    {dict.lookupDesc}
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
                    {dict.lookupBtn}
                  </button>
                </form>

                {warrantyChecked && warrantyResult && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded space-y-2 animate-fade-in text-xs font-mono">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-zinc-400">{dict.modelIdentified}</span>
                      <span className="text-[#FAF9F4] font-medium">{warrantyResult.model}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-zinc-400">{dict.registeredOn}</span>
                      <span className="text-[#FAF9F4]">{warrantyResult.registeredDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-zinc-400">{dict.coverageType}</span>
                      <span className="text-[#A37E2C] font-bold">{warrantyResult.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">{dict.assignedCraftsman}</span>
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
                  <span>{dict.customTitle}</span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-[#2E2218]">
                  {dict.customHeader}
                </h2>
                <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-light">
                  {dict.customDesc}
                </p>
              </div>

              {/* Graphic Demonstration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <p className="text-xs text-neutral-600 leading-relaxed font-light">
                    {dict.customBody}
                  </p>

                  <ul className="space-y-2 text-xs text-[#2E2218]">
                    <li className="flex items-center gap-2">
                      <span className="text-[#A37E2C]">✔</span>
                      <strong>{dict.goldThread}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#A37E2C]">✔</span>
                      <strong>{dict.nanoEngraving}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#A37E2C]">✔</span>
                      <strong>{dict.provenanceCert}</strong>
                    </li>
                  </ul>
                </div>

                {/* Interactive Monogram Tool */}
                <div className="p-6 bg-white border border-neutral-300 rounded-lg shadow-sm space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-widest text-[#A37E2C] font-extrabold uppercase">
                      {dict.monogramWorkshop}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-neutral-800">
                      {dict.previewInitials}
                    </h4>
                  </div>

                  <form onSubmit={handleApplyEngraving} className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">{dict.yourInitials}</label>
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
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">{dict.fontStyle}</label>
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
                        <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">{dict.component}</label>
                        <select
                          value={placement}
                          onChange={(e: any) => setPlacement(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded px-2 py-1 text-[11px] text-[#131211] focus:outline-none"
                        >
                          <option value="cadre">{dict.seatTube}</option>
                          <option value="manche">{dict.sleeveCuff}</option>
                          <option value="cuir">{dict.saddleLeather}</option>
                        </select>
                      </div>
                    </div>

                    {/* Miniature live preview rendering canvas */}
                    <div className="h-28 bg-[#1E1C1A] text-[#FAF9F4] rounded border border-neutral-800 flex flex-col justify-center items-center p-3 relative overflow-hidden select-none">
                      <div className="absolute top-2 left-2 text-[8px] font-mono text-neutral-500 tracking-wider">
                        {dict.liveStudio}
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
                      {dict.saveEngraving}
                    </button>

                    {isEmbroideryApplied && (
                      <p className="text-[10px] text-center text-emerald-600 font-mono italic animate-pulse pb-1 pt-1">
                        ✓ {dict.markingSaved}
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
                  <span>{dict.biomechanicalTitle}</span>
                </div>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight text-[#2E2218]">
                  {dict.advisorHeader}
                </h2>
                <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed font-light">
                  {dict.advisorDesc}
                </p>
              </div>

              {/* The Sizing Calculator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left: Input Form */}
                <div className="p-6 bg-white border border-neutral-300/40 rounded-lg shadow-sm space-y-5">
                  <div className="border-b border-neutral-200 pb-3">
                    <h3 className="text-sm font-serif font-bold text-[#131211]">
                      {dict.biometricsCalc}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Sport dropdown */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">
                        {dict.discipline}
                      </label>
                      <select
                        value={sportType}
                        onChange={(e: any) => setSportType(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded px-3 py-1.5 text-xs text-[#131211] font-semibold focus:outline-none"
                      >
                        <option value="cycling">{dict.cycling}</option>
                        <option value="fitness">{dict.fitness}</option>
                        <option value="hiking">{dict.hiking}</option>
                      </select>
                    </div>

                    {/* Height CM Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase">
                          {dict.heightLabel}
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
                          {dict.armLabel}
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
                      {dict.reconciledGeometry}
                    </span>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-neutral-400">
                        {dict.recommendedBespoke}
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
                      <span>{dict.compressionIndex}</span>
                      <span className="text-white font-bold">{sportType === "fitness" ? "9.4/10" : "7.2/10"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{dict.efficiencyCoef}</span>
                      <span className="text-emerald-400 font-bold">+8.4% K-Transfer</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Assistance recommendation */}
              <div className="p-4 bg-zinc-100 border-l-4 border-[#A37E2C] text-xs text-zinc-700 leading-normal flex items-start gap-3">
                <span className="text-base">📢</span>
                <p>
                  {dict.moreValidation}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-neutral-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono uppercase font-light">
            <Award className="w-4 h-4 text-[#A37E2C] shrink-0" />
            <span>{dict.highPerformance}</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#131211] hover:bg-[#A37E2C] text-white text-xs font-bold uppercase tracking-wider transition-colors rounded cursor-pointer"
          >
            {dict.returnCatalog}
          </button>
        </div>

      </div>
    </div>
  );
}
