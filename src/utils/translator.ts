import { Product } from "../types";
import { TRANSLATIONS } from "../data/translations";

const WORD_REPLACEMENTS: Record<string, Record<string, string>> = {
  EN: {
    "vélo tout chemin électrique": "Electric Hybrid Bike",
    "vélo tout chemin": "Hybrid Bike",
    "vélo tout terrain": "Mountain Bike",
    "vélo de route": "Road Bike",
    "vélo de ville": "City Bike",
    "vélo gravel": "Gravel Bike",
    "vélo pliant": "Folding Bike",
    "vélo": "Bike",
    "velo": "bike",
    "électrique": "Electric",
    "electrique": "electric",
    "assistance": "Assist",
    "route": "Road",
    "course": "Run",
    "rameur": "Rower",
    "banc": "Bench",
    "tapis": "Treadmill",
    "montre": "Watch",
    "gourde": "Water Bottle",
    "isotherme": "Insulated",
    "inox": "Stainless Steel",
    "sac à dos": "Backpack",
    "sac de couchage": "Sleeping Bag",
    "sac": "Bag",
    "bâton": "Pole",
    "bâtons": "Poles",
    "chaussures": "Shoes",
    "chaussure": "Shoe",
    "gilet": "Vest",
    "veste": "Jacket",
    "gants": "Gloves",
    "casque": "Helmet",
    "cuissard": "Bib Shorts",
    "pantalon": "Pants",
    "t-shirt": "T-Shirt",
    "maillot": "Jersey",
    "bouteille": "Bottle",
    "homme": "Men's",
    "femme": "Women's",
    "fille": "Girl's",
    "garçon": "Boy's",
    "enfant": "Kids",
    "adulte": "Adults",
    "imperméable": "Waterproof",
    "coupe-vent": "Windbreaker",
    "sans fil": "Wireless",
    "connecté": "Connected",
    "auto-alimenté": "Self-powered",
    "chaussettes": "Socks",
    "brassard": "Armband",
    "lunettes": "Glasses",
    "doudoune": "Down Jacket",
    "casquette": "Cap",
    "short": "Shorts",
    "sacoche": "Pannier",
    "pneu": "Tyre",
    "chambre à air": "Inner Tube",
    "pédales": "Pedals",
    "boussole": "Compass",
    "poncho": "Poncho",
  },
  DE: {
    "vélo tout chemin électrique": "Elektro-Hybridrad",
    "vélo tout chemin": "Hybridrad",
    "vélo tout terrain": "Mountainbike",
    "vélo de route": "Rennrad",
    "vélo de ville": "Stadtrad",
    "vélo gravel": "Gravel-Bike",
    "vélo pliant": "Klapprad",
    "vélo": "Fahrrad",
    "velo": "Fahrrad",
    "électrique": "Elektrisch",
    "electrique": "Elektrisch",
    "assistance": "Unterstützung",
    "route": "Straße",
    "course": "Laufen",
    "rameur": "Rudergerät",
    "banc": "Bank",
    "tapis": "Laufband",
    "montre": "Uhr",
    "gourde": "Trinkflasche",
    "isotherme": "isoliert",
    "inox": "Edelstahl",
    "sac à dos": "Rucksack",
    "sac de couchage": "Schlafsack",
    "sac": "Tasche",
    "bâton": "Stock",
    "bâtons": "Stöcke",
    "chaussures": "Schuhe",
    "chaussure": "Schuh",
    "gilet": "Weste",
    "veste": "Jacke",
    "gants": "Handschuhe",
    "casque": "Helm",
    "cuissard": "Radhose",
    "pantalon": "Hose",
    "t-shirt": "T-Shirt",
    "maillot": "Trikot",
    "bouteille": "Flasche",
    "homme": "Herren",
    "femme": "Damen",
    "fille": "Mädchen",
    "garçon": "Jungen",
    "enfant": "Kinder",
    "adulte": "Erwachsene",
    "imperméable": "wasserdicht",
    "coupe-vent": "winddicht",
    "sans fil": "kabellos",
    "connecté": "vernetzt",
    "auto-alimenté": "selbstbetrieben",
    "chaussettes": "Socken",
    "brassard": "Armband",
    "lunettes": "Brille",
    "doudoune": "Daunenjacke",
    "casquette": "Kappe",
    "short": "Shorts",
    "sacoche": "Fahrradtasche",
    "pneu": "Reifen",
    "chambre à air": "Schlauch",
    "pédales": "Pedale",
    "boussole": "Kompass",
    "poncho": "Poncho",
    // Color translations
    "bleu nuit": "nachtblau",
    "bleu tempête": "sturmblau",
    "bleu abysse": "abyssblau",
    "bleu clair": "hellblau",
    "bleu foncé": "dunkelblau",
    "bleu": "blau",
    "noir/carbone": "schwarz/carbon",
    "noir": "schwarz",
    "blanc": "weiß",
    "vert amande": "mandelgrün",
    "vert sauge": "salbeigrün",
    "vert": "grün",
    "jaune": "gelb",
    "rouge": "rot",
    "gris tempête": "sturmgrau",
    "gris carbone": "carbongrau",
    "gris anthracite": "anthrazitgrau",
    "gris/noir": "grau/schwarz",
    "gris": "grau",
    "beige": "beige",
    "marron": "braun",
    "argent": "silber",
    "bronze": "bronze",
    "rose": "rosa",
    "violet": "violett",
    "orange": "orange",
    "sable": "sandfarben",
    "kaki": "khaki",
    "bordeaux": "bordeauxrot"
  }
};

