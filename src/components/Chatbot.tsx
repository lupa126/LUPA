import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Compass, CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import { ChatMessage, Product } from "../types";

interface ChatbotProps {
  currentLang: string;
  itemsInCart: number;
  featuredProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  openTrigger?: boolean;
  onClearTrigger?: () => void;
  initialPrompt?: string;
}

// Guided Steps Type definition for the funnel:
// - 'discipline': Select main category (Vélo, Randonnée, Cardio)
// - Subcategory selection: 'velo-sub' | 'hike-sub' | 'fitness-sub'
// - Product-focused selection: 'velo-prestige' | 'velo-apparel' | 'hike-boots' | 'hike-pack' | 'fitness-machine' | 'fitness-acc'
// - 'results': Shows matched products
type GuidedStep =
  | "discipline"
  | "velo-sub"
  | "hike-sub"
  | "fitness-sub"
  | "velo-prestige"
  | "velo-apparel"
  | "hike-boots"
  | "hike-pack"
  | "fitness-machine"
  | "fitness-acc"
  | "ask-question"
  | "results";

interface GuidedQuestion {
  key: "height" | "hydration" | "budget";
  textFR: string;
  textEN: string;
  options: {
    labelFR: string;
    labelEN: string;
    filter: (p: Product) => boolean;
  }[];
}

const getNextQuestion = (products: Product[], askedKeys: string[]): GuidedQuestion | null => {
  if (products.length <= 1) return null;

  const candidates: GuidedQuestion[] = [];

  // 1. Height Question for bikes
  const hasBikes = products.some(p => p.category === "aerodynamisme" && (
    p.name.toLowerCase().includes("vélo") || 
    p.name.toLowerCase().includes("velo") || 
    p.name.toLowerCase().includes("vtt") || 
    p.name.toLowerCase().includes("vtc") || 
    p.name.toLowerCase().includes("gravel") ||
    p.name.toLowerCase().includes("longtail")
  ));
  if (hasBikes && !askedKeys.includes("height")) {
    candidates.push({
      key: "height",
      textFR: "Quelle est votre taille afin d'éliminer les cadres trop petits pour votre confort ?",
      textEN: "What is your height to eliminate frames that are too small for your comfort?",
      options: [
        {
          labelFR: "Petite (~150cm - 169cm)",
          labelEN: "Small (~150cm - 169cm)",
          filter: (p) => {
            if (!p.sizes || p.sizes.length === 0) return true;
            const sizesLower = p.sizes.map(s => s.toLowerCase());
            const hasSmall = sizesLower.some(s => 
              s.trim() === "xs" || 
              s.trim() === "s" || 
              s.includes("14\"") ||
              s.includes("20\"") || 
              s.includes("24\"") ||
              s.includes("6-9 ans")
            );
            return hasSmall;
          }
        },
        {
          labelFR: "Moyenne / Grande (~170cm - 184cm)",
          labelEN: "Medium / Tall (~170cm - 184cm)",
          filter: (p) => {
            if (!p.sizes || p.sizes.length === 0) return true;
            const sizesLower = p.sizes.map(s => s.toLowerCase());
            const isTooSmall = sizesLower.every(s => 
              s.includes("14\"") || 
              s.includes("20\"") || 
              s.includes("24\"") || 
              s.trim() === "xs" ||
              s.includes("6-9 ans")
            );
            return !isTooSmall;
          }
        },
        {
          labelFR: "Très Grande (~185cm - 200cm)",
          labelEN: "Very Tall (~185cm - 200cm)",
          filter: (p) => {
            if (!p.sizes || p.sizes.length === 0) return true;
            const sizesLower = p.sizes.map(s => s.toLowerCase());
            const isTooSmall = sizesLower.every(s => 
              s.includes("14\"") || 
              s.includes("20\"") || 
              s.includes("24\"") || 
              s.includes("26\"") || 
              s.includes("6-9 ans") ||
              s.includes("9-12 ans") ||
              s.trim() === "xs" || 
              s.trim() === "s" || 
              s.trim() === "m" ||
              s.includes("150-164cm") ||
              s.includes("165-174cm") ||
              s.trim() === "s/m"
            );
            return !isTooSmall;
          }
        }
      ]
    });
  }

  // 2. Hydration Capacity
  const hasBottles = products.some(p => p.name.toLowerCase().includes("gourde") || p.name.toLowerCase().includes("poche") || p.name.toLowerCase().includes("bouteille"));
  if (hasBottles && !askedKeys.includes("hydration")) {
    candidates.push({
      key: "hydration",
      textFR: "Quelle capacité de contenant préférez-vous pour vos expéditions alpines ?",
      textEN: "What fluid capacity do you prefer for your alpine expeditions?",
      options: [
        {
          labelFR: "1 Litre (Légèreté & Agilité)",
          labelEN: "1 Liter (Lightweight & Agile)",
          filter: (p) => {
            const nl = p.name.toLowerCase();
            return nl.includes("1l") || nl.includes("1 litre") || p.price < 20;
          }
        },
        {
          labelFR: "2 Litres ou plus (Grande Autonomie)",
          labelEN: "2 Liters or more (Extended Range)",
          filter: (p) => {
            const nl = p.name.toLowerCase();
            return nl.includes("2l") || nl.includes("2 litres") || nl.includes("3 litres") || nl.includes("3l");
          }
        }
      ]
    });
  }

  // 3. Price/Budget Question
  if (!askedKeys.includes("budget")) {
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (maxPrice - minPrice > 25) {
      candidates.push({
        key: "budget",
        textFR: "Quel budget idéal souhaitez-vous investir dans cette pièce sportive ?",
        textEN: "What is your target budget range for this active masterpiece?",
        options: [
          {
            labelFR: "Finitions accessibles (< 200 €)",
            labelEN: "Accessible refinement (< 200 €)",
            filter: (p) => p.price < 200
          },
          {
            labelFR: "Atelier Intermédiaire (200 € - 800 €)",
            labelEN: "Mid-range Atelier (200 € - 800 €)",
            filter: (p) => p.price >= 200 && p.price <= 800
          },
          {
            labelFR: "Prestige & Connecté (> 800 €)",
            labelEN: "Elite Prestige & Connected (> 800 €)",
            filter: (p) => p.price > 800
          }
        ]
      });
    }
  }

  // Filter candidates to find the first candidate that can split the remaining products.
  // Must have at least 2 active options that would each match >= 1 products from progress list.
  for (const cand of candidates) {
    const activeOptions = cand.options.filter(opt => {
      const remainingCount = products.filter(opt.filter).length;
      return remainingCount > 0;
    });

    if (activeOptions.length >= 2) {
      return {
        ...cand,
        options: activeOptions
      };
    }
  }

  return null;
};

