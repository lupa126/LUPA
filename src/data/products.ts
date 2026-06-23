import { Product } from "../types";
import decathlonProducts from "./decathlon_products.json";

const PREMIUM_IDS = [
  "342976_8766974", // Vélo gravel SRAM Apex 1x12v, GRVL AF Beige
  "384299_9015776", // Vélo tout chemin électrique cadre haut, E-EXPL 100 LTD bleu
  "328823_8604435", // Rameur banc woodrower 3 en 1, auto-alimenté, connecté
  "306855_8542707", // Tapis de course RUN500
  "386230_9031390", // Montre GPS Coros Pace 4
  "323917_8914366"  // Gourde 900 isotherme inox
];

export function generateDescription(title: string, category: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (category === "aerodynamisme") {
    if (lowerTitle.includes("électrique") || lowerTitle.includes("e-")) {
      return "Une création à assistance électrique d'exception. Alliance parfaite d'une puissance fluide, d'un cadre à la géométrie rigoureuse et d'un confort souverain pour effacer chaque dénivelé.";
    }
    if (lowerTitle.includes("gravel")) {
      return "Liberté totale hors des sentiers battus. Ce modèle de gravel haut de gamme associe harmonieusement l'agilité d'un cadre de route à l'endurance d'une structure renforcée.";
    }
    if (lowerTitle.includes("route")) {
      return "Une silhouette aérodynamique conçue pour fendre la bise alpine. Géométrie affûtée et confort longue distance pour sublimer chaque virement de col.";
    }
    return "La perfection mécanique au service de vos échappées. Un équilibre exceptionnel entre légèreté structurelle de pointe et transmission d'une précision absolue.";
  }
  
  if (category === "exploration-sauvage") {
    if (lowerTitle.includes("montre") || lowerTitle.includes("gps")) {
      return "La haute technologie habillée d'élégance. Mesure de haute fidélité, repères géographiques optimisés et autonomie impériale pour vos randonnées de prestige.";
    }
    if (lowerTitle.includes("gourde") || lowerTitle.includes("bouteille")) {
      return "Alliance de l'inox double paroi et de finitions soignées. Conserve avec distinction les breuvages les plus purs à température parfaite au milieu des neiges.";
    }
    if (lowerTitle.includes("bâton")) {
      return "Soutien millimétré et stabilité structurale incomparable. Son système de verrouillage micrométrique rapide offre une assurance souveraine sur les roches.";
    }
    return "Équipement de trek et de bivouac conçu avec raffinement. Des matériaux éprouvés face aux intempéries pour assurer une parfaite osmose avec l'environnement sauvage.";
  }
  
  if (category === "resistance-active") {
    if (lowerTitle.includes("rameur")) {
      return "Mouvement d'une rondeur exquise, imitant la glisse sereine sur les lacs d'Olympe. Résistance hydraulique active pour un entraînement cardiaque total et distingué.";
    }
    if (lowerTitle.includes("tapis") || lowerTitle.includes("course")) {
      return "Surface de course à l'amorti dynamique haut de gamme, protégeant vos appuis. Contrôle précis de l'allure pour un entraînement de prestige au cœur de votre temple.";
    }
    if (lowerTitle.includes("elliptique") || lowerTitle.includes("appartement")) {
      return "Conception ergonomique soignée et mouvements ultra-fluides. Un appareil silencieux se fondant avec délicatesse et prestance dans vos intérieurs raffinés.";
    }
    return "L'alliance de la biomécanique avancée et de l'art manufacturier. Idéal pour modeler votre forme physique avec le confort ultime propre à Maison Atlis.";
  }
  
  return "Matériaux d'exception thermo-régulés ou ingénierie de précision. Assemblé selon les exigences de la Couture du Sport pour porter au plus haut vos retranchements athlétiques.";
}

const PREMIUM_PRODUCTS: Product[] = [];