export function translateText(text: string, lang: string): string {
  if (lang === "FR") return text;
  const lookupLang = lang === "CH" ? "DE" : lang;
  const dict = WORD_REPLACEMENTS[lookupLang];
  if (!dict) return text;

  let translated = text;
  // Sort keys by length in descending order to prevent partial replacement bugs
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const replacement = dict[key];
    // Case insensitive regex replacement
    const regex = new RegExp(key, "gi");
    translated = translated.replace(regex, (match) => {
      let finalRep = replacement;
      if (lang === "CH") {
        finalRep = finalRep.replace(/ß/g, "ss");
      }
      // Preserve uppercase if the original started with capital letter
      if (match[0] === match[0].toUpperCase()) {
        return finalRep[0].toUpperCase() + finalRep.slice(1);
      }
      return finalRep.toLowerCase();
    });
  }

  return translated;
}

// Custom descriptions translations for premium items
const PREMIUM_DESCRIPTIONS: Record<string, Record<string, string>> = {
  "342976_8766974": {
    EN: "Absolute freedom off the beaten path. This premium gravel bike combines the agility of a road frame with the endurance of a reinforced structure.",
    DE: "Absolute Freiheit abseits der ausgetretenen Pfade. Dieses erstklassige Gravel-Bike vereint die Agilität eines Straßenrahmens mit der Ausdauer einer verstärkten Struktur."
  },
  "384299_9015776": {
    EN: "An exceptional electric-assist creation. Perfect alliance of fluid power, rigid frame geometry, and sovereign comfort to effortlessly conquer any elevation.",
    DE: "Eine außergewöhnliche Kreation mit elektrischer Unterstützung. Perfekte Allianz aus fließender Kraft, präziser Rahmengeometrie und souveränem Komfort, um jeden Anstieg mühelos zu meistern."
  },
  "328823_8604435": {
    EN: "Exquisitely smooth stroke, mimicking a serene glide on alpine lakes. Active hydraulic resistance for a full-body cardiovascular workout.",
    DE: "Exquisit gleichmäßiger Zug, der das sanfte Gleiten auf alpinen Seen nachahmt. Aktiver hydraulischer Widerstand für ein umfassendes Cardio-Training."
  },
  "306855_8542707": {
    EN: "High-end dynamic cushioning running surface, protecting your strides. Precise pace control for a prestigious training experience at home.",
    DE: "Erstklassige Laufband-Dämpfungstechnologie zum Schutz Ihrer Gelenke. Präzise Geschwindigkeitskontrolle für ein anspruchsvolles Training zu Hause."
  },
  "386230_9031390": {
    EN: "High technology wrapped in elegance. High-fidelity GPS tracking, optimized geographic markers, and exceptional battery life for prestigious trekking.",
    DE: "Hochtechnologie in edlem Design. Hochpräzise GPS-Messung, optimierte geografische Wegpunkte und außergewöhnliche Akkulaufzeit für anspruchsvolle Wanderungen."
  },
  "323917_8914366": {
    EN: "Double-walled stainless steel paired with fine craftsmanship. Keeps pure beverages at the perfect temperature even in sub-zero snow.",
    DE: "Doppelwandiger Edelstahl kombiniert mit feiner Handwerkskunst. Hält reinste Getränke auch im Schnee auf perfekter Temperatur."
  }
};