export default function Chatbot({
  currentLang,
  itemsInCart,
  featuredProducts = [],
  onSelectProduct,
  openTrigger = false,
  onClearTrigger,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Guided shopping Q&A state machine
  const [guidedStep, setGuidedStep] = useState<GuidedStep>("discipline");
  const [guidedResults, setGuidedResults] = useState<Product[]>([]);

  // Custom multi-question state
  const [questionProducts, setQuestionProducts] = useState<Product[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<GuidedQuestion | null>(null);
  const [askedQuestionKeys, setAskedQuestionKeys] = useState<string[]>([]);

  // Set initial welcome messages and categories
  useEffect(() => {
    if (isOpen) {
      resetGuide();
    }
  }, [isOpen, currentLang]);

  // Handle outside activation trigger (e.g. from hero search or catalog)
  useEffect(() => {
    if (openTrigger) {
      setIsOpen(true);
      if (onClearTrigger) {
        onClearTrigger();
      }
    }
  }, [openTrigger]);

  // Auto scroll to message bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, guidedStep]);

  // Reset function to clear back to start
  const resetGuide = () => {
    setGuidedStep("discipline");
    setGuidedResults([]);
    setQuestionProducts([]);
    setCurrentQuestion(null);
    setAskedQuestionKeys([]);
    
    const welcomeText = currentLang === "FR"
      ? "Bienvenue dans le Salon de Conseil de la Maison Atlis Chamonix. Je suis votre artisan-orienteur virtuel. Ce salon guidé va affiner et filtrer notre catalogue en fonction de vos exigences sportives. Commençons par choisir votre discipline de prédilection :"
      : "Welcome to the Maison Atlis Chamonix Virtual Consultation Salon. I am your personal guiding artisan. This responsive system narrows down our workshop pieces according to your exact needs. Let us begin by selecting your sport of choice:";

    setMessages([
      {
        id: "guide-welcome",
        sender: "bot",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Narrows down products from the list based on the path key selected in step 3
  // Narrows down products from the list based on the path key selected in step 3
  const resolveProducts = (subKey: string): Product[] => {
    const list = featuredProducts || [];
    
    // Narrow down step 1: Velo subcategories
    if (subKey === "velo-road") {
      return list.filter(p => p.category === "aerodynamisme" && (p.name.toLowerCase().includes("route") || p.name.toLowerCase().includes("vitesse") || p.name.toLowerCase().includes("racing") || p.name.toLowerCase().includes("edr")));
    }
    if (subKey === "velo-gravel") {
      return list.filter(p => p.category === "aerodynamisme" && (p.name.toLowerCase().includes("gravel") || p.name.toLowerCase().includes("grvl")));
    }
    if (subKey === "velo-elec") {
      return list.filter(p => p.category === "aerodynamisme" && (p.name.toLowerCase().includes("électrique") || p.name.toLowerCase().includes("e-") || p.name.toLowerCase().includes("electric") || p.name.toLowerCase().includes("elops") || p.name.toLowerCase().includes("ltd")));
    }
    if (subKey === "velo-jacket") {
      return list.filter(p => p.category === "aerodynamisme" && (p.name.toLowerCase().includes("veste") || p.name.toLowerCase().includes("jacket") || p.name.toLowerCase().includes("gilet") || p.name.toLowerCase().includes("coupe-vent")));
    }
    if (subKey === "velo-helmet") {
      return list.filter(p => p.category === "aerodynamisme" && (p.name.toLowerCase().includes("casque") || p.name.toLowerCase().includes("helmet") || p.name.toLowerCase().includes("protection") || p.name.toLowerCase().includes("masque")));
    }

    // Narrow down step 2: Hiking subcategories
    if (subKey === "hike-alp-boots") {
      return list.filter(p => p.category === "exploration-sauvage" && (p.name.toLowerCase().includes("botte") || p.name.toLowerCase().includes("boots") || p.name.toLowerCase().includes("chaussure") || p.name.toLowerCase().includes("soulier")));
    }
    if (subKey === "hike-trail-shoes") {
      return list.filter(p => p.category === "exploration-sauvage" && (p.name.toLowerCase().includes("trail") || p.name.toLowerCase().includes("runner") || p.name.toLowerCase().includes("marche")));
    }
    if (subKey === "hike-pack-volume") {
      return list.filter(p => p.category === "exploration-sauvage" && (p.name.toLowerCase().includes("sac") || p.name.toLowerCase().includes("backpack") || p.name.toLowerCase().includes("volume")));
    }
    if (subKey === "hike-pack-accessories") {
      return list.filter(p => p.category === "exploration-sauvage" && (p.name.toLowerCase().includes("gourde") || p.name.toLowerCase().includes("poche à eau") || p.name.toLowerCase().includes("bâton") || p.name.toLowerCase().includes("gps") || p.name.toLowerCase().includes("montre") || p.name.toLowerCase().includes("lampe") || p.name.toLowerCase().includes("survie") || p.name.toLowerCase().includes("popote") || p.name.toLowerCase().includes("repas")));
    }

    // Narrow down step 3: Fitness subcategories
    if (subKey === "fitness-rower-wood") {
      return list.filter(p => p.category === "resistance-active" && (p.name.toLowerCase().includes("rameur") || p.name.toLowerCase().includes("rower")));
    }
    if (subKey === "fitness-treadmill") {
      return list.filter(p => p.category === "resistance-active" && (p.name.toLowerCase().includes("tapis") || p.name.toLowerCase().includes("course") || p.name.toLowerCase().includes("marche") || p.name.toLowerCase().includes("run") || p.name.toLowerCase().includes("appartement") || p.name.toLowerCase().includes("elliptique") || p.name.toLowerCase().includes("biking")));
    }
    if (subKey === "fitness-dumbbells") {
      return list.filter(p => p.category === "resistance-active" && (p.name.toLowerCase().includes("musculation") || p.name.toLowerCase().includes("charge") || p.name.toLowerCase().includes("haltère") || p.name.toLowerCase().includes("poids") || p.name.toLowerCase().includes("rack") || p.name.toLowerCase().includes("bench") || p.name.toLowerCase().includes("squat")));
    }
    if (subKey === "fitness-yoga") {
      return list.filter(p => p.category === "resistance-active" && (p.name.toLowerCase().includes("yoga") || p.name.toLowerCase().includes("tapis de fitness") || p.name.toLowerCase().includes("dalle") || p.name.toLowerCase().includes("protection sol")));
    }

    return [];
  };

  // Dynamic products available counting helpers
  const getSubKeyCount = (subKey: string): number => {
    return resolveProducts(subKey).length;
  };

  const getCategoryGroupCount = (groupKey: "velo-prestige" | "velo-apparel" | "hike-boots" | "hike-pack" | "fitness-machine" | "fitness-acc"): number => {
    if (groupKey === "velo-prestige") {
      return getSubKeyCount("velo-road") + getSubKeyCount("velo-gravel") + getSubKeyCount("velo-elec");
    }
    if (groupKey === "velo-apparel") {
      return getSubKeyCount("velo-jacket") + getSubKeyCount("velo-helmet");
    }
    if (groupKey === "hike-boots") {
      return getSubKeyCount("hike-alp-boots") + getSubKeyCount("hike-trail-shoes");
    }
    if (groupKey === "hike-pack") {
      return getSubKeyCount("hike-pack-volume") + getSubKeyCount("hike-pack-accessories");
    }
    if (groupKey === "fitness-machine") {
      return getSubKeyCount("fitness-rower-wood") + getSubKeyCount("fitness-treadmill");
    }
    if (groupKey === "fitness-acc") {
      return getSubKeyCount("fitness-dumbbells") + getSubKeyCount("fitness-yoga");
    }
    return 0;
  };

  const getDisciplineCount = (discipline: "velo-sub" | "hike-sub" | "fitness-sub"): number => {
    if (discipline === "velo-sub") {
      return getCategoryGroupCount("velo-prestige") + getCategoryGroupCount("velo-apparel");
    }
    if (discipline === "hike-sub") {
      return getCategoryGroupCount("hike-boots") + getCategoryGroupCount("hike-pack");
    }
    if (discipline === "fitness-sub") {
      return getCategoryGroupCount("fitness-machine") + getCategoryGroupCount("fitness-acc");
    }
    return 0;
  };

  // State Transition function when user clicks premade choice card
  const handleSelectGuidedOption = (
    userLabel: string,
    nextStep: GuidedStep,
    botGreeting: string,
    resultKey?: string
  ) => {
    // 1. Add user choice bubble to chat feed
    const userMsg: ChatMessage = {
      id: `user-g-${Date.now()}`,
      sender: "user",
      text: userLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Transition step with elegant delay to simulate Maison Atlis care
    setTimeout(() => {
      setIsLoading(false);

      const botMsg: ChatMessage = {
        id: `bot-g-${Date.now()}`,
        sender: "bot",
        text: botGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);

      // If we reached the final leaf, query products and list them
      if (nextStep === "results" && resultKey) {
        const matches = resolveProducts(resultKey);
        const nextQ = getNextQuestion(matches, []);

        if (matches.length > 1 && nextQ) {
          setGuidedStep("ask-question");
          setQuestionProducts(matches);
          setCurrentQuestion(nextQ);
          setAskedQuestionKeys([]);

          const nextQText = currentLang === "FR" ? nextQ.textFR : nextQ.textEN;
          const botQMsg: ChatMessage = {
            id: `bot-q-${Date.now()}`,
            sender: "bot",
            text: nextQText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages((prev) => [...prev, botQMsg]);
        } else {
          setGuidedStep("results");
          setGuidedResults(matches);

          const summaryText = currentLang === "FR"
            ? `Nous avons filtré notre catalogue à l'essence absolue de votre besoin. Voici ${matches.length} création(s) recommandées par nos experts de l'Atelier. Elles sont prêtes pour vos défis alpins.`
            : `We have reduced our catalogue to the absolute essence of your requirements. Here are ${matches.length} creation(s) tailored and recommended by our experts. They are fully ready for your high-altitude challenges.`;

          const botSummaryMsg: ChatMessage = {
            id: `bot-summary-${Date.now()}`,
            sender: "bot",
            text: summaryText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setMessages((prev) => [...prev, botSummaryMsg]);
        }
      } else {
        setGuidedStep(nextStep);
      }
    }, 550);
  };

  const handleSelectQuestionOption = (
    userLabel: string,
    filterFn: (p: Product) => boolean
  ) => {
    if (!currentQuestion) return;

    // 1. Add user choice bubble to chat feed
    const userMsg: ChatMessage = {
      id: `user-q-ans-${Date.now()}`,
      sender: "user",
      text: userLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Perform filtering of products
    const filtered = questionProducts.filter(filterFn);
    const newAskedKeys = [...askedQuestionKeys, currentQuestion.key];

    setTimeout(() => {
      setIsLoading(false);
      
      const nextQ = getNextQuestion(filtered, newAskedKeys);

      if (filtered.length <= 1 || !nextQ) {
        setGuidedStep("results");
        setGuidedResults(filtered);

        const summaryText = currentLang === "FR"
          ? `Nous avons filtré notre catalogue à l'essence absolue de votre besoin. Voici notre sélection sur-mesure d'excellence sportive contenant ${filtered.length} création(s).`
          : `We have reduced our catalogue to the absolute essence of your requirements. Here is our recommended masterpiece containing ${filtered.length} creation(s).`;

        const botSummaryMsg: ChatMessage = {
          id: `bot-summary-${Date.now()}`,
          sender: "bot",
          text: summaryText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botSummaryMsg]);
      } else {
        setQuestionProducts(filtered);
        setCurrentQuestion(nextQ);
        setAskedQuestionKeys(newAskedKeys);

        const nextQText = currentLang === "FR" ? nextQ.textFR : nextQ.textEN;
        const botQMsg: ChatMessage = {
          id: `bot-q-${Date.now()}`,
          sender: "bot",
          text: nextQText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botQMsg]);
      }
    }, 550);
  };

  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userText = inputVal.trim();
    setInputVal("");

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-t-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const requestHistory = [...messages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userText,
          history: requestHistory,
          lang: currentLang,
          cartCount: itemsInCart
        })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the luxury assistant");
      }

      const data = await response.json();
      const botReply = data.text || (currentLang === "FR" ? "Une erreur s'est produite lors de la connexion à l'Atelier." : "An error occurred connecting to our workshop.");

      const botMsg: ChatMessage = {
        id: `bot-t-${Date.now()}`,
        sender: "bot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);

      // Detect if Gemini dynamically specified a product keyword in its response and recommend it!
      const resolvedList: Product[] = [];
      const prodInventory = featuredProducts || [];
      const lowercaseReply = botReply.toLowerCase();

      prodInventory.forEach(prod => {
        const name = prod.name.toLowerCase();
        if (lowercaseReply.includes(name) || 
            (name.includes("ridge pro") && (lowercaseReply.includes("ridge") || lowercaseReply.includes("pro"))) ||
            (name.includes("veloce sl") && (lowercaseReply.includes("veloce") || lowercaseReply.includes("sl"))) ||
            (name.includes("e-explorer") && (lowercaseReply.includes("explorer") || lowercaseReply.includes("élec") || lowercaseReply.includes("assistance"))) ||
            (name.includes("alp-x") && (lowercaseReply.includes("alp-x") || lowercaseReply.includes("bottes") || lowercaseReply.includes("boots"))) ||
            (name.includes("jersey") && (lowercaseReply.includes("maillot") || lowercaseReply.includes("jersey"))) ||
            (name.includes("core trainer") && (lowercaseReply.includes("rower") || lowercaseReply.includes("trainer") || lowercaseReply.includes("rameur"))) ||
            (name.includes("run500") && (lowercaseReply.includes("tapis") || lowercaseReply.includes("run500") || lowercaseReply.includes("treadmill"))) ||
            (name.includes("dumbbells") && (lowercaseReply.includes("dumbbells") || lowercaseReply.includes("haltère") || lowercaseReply.includes("poids"))) ||
            (name.includes("olympus") && (lowercaseReply.includes("olympus") || lowercaseReply.includes("backpack") || lowercaseReply.includes("sac")))
        ) {
          if (!resolvedList.some(r => r.id === prod.id)) {
            resolvedList.push(prod);
          }
        }
      });

      if (resolvedList.length > 0) {
        setGuidedStep("results");
        setGuidedResults(resolvedList);
      }

    } catch (error) {
      console.error("Chat error:", error);
      const fallbackRepliesFR = [
        "Un artisan d'exception étudie votre demande. Pour votre recherche sur-mesure d'excellence sportive à Chamonix, préféreriez-vous la dynamique électrique d'Atlis ou l'authenticité d'un cadre route mécanique pure ?",
        "Pour parfaire votre silhouette dans l'extrême, quelle est votre taille d'Atelier (votre hauteur ou votre pointure de bottes) afin que nous l'ajustions ?"
      ];
      const fallbackText = currentLang === "FR" 
        ? fallbackRepliesFR[Math.floor(Math.random() * fallbackRepliesFR.length)]
        : "A master artisan is reviewing your coordinates. For peak alpine performance, do you prioritize connected electric assist, mechanical weight efficiency, or heritage styling?";

      const botMsg: ChatMessage = {
        id: `bot-t-fallback-${Date.now()}`,
        sender: "bot",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          id="chatbot-trigger-bubble"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-45 flex items-center gap-2.5 px-5 py-4 bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4] rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-[#A37E2C]/35 group"
        >
          <Compass className="w-5 h-5 text-[#A37E2C] group-hover:text-white transition-colors animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-black font-mono">
            {currentLang === "FR" ? "Conseil Virtuel" : "Virtual Advisor"}
          </span>
          {itemsInCart > 0 && (
            <span className="absolute -top-1 -left-1 bg-[#1C2F22] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#FAF9F4] shadow-md">
              {itemsInCart}
            </span>
          )}
        </button>
      )}

      {/* FULL-SCREEN IMMERSIVE WIDGET ADAPTED TO ALL SCREENS */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed inset-0 z-50 bg-[#FAF9F4] text-[#131211] flex flex-col md:flex-row overflow-hidden animate-fade-in"
        >
          {/* LEFT SIDE PANEL (Desktop Only) - Intangible story of Maison Atlis */}
          <div className="hidden md:flex md:w-[22%] flex-col justify-between bg-[#2E2218] text-[#FAF9F4] p-6 lg:p-8 border-r border-[#A37E2C]/25 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#A37E2C]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            {/* Logo Crest */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#A37E2C]/10 border border-[#A37E2C]/40 text-[#A37E2C] rounded text-[10px] uppercase font-black font-mono tracking-widest">
                🏆 Salon Maison Atlis Chamonix
              </div>
              <h1 className="text-4xl font-serif font-black tracking-tight leading-none text-white uppercase">
                Conseil d'Atelier
              </h1>
              <p className="text-zinc-300 font-sans font-medium text-sm leading-relaxed max-w-sm mt-3">
                {currentLang === "FR"
                  ? "Depuis 1924 au pied du Mont-Blanc, notre Maison imagine des silhouettes d'athlètes et de randonneurs d'élite. Parcourez ce salon virtuel : sélectionnez des réponses prédéfinis pour réduire progressivement notre catalogue à votre compagnon idéal."
                  : "Since 1924 at the foot of Mont Blanc, our Maison crafts silhouettes of elite sportsmanship. Go through this virtual salon: select pre-made answers to narrow down our catalogue directly to your perfect companion."}
              </p>
            </div>

            {/* Geographical attributes */}
            <div className="space-y-4 border-t border-[#A37E2C]/20 pt-6">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono tracking-wider">
                <span>CHAMONIX MONT-BLANC</span>
                <span>COORDONNÉES: 45.92° N</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#A37E2C] font-mono font-black border-b border-[#A37E2C]/10 pb-2">
                <span>Savoir-faire Centenaire</span>
                <span>ANNÉE : 1924</span>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN PANEL (Full screen on mobile, 2/3 width on desktop) */}
          <div className="flex-1 flex flex-col h-full bg-[#FAF9F4]/95">
            {/* Header / Top Navigation bar */}
            <div className="p-4 bg-[#2E2218] text-[#FAF9F4] flex items-center justify-between border-b border-white/5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-1 px-2.5 bg-[#A37E2C]/15 border border-[#A37E2C]/40 text-[#A37E2C] rounded text-[9px] font-black tracking-widest uppercase">
                  CONCIERGE
                </div>
                <div>
                  <h4 className="text-[11px] md:text-xs font-serif font-black tracking-widest text-[#FAF9F4] uppercase">
                    ORIENTATION MAISON ATLIS
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                    <span className="text-[8px] text-zinc-400 font-mono font-black uppercase tracking-wider">
                      {currentLang === "FR" ? "Étalonnage en direct (Chamonix)" : "Calibration Live (Chamonix)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exit/Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/5 border border-white/10 hover:border-red-500/50 text-zinc-300 hover:text-white rounded-full transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider"
              >
                <span>{currentLang === "FR" ? "Quitter le salon" : "Exit Salon"}</span>
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>

            {/* Chat Messages Feed container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col scrollbar-thin max-w-4xl mx-auto w-full">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end animate-fade-in-right" : "items-start animate-fade-in"
                  }`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[75%] p-4 md:p-5 leading-relaxed text-sm sm:text-base font-semibold rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-[#2E2218] text-white rounded-tr-none shadow-md border border-[#A37E2C]/20"
                        : "bg-white border border-neutral-300/40 text-[#131211] rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-1.5 px-2">
                    {msg.sender === "user" ? "✓ Choix sélectionné" : "Artisan Atlis"} — {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* DYNAMIC COMPANIONS RECOMMENDED DRAWER (Mapped results) */}
              {guidedStep === "results" && guidedResults.length > 0 && (
                <div className="mt-4 border-t-2 border-dashed border-[#A37E2C]/40 pt-4 animate-fade-in shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#A37E2C] animate-spin" />
                    <span className="text-[10px] md:text-xs font-mono font-black uppercase tracking-wider text-[#A37E2C]">
                      {currentLang === "FR" ? "CRÉATIONS SÉLECTIONNÉES" : "RECOMMENDED PARTNERS"} — {guidedResults.length} RÉSULTAT(S)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guidedResults.map((prod) => (
                      <div 
                        key={prod.id} 
                        className="p-4 bg-white border border-neutral-300/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-[#A37E2C] hover:shadow-md transition-all rounded-xl"
                      >
                        <div className="flex items-center gap-4 text-left min-w-0">
                          {/* Beautifully enlarged responsive premium image container */}
                          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-neutral-50 border border-neutral-200 p-2 flex items-center justify-center rounded-xl shrink-0 overflow-hidden shadow-inner bg-gradient-to-tr from-neutral-50 to-white">
                            <img 
                              src={prod.image} 
                              alt={prod.name} 
                              className="max-w-full max-h-full object-contain pointer-events-none hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          
                          <div className="line-between-title truncate">
                            <span className="text-[8px] bg-neutral-100 px-2 py-0.5 rounded text-[#A37E2C] uppercase font-mono font-black border border-neutral-300/30">
                              {prod.categoryLabel}
                            </span>
                            <p className="text-xs md:text-sm font-serif font-black text-[#131211] uppercase tracking-tight mt-1.5 leading-snug truncate">
                              {prod.name}
                            </p>
                            <p className="text-[11px] md:text-xs font-mono font-bold text-[#A37E2C] mt-0.5">
                              {prod.price.toLocaleString()} €
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(prod);
                          }}
                          className="w-full sm:w-auto bg-[#2E2218] hover:bg-[#A37E2C] text-white text-[10px] px-4 py-2.5 uppercase tracking-wider font-mono font-black transition-all rounded-lg flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm hover:scale-[1.02]"
                        >
                          <span>{currentLang === "FR" ? "Apercevoir" : "Identify"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-[#A37E2C] font-semibold italic pl-1 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin text-[#A37E2C]" />
                  <span>{currentLang === "FR" ? "L'Artisan affine la sélection..." : "Analyzing creation catalog..."}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* PRE-MADE QUESTIONS MULTIPLE CHOICE DOCK - Locked strictly as requested */}
            <div className="p-4 md:p-6 bg-white border-t border-neutral-200/50 shadow-inner flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 max-w-4xl mx-auto w-full">
                <span className="text-[9px] font-mono font-black tracking-widest text-[#A37E2C] uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 animate-pulse" />
                  {currentLang === "FR" 
                    ? "OPTIONS D'ORIENTATION UNIQUEMENT DISPONIBLES" 
                    : "GUIDED QUESTIONS DIRECT SELECTION"}
                </span>
                
                {/* Always active reset trigger */}
                <button
                  type="button"
                  onClick={resetGuide}
                  className="text-[9px] uppercase tracking-widest font-mono font-black text-neutral-500 hover:text-black flex items-center gap-1 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded transition-all cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{currentLang === "FR" ? "Recommencer la sélection" : "Restart Orientation"}</span>
                </button>
              </div>

              {/* Adaptive button layout depending on current guidedStep state */}
              <div className="max-w-4xl mx-auto w-full">
                {!isLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-1 animate-fade-in">
                    
                    {/* LEVEL 1: Category choice */}
                    {guidedStep === "discipline" && (
                      <>
                        {getDisciplineCount("velo-sub") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🚴 Vélo & Aérodynamisme" : "🚴 Cycling & Aerodynamics",
                              "velo-sub",
                              currentLang === "FR"
                                ? "Superbe choix d'aérodynamisme. Maison Atlis propose des vélos en carbone de pointe et des textiles aérodynamiques fins. Choisissez votre sous-catégorie :"
                                : "Magnificent aerodynamic choice. Maison Atlis crafts elite carbon bikes and thermo-regulating textiles. Select your desired subcategory:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🚴 Vélo & Aérodynamisme" : "🚴 Cycling & Aerodynamics"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}
                        
                        {getDisciplineCount("hike-sub") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "⛰️ Randonnée & Exploration Sauvage" : "⛰️ Hiking & Wild Exploration",
                              "hike-sub",
                              currentLang === "FR"
                                ? "L'appel de l'altitude. Maison Atlis fabrique des chaussures de marche d'exception en cuir italien et des sacs et accessoires de montage haut de gamme. Choisissez votre besoin :"
                                : "The call of extreme heights. Maison Atlis assembles bespoke Tuscan leather boots and high-durability expedition backpacks. Select your specialty:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "⛰️ Randonnée & Exploration Sauvage" : "⛰️ Hiking & Wild Exploration"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}

                        {getDisciplineCount("fitness-sub") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🏃 Cardio & Résistance d'Intérieur" : "🏃 Cardio & Indoor Training",
                              "fitness-sub",
                              currentLang === "FR"
                                ? "Façonner votre temple personnel d'exercice. Nous forgeons des rameurs et tapis en bois noble et des haltères haut de gamme. Choisissez votre pièce :"
                                : "Refining your personal training sanctuary. We manufacture luxury water rowers, smart trainers, and heavy steel accessories. Select your piece:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🏃 Cardio & Équipements d'Intérieur" : "🏃 Cardio & Indoor Fitness"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 2: Cycling Subcategories */}
                    {guidedStep === "velo-sub" && (
                      <>
                        {getCategoryGroupCount("velo-prestige") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🚲 Créations de Vélos de Prestige" : "🚲 Elite Bicycles & Frames",
                              "velo-prestige",
                              currentLang === "FR"
                                ? "Un rêve technique de cyclisme. Nos ingénieurs assemblent des gravels d'exception et des vélos à assistance électrique haut de gamme. Précisez votre type :"
                                : "An ultimate mechanical cycling dream. Our engineers construct grand gravel frames and active electrical assistants. Refine your frame type:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🚲 Vélos de Prestige (Carbone / Élec)" : "🚲 Elite Carbon & Electrics"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}

                        {getCategoryGroupCount("velo-apparel") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "👕 Équipement & Protections Textiles" : "👕 Cycling Apparel & Safety Apparel",
                              "velo-apparel",
                              currentLang === "FR"
                                ? "Le confort aérodynamique par excellence. Nous concevons des vestes de carrosserie et des casques de soufflerie profilés. Choisissez l'équipement souhaité :"
                                : "Aerodynamic comfort tailored for high wind resistance. We engineer windbreaker silhouettes and wind-tunnel helmets. Choose your wear:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "👕 Textiles & Protections" : "👕 Apparel & Protection"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 3: Velo Prestige details (Narrowing down to the final product) */}
                    {guidedStep === "velo-prestige" && (
                      <>
                        {getSubKeyCount("velo-road") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "⚡ Vélo de Route Ultra-Aérodynamique" : "⚡ High Speed Road Racing Frame",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici le modèle de route aérodynamique ultime configuré pour les chronos." : "Search complete! Here is the ultimate lightweight aerodynamic frame configured for speed:",
                              "velo-road"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Vitesse & Route Pure (Véloce)" : "High Speed Road (Veloce SL)"}</span>
                          </button>
                        )}

                        {getSubKeyCount("velo-gravel") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🍂 Gravel Agile Tous Chemins" : "🍂 All-terrain gravel bike",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici notre célèbre création de Gravel pour les aventures sable et terre." : "Search complete! We selected our iconic luxury Gravel for off-road wanderings:",
                              "velo-gravel"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Gravel & Multi-usage (GRVL AF)" : "Gravel Off-road (GRVL AF)"}</span>
                          </button>
                        )}

                        {getSubKeyCount("velo-elec") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🔋 Assistance Électrique Tout Chemin" : "🔋 E-Explorer Smart Electric",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Notre recommandation se porte sur le tout chemin électrique connecté." : "Search complete! Our ultimate recommendation goes to the connected electric e-explorer.",
                              "velo-elec"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Assistance Électrique (E-EXPL)" : "Electric Assist (E-EXPL)"}</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 3: Velo Apparel details (Narrowing down as requested) */}
                    {guidedStep === "velo-apparel" && (
                      <>
                        {getSubKeyCount("velo-jacket") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🧥 Veste Gilet Coupe-Vent" : "🧥 Windbreaker Thermal Vest",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici le gilet coupe-vent hermétique d'Atlis." : "Search complete! This is our top wind-resistant thermal vest.",
                              "velo-jacket"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Veste & Gilet Thermique" : "Thermal Gilet windbreaker"}</span>
                          </button>
                        )}

                        {getSubKeyCount("velo-helmet") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🪖 Casque Aéro & Gants d'Atelier" : "🪖 Aerodynamic Helmets & Gloves",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici le casque aérodynamique profilé soufflerie." : "Search complete! Here is the windproof aerodynamic helmet and glove selections.",
                              "velo-helmet"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Casque Aéro & Équipements" : "Helmets & Safety gear"}</span>
                          </button>
                        )}
                      </>
                    )}


                    {/* LEVEL 2: Hiking Subcategories */}
                    {guidedStep === "hike-sub" && (
                      <>
                        {getCategoryGroupCount("hike-boots") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🥾 Chaussures de Marche d'Exception" : "🥾 Bespoke Footwear & Boots",
                              "hike-boots",
                              currentLang === "FR"
                                ? "La démarche royale sur les crêtes. Nos bottiers de Chamonix proposent de solides bottes en cuir de toscane et des chaussures de trail agiles. Choisissez votre style :"
                                : "A royal posture on high ridges. Our bootmakers assemble thick Tuscan leather boots and agile trail runners. Choose your format:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🥾 Chaussures d'Exception" : "🥾 Tailored Footwear"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}

                        {getCategoryGroupCount("hike-pack") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🎒 Sacs de Montagne & Accessoires" : "🎒 Expedition Backpacks & Accessories",
                              "hike-pack",
                              currentLang === "FR"
                                ? "Des compagnons indispensables. Nous façonnons des sacs grand volume et des accessoires d'altitude comme des gourdes en inox et des GPS. Choisissez :"
                                : "Indispensable gear for wilderness. We craft robust high-capacity expedition packs and micro-accessories. Choose class:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🎒 Sacs & Accessoires" : "🎒 Packs & Altitude Gear"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 3: Hiking Boots details (Narrowing down) */}
                    {guidedStep === "hike-boots" && (
                      <>
                        {getSubKeyCount("hike-alp-boots") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🏔️ Bottes Alpines en Cuir Toscan" : "🏔️ High Altitude Tuscan Leather Boots",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Nous vous recommandons vivement les Bottes de Marche Alp-X en Cuir Toscan." : "Search complete! We highly recommend the grand Alp-X Tuscan Leather boots.",
                              "hike-alp-boots"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Bottes Cuir Double Paroi (Alp-X)" : "Leather Boots (Alp-X)"}</span>
                          </button>
                        )}

                        {getSubKeyCount("hike-trail-shoes") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🌲 Chaussures de Trail & Randonnée Légère" : "🌲 Light Trekking & Trail Shoes",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici notre sélection de chaussures de foulée agile pour sentier d'été." : "Search complete! Here is our selection of fast paced mountain trial runners.",
                              "hike-trail-shoes"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Trail & Marche Active" : "Light Trekking Runners"}</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 3: Hiking Packs and Accessories details (Narrowing down more and more) */}
                    {guidedStep === "hike-pack" && (
                      <>
                        {getSubKeyCount("hike-pack-volume") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🎒 Sac d'Expédition de Montagne" : "🎒 Olympus Mountain Backpack",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici le sac d'expédition ultime Olympus Pack (890 €)." : "Search complete! Our ultimate highlight is the high capacity Olympus Expedition Pack.",
                              "hike-pack-volume"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Sacs Haute Capacité (Olympus)" : "Expedition Sack (Olympus)"}</span>
                          </button>
                        )}

                        {getSubKeyCount("hike-pack-accessories") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "💧 Gourdes Isothermes & GPS Haute Précision" : "💧 Thermal Flask & Coros GPS Sensors",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Nous avons réuni la gourde inox double paroi et la montre GPS Coros Pace." : "Search complete! We isolated our premium titanium GPS watch and direct double-walled flask.",
                              "hike-pack-accessories"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "GPS, Gourdes & Instruments" : "GPS Watch & Flasks"}</span>
                          </button>
                        )}
                      </>
                    )}


                    {/* LEVEL 2: Cardio Subcategories */}
                    {guidedStep === "fitness-sub" && (
                      <>
                        {getCategoryGroupCount("fitness-machine") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🛶 Équipements & Machines Elite" : "🛶 Elite Wood Rower & Treadmill",
                              "fitness-machine",
                              currentLang === "FR"
                                ? "L'orfèvrerie mécanique. Notre atelier usine des rameurs en hêtre et des tapis de course pliants ultra-silencieux. Choisissez votre machine :"
                                : "Master woodworking mechanics. Our workshop builds luxury ashwood water rowers and whisper-silent smart runners. Select your machine:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🛶 Machines Nobles (Rameurs...)" : "🛶 Noble Wood Machines"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}

                        {getCategoryGroupCount("fitness-acc") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🏋️ Haltères & Accessoires de Précision" : "🏋️ Dumbbells & Yoga Mats",
                              "fitness-acc",
                              currentLang === "FR"
                                ? "L'essence de l'entrainement. Nous forgeons des haltères en acier et tissons des tapis de Yoga haute densité. Sélectionnez votre intérêt :"
                                : "The essence of fitness. We forge solid steel dumbbells and weave high-compliance yoga supports. Select your focus:"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                          >
                            <span>{currentLang === "FR" ? "🏋️ Haltères & Yoga" : "🏋️ Muscle Weight & Yoga"}</span>
                            <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 3: Fitness Machine details (Narrowing down) */}
                    {guidedStep === "fitness-machine" && (
                      <>
                        {getSubKeyCount("fitness-rower-wood") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🛶 Rameur noble en Bois de Hêtre" : "🛶 Beechwood WaterRower Trainer",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici l'Altis Woodrower Connecté en Frêne/Hêtre massif d'exception." : "Search complete! This is the ultimate woodrower water trainer with real-time feedback.",
                              "fitness-rower-wood"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Rameur en Bois Noble (Woodrower)" : "Lux Beechwood Woodrower"}</span>
                          </button>
                        )}

                        {getSubKeyCount("fitness-treadmill") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🏃 Tapis de Course Amorti Actif" : "🏃 Whisper-Silent ActiveRun Treadmill",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici le Tapis de Course Atlis RUN500 à amorti actif de Chamonix." : "Search complete! Highlighted is our premium active-absorption RUN500 treadmill.",
                              "fitness-treadmill"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Tapis de Course Actif (Atlis RUN)" : "Whisper Run treadmill"}</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 3: Fitness Accessories details (Narrowing down narrowing down) */}
                    {guidedStep === "fitness-acc" && (
                      <>
                        {getSubKeyCount("fitness-dumbbells") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🏋️ Haltères Classiques & Kit Acier" : "🏋️ Dumbbells & Steel Weight Kits",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici notre kit d'haltères et poids de précision d'Atlis." : "Search complete! Here are our high-precision heavy training steel weight dumbbells.",
                              "fitness-dumbbells"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-neutral-850 hover:text-[#A37E2C] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Haltères & Musculation" : "Weights & Conditioning steel"}</span>
                          </button>
                        )}

                        {getSubKeyCount("fitness-yoga") > 0 && (
                          <button 
                            onClick={() => handleSelectGuidedOption(
                              currentLang === "FR" ? "🧘 Tapis de Core & Support Yoga" : "🧘 High Density Core Yoga Support Mat",
                              "results",
                              currentLang === "FR" ? "Analyse terminée ! Voici notre tapis de protection et confort corporel en mousse d'Olympe." : "Search complete! Safeguard your ground exercise with our premium high density yoga mat.",
                              "fitness-yoga"
                            )}
                            className="w-full text-left p-4 sm:p-5 bg-white border-2 border-[#A37E2C]/50 hover:border-[#A37E2C] text-sm sm:text-base font-sans font-extrabold text-[#2E2218] transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center gap-3.5"
                          >
                            <CheckCircle className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            <span>{currentLang === "FR" ? "Tapis Yoga & Gym" : "Yoga Mats & Core floor"}</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* LEVEL 4: Dynamic Question screen (Height, hydration capacity, budget etc.) */}
                    {guidedStep === "ask-question" && currentQuestion && (
                      <>
                        <div className="col-span-full mb-1 text-center p-3 bg-neutral-50/70 border border-neutral-200/50 rounded-xl">
                          <p className="text-[10px] font-mono tracking-wider font-extrabold text-[#A37E2C] uppercase">
                            {currentLang === "FR" ? "Étape de Filtrage d'Atelier" : "Atelier Filtering Stage"}
                          </p>
                          <p className="text-xs text-neutral-500 font-medium font-sans mt-0.5">
                            {currentLang === "FR" 
                              ? `Affinons parmi les ${questionProducts.length} pièces restantes.` 
                              : `Narrowing down among the ${questionProducts.length} remaining pieces.`}
                          </p>
                        </div>
                        {currentQuestion.options
                          // Filter out options that would return 0 products to maintain professional luxury flows
                          .filter((opt: any) => questionProducts.filter(opt.filter).length > 0)
                          .map((opt: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectQuestionOption(
                                currentLang === "FR" ? opt.labelFR : opt.labelEN,
                                opt.filter
                              )}
                              className="w-full text-left p-4 sm:p-5 bg-neutral-50 border-2 border-neutral-300 hover:border-[#A37E2C] hover:bg-white text-sm sm:text-base font-sans font-extrabold text-[#2E2218]/95 transition-all rounded-2xl shadow-md hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-4"
                            >
                              <span>{currentLang === "FR" ? opt.labelFR : opt.labelEN}</span>
                              <ArrowRight className="w-5 h-5 text-[#A37E2C] shrink-0" />
                            </button>
                          ))
                        }
                      </>
                    )}

                    {/* Final step (RESULTS REACHED) - Offers option to begin a new search */}
                    {guidedStep === "results" && (
                      <div className="col-span-full py-1 text-center font-sans">
                        <button
                          onClick={resetGuide}
                          className="px-6 py-3 bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4] font-serif font-black uppercase text-xs tracking-widest rounded-lg transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>{currentLang === "FR" ? "DÉBUTER UNE NOUVELLE RECHERCHE SUIVIE" : "START A NEW GUIDED DISCOVERY"}</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* INTERACTIVE FREE CHAT WITH AI - Fills the emptiness with magnificent utility */}
              <form onSubmit={handleSendTextMessage} className="max-w-4xl mx-auto w-full mt-2 border-t border-neutral-100 pt-4">
                <div className="relative flex items-center bg-neutral-50 border border-neutral-300/80 rounded-xl overflow-hidden focus-within:border-[#A37E2C] focus-within:ring-2 focus-within:ring-[#A37E2C]/10 transition-all">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={
                      currentLang === "FR"
                        ? "Posez votre question sur-mesure à l'artisan (ex: vélo électrique/mécanique, budget, performance, taille...)"
                        : "Ask our master artisan anything (e.g. electric vs mechanical, budget vs performance vs aesthetics, size)..."
                    }
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm md:text-base font-semibold outline-none text-[#131211] placeholder-neutral-400 pr-24"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputVal.trim()}
                    className="absolute right-2 px-3.5 py-1.5 bg-[#2E2218] hover:bg-[#A37E2C] disabled:bg-neutral-200 text-white rounded-lg text-xs uppercase tracking-wider font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>{currentLang === "FR" ? "Envoyer" : "Send"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 items-center justify-between text-[11px] text-[#A37E2C] font-mono mt-2 px-1">
                  <span>💎 Salon virtuel de Chamonix — Conseils d'Atelier</span>
                  <span>Maison Atlis AI v3.5 • Entrée</span>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