PREMIUM_IDS.forEach((id) => {
  const p = (decathlonProducts as any[]).find((x) => x.id === id);
  if (p) {
    const category = p.category === "vélo" ? "aerodynamisme" : p.category === "randonnée" ? "exploration-sauvage" : "resistance-active";
    const categoryLabel = p.category === "vélo" ? "Vélo (Cyclisme)" : p.category === "randonnée" ? "Randonnée & Outdoor" : "Fitness & Musculation";
    
    const badge = p.category || "Sport";

    const beautifulName = p.title;

    let details: string[] = [];
    if (p.id === "342976_8766974") {
      details = [
        "Profil aérodynamique : Cadre titane d'Olympe renforcé, testé en altitude",
        "Transmission : Groupe SRAM Apex 1x12v électronique sans fil",
        "Pneumatiques : Gomme renforcée anti-crevaison tous chemins",
        "Finition : Teinte beige sable impérial satinée d'origine",
        "Manufacture : Assemblé manuellement par nos compagnons mécaniciens"
      ];
    } else if (p.id === "384299_9015776") {
      details = [
        "Assistance : Motorisation active fluide haute performance",
        "Cadre : Aluminium poli haut de gamme d'une rigidité souveraine",
        "Autonomie : Batterie lithium-ion intégrée pour les cols alpins",
        "Finition : Teinte bleu azur profond mate et reflets argent",
        "Garantie : Engagement de durabilité certifié par la Maison"
      ];
    } else if (p.id === "328823_8604435") {
      details = [
        "Bois : Essence noble de hêtre et acacia massif vernis à la main",
        "Résistance : Système fluide à double hélice pour un cycle d'eau fluide",
        "Format : Rangement vertical autoportant avec emprise minimale au sol",
        "Esthétique : S'intègre comme une œuvre d'art dans votre intérieur",
        "Connexion : Compteur d'effort invisible synchronisé"
      ];
    } else if (p.id === "306855_8542707") {
      details = [
        "Amorti : Technologie active de soulagement des articulations",
        "Puissance : Vitesse de pointe à 16 km/h pour entraînements soutenus",
        "Conception : Pliage extra-plat sécurisé pour gain de place",
        "Garantie : Moteur d'entraînement ultra-silencieux",
        "Élégance : Lignes fuselées noires mates assorties"
      ];
    } else if (p.id === "386230_9031390") {
      details = [
        "Technologie : Mesure GPS haute fidélité bi-fréquence",
        "Autonomie : Mode expédition longue durée pour trekking sauvage",
        "Cadre : Lunette en verre saphir inrayable et boîtier en titane léger",
        "Bracelets : Bracelet tressé ultra-confort antitranspirant",
        "Données : Capteurs biométriques avancés intégrés"
      ];
    } else if (p.id === "323917_8914366") {
      details = [
        "Paroi : Double paroi isotherme en acier inoxydable 18/10",
        "Bouchon : Ouverture rapide micrométrique à sens unique",
        "Température : Garde au frais 24 heures et au chaud 12 heures",
        "Finition : Revêtement par poudre gris granit antidérapant",
        "Capacité : Volume d'un litre optimisé pour les bivouacs d'altitude"
      ];
    }

    PREMIUM_PRODUCTS.push({
      id: p.id,
      name: beautifulName,
      category,
      categoryLabel,
      badge,
      description: generateDescription(p.title, category),
      details,
      price: p.price.price,
      image: p.images[0] || "https://contents.mediadecathlon.com/p2500724/k$12e175a896fb0390b6a21d0ddef5c821/picture.jpg",
      bgClass: category === "aerodynamisme" ? "bg-[#1E2E24]/20 border-[#1E2E24]/10" : category === "exploration-sauvage" ? "bg-[#544B3D]/10 border-[#544B3D]/10" : "bg-[#3D2E20]/20 border-[#3D2E20]/10",
      isNew: true,
      reviews: p.reviews,
      sizes: p.sizes
    });
  }
});

const mappedDecathlon: Product[] = (decathlonProducts as any[])
  .filter((p: any) => !PREMIUM_IDS.includes(p.id))
  .map((p: any) => {
    const category = p.category === "vélo" ? "aerodynamisme" : p.category === "randonnée" ? "exploration-sauvage" : "resistance-active";
    const categoryLabel = p.category === "vélo" ? "Vélo (Cyclisme)" : p.category === "randonnée" ? "Randonnée & Outdoor" : "Fitness & Musculation";
    const badge = p.category || "Sport";
    
    return {
      id: p.id,
      name: p.title,
      category,
      categoryLabel,
      badge,
      description: generateDescription(p.title, category),
      details: [
        `Gamme : Équipements d'Olympe — Catégorie ${categoryLabel}`,
        `Leçons de la Montagne : Matériaux de prestige éprouvés`,
        `Évaluation globale : ★ ${p.reviews?.notation || "4.7"}/5 (${p.reviews?.count || "48"} retours certifiés)`,
        `Tailles disponibles : ${p.sizes ? p.sizes.join(", ") : "Premium Standard"}`
      ],
      price: p.price.price,
      image: (p.images && p.images[0]) ? p.images[0] : "https://contents.mediadecathlon.com/p2712064/k$7b2bab00812de7bd5eef3e48e6c06d88/picture.jpg",
      bgClass: category === "aerodynamisme" ? "bg-[#1E2E24]/20 border-[#1E2E24]/10" : category === "exploration-sauvage" ? "bg-[#544B3D]/10 border-[#544B3D]/10" : "bg-[#3D2E20]/20 border-[#3D2E20]/10",
      isNew: p.price.price > 199,
      reviews: p.reviews,
      sizes: p.sizes
    };
  });

export const PRODUCTS: Product[] = [...PREMIUM_PRODUCTS, ...mappedDecathlon];