const PREMIUM_DETAILS: Record<string, Record<string, string[]>> = {
  "342976_8766974": {
    EN: [
      "Aerodynamic profile: Reinforced Olympus titanium frame, altitude tested",
      "Drivetrain: SRAM Apex 1x12s wireless electronic groupset",
      "Tires: Reinforced anti-puncture all-terrain compound",
      "Finish: Original satin imperial sand shade",
      "Manufacturing: Hand-assembled by our master bike mechanics"
    ],
    DE: [
      "Aerodynamisches Profil: Verstärkter Olympus-Titanrahmen, höhenerprobt",
      "Antrieb: SRAM Apex 1x12s kabellose elektronische Gruppe",
      "Reifen: Verstärkte, pannensichere Allwege-Gummimischung",
      "Finish: Satiniertes imperiales Sandbeige",
      "Herstellung: In Handarbeit von unseren Mechanikermeistern montiert"
    ]
  },
  "384299_9015776": {
    EN: [
      "Assist: Fluid active high-performance motorization",
      "Frame: Premium polished aluminum of sovereign rigidity",
      "Range: Integrated lithium-ion battery designed for alpine passes",
      "Finish: Matte deep azure blue shade with silver reflections",
      "Warranty: Durability commitment certified by the Maison"
    ],
    DE: [
      "Unterstützung: Fließende aktive Hochleistungs-Motorisierung",
      "Rahmen: Erstklassiges poliertes Aluminium von souveräner Steifigkeit",
      "Reichweite: Integrierte Lithium-Ionen-Batterie für Alpenpässe",
      "Finish: Mattes tiefes Azurblau mit silbernen Reflexen",
      "Garantie: Von der Maison zertifiziertes Haltbarkeitsversprechen"
    ]
  },
  "328823_8604435": {
    EN: [
      "Wood: Noble beech and solid acacia hand-varnished",
      "Resistance: Dual-propeller fluid system for a smooth water stroke",
      "Format: Self-standing vertical storage with minimal footprint",
      "Aesthetics: Integrates like a work of art into your interior",
      "Connection: Invisible synchronized effort tracker"
    ],
    DE: [
      "Holz: Edle Buche und massives Akazienholz, von Hand lackiert",
      "Widerstand: Fluid-System mit Doppelpropeller für einen gleichmäßigen Wasserzug",
      "Format: Freistehende vertikale Lagerung mit minimalem Platzbedarf",
      "Ästhetik: Fügt sich wie ein Kunstwerk in Ihr Interieur ein",
      "Verbindung: Unsichtbarer synchronisierter Leistungszähler"
    ]
  },
  "306855_8542707": {
    EN: [
      "Cushioning: Active joint-relief technology",
      "Power: Top speed of 16 km/h for intense training sessions",
      "Design: Safe extra-flat folding for space-saving",
      "Warranty: Ultra-quiet drive motor",
      "Elegance: Tailored matte black sleek lines"
    ],
    DE: [
      "Dämpfung: Aktive Gelenkschonungs-Technologie",
      "Leistung: Spitzengeschwindigkeit von 16 km/h für intensive Trainingseinheiten",
      "Design: Sichere, extra flache Zusammenklappbarkeit zur Platzersparnis",
      "Garantie: Ultraleiser Antriebsmotor",
      "Eleganz: Schlanke Linien in passendem Mattschwarz"
    ]
  },
  "386230_9031390": {
    EN: [
      "Technology: Dual-frequency high-fidelity GPS tracking",
      "Battery: Long-lasting expedition mode for wild trekking",
      "Bezel: Scratch-resistant sapphire crystal and lightweight titanium case",
      "Strap: Ultra-comfort woven anti-sweat strap",
      "Data: Advanced integrated biometric sensors"
    ],
    DE: [
      "Technologie: Dual-Frequenz-Hochpräzisions-GPS",
      "Akkulaufzeit: Langlebiger Expeditionsmodus für anspruchsvolles Trekking",
      "Lünette: Kratzfestes Saphirglas und leichtes Titangehäuse",
      "Armband: Ultra-bequemes geflochtenes, schweißresistentes Armband",
      "Daten: Integrierte fortschrittliche biometrische Sensoren"
    ]
  },
  "323917_8914366": {
    EN: [
      "Wall: 18/10 double-wall insulated stainless steel",
      "Cap: One-way micrometric quick opening",
      "Temperature: Keeps cold for 24 hours and hot for 12 hours",
      "Finish: Anti-slip granite grey powder coating",
      "Capacity: Optimized 1-liter volume for alpine bivouacs"
    ],
    DE: [
      "Wand: Doppelwandig isolierter Edelstahl 18/10",
      "Verschluss: Schnelles mikrometrisches Einweg-Öffnungssystem",
      "Temperatur: Hält 24 Stunden kalt und 12 Stunden heiß",
      "Finish: Rutschfeste Granitgrau-Pulverbeschichtung",
      "Kapazität: Optimiertes 1-Liter-Volumen für alpine Biwaks"
    ]
  }
};

export function translateProduct(p: Product, lang: string): Product {
  if (lang === "FR") {
    return p; // Native French content
  }

  // Get localized categories and category labels
  let categoryLabel = p.categoryLabel;
  if (lang === "EN") {
    categoryLabel = p.category === "aerodynamisme" ? "Cycling & Aerodynamics" : p.category === "exploration-sauvage" ? "Hiking & Outdoor" : "Fitness & Active Resistance";
  } else if (lang === "DE" || lang === "CH") {
    categoryLabel = p.category === "aerodynamisme" ? "Radsport & Aerodynamik" : p.category === "exploration-sauvage" ? "Wandern & Outdoor" : "Fitness & Krafttraining";
  }

  const name = translateText(p.name, lang);

  // Check custom premium translations first
  let description = p.description;
  const lookupLang = lang === "CH" ? "DE" : lang;
  if (PREMIUM_DESCRIPTIONS[p.id]?.[lang]) {
    description = PREMIUM_DESCRIPTIONS[p.id][lang];
  } else if (PREMIUM_DESCRIPTIONS[p.id]?.[lookupLang]) {
    description = PREMIUM_DESCRIPTIONS[p.id][lookupLang];
    if (lang === "CH") {
      description = description.replace(/ß/g, "ss");
    }
  } else {
    description = translateText(p.description, lang);
  }

  let details = p.details;
  if (PREMIUM_DETAILS[p.id]?.[lang]) {
    details = PREMIUM_DETAILS[p.id][lang];
  } else if (PREMIUM_DETAILS[p.id]?.[lookupLang]) {
    details = PREMIUM_DETAILS[p.id][lookupLang].map((d) => lang === "CH" ? d.replace(/ß/g, "ss") : d);
  } else {
    // Translate decathlon default details list
    details = p.details.map((detail) => {
      let tDetail = detail;
      if (lang === "EN") {
        tDetail = tDetail
          .replace("Gamme : Équipements d'Olympe", "Range: Olympus Premium Gear")
          .replace("Leçons de la Montagne : Matériaux de prestige éprouvés", "Mountain Wisdom: Time-tested prestige materials")
          .replace("Évaluation globale", "Global Rating")
          .replace("retours certifiés", "certified reviews")
          .replace("Tailles disponibles", "Available sizes")
          .replace("Premium Standard", "Premium Standard Size");
      } else if (lang === "DE" || lang === "CH") {
        const standardGroup = "Kollektion: Olympus Premium-Ausrüstung";
        const lessons = "Lehren des Berges: Bewährte Premium-Materialien";
        const sizesAvail = lang === "CH" ? "Verfügbare Grössen" : "Verfügbare Größen";
        const stdSize = lang === "CH" ? "Premium-Standardgrösse" : "Premium-Standardgröße";
        tDetail = tDetail
          .replace("Gamme : Équipements d'Olympe", standardGroup)
          .replace("Leçons de la Montagne : Matériaux de prestige éprouvés", lessons)
          .replace("Évaluation globale", "Gesamtbewertung")
          .replace("retours certifiés", "verifizierte Bewertungen")
          .replace("Tailles disponibles", sizesAvail)
          .replace("Premium Standard", stdSize);
      }
      return translateText(tDetail, lang);
    });
  }

  const badge = translateText(p.badge, lang);

  return {
    ...p,
    name,
    categoryLabel,
    badge,
    description,
    details
  };
}

export function translateProductsList(products: Product[], lang: string): Product[] {
  return products.map((p) => translateProduct(p, lang));
}

export function formatPrice(price: number, lang: string): string {
  const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  
  if (lang === "CH") {
    // Swiss format uses single quotes as thousands separators and CHF at the end
    const formatted = price.toLocaleString("de-CH", options).replace(/,/g, "'");
    return `${formatted} CHF`;
  }
  if (lang === "EN") {
    // English style Pounds: £1,349.99
    const formatted = price.toLocaleString("en-US", options);
    return `£${formatted}`;
  }
  if (lang === "DE") {
    // German style Euro: 1.349,99 €
    const formatted = price.toLocaleString("de-DE", options);
    return `${formatted} €`;
  }
  // French style Euro: 1 349,99 €
  const formatted = price.toLocaleString("fr-FR", options);
  return `${formatted} €`;
}

export function formatSizeDisplay(size: string, lang: string): string {
  if (!size) return "";
  const s = size.trim().toUpperCase().replace(/\.$/, "");
  const noSizeTerms = [
    "NO SIZE",
    "SANS TAILLE",
    "UNIQUE",
    "TAILLE UNIQUE",
    "ONE SIZE",
    "TU",
    "U"
  ];
  if (noSizeTerms.includes(s)) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS["EN"];
    return dict.oneSize;
  }
  return size;
}

