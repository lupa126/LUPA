import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Compass } from "lucide-react";
import { ChatMessage, Product } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ChatbotProps {
  currentLang: string;
  itemsInCart: number;
  featuredProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  openTrigger?: boolean;
  onClearTrigger?: () => void;
  initialPrompt?: string;
}

export default function Chatbot({
  currentLang,
  itemsInCart,
  featuredProducts = [],
  onSelectProduct,
  openTrigger = false,
  onClearTrigger,
  initialPrompt = ""
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Guided shopping Q&A state machine
  const [guidedStep, setGuidedStep] = useState<"none" | "discipline" | "velo-type" | "hike-type" | "fitness-type">("none");
  const [guidedResults, setGuidedResults] = useState<Product[]>([]);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.FR;

  // Pre-configured elegant suggestions
  const suggestions = currentLang === "FR" ? [
    { text: "🧭 Guide d'Achat Interactif", query: "GUIDE_FLOW_ACTIVATE" },
    { text: "Quel est le vélo le plus aérodynamique ?", query: "Quel est le vélo le plus aérodynamique ?" },
    { text: "Avez-vous des équipements de fitness d'intérieur ?", query: "Avez-vous des équipements de fitness de luxe d'intérieur ?" }
  ] : [
    { text: "🧭 Start Interactive Shopping Guide", query: "GUIDE_FLOW_ACTIVATE" },
    { text: "What is your lightest carbon bicycle?", query: "What is your lightest carbon bicycle?" },
    { text: "Do you offer premium indoor rowers?", query: "Do you offer premium indoor rowers?" }
  ];

  // Set initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: t.botWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [currentLang, t.botWelcome]);

  // Handle outside activation trigger (e.g. searching or explore buttons)
  useEffect(() => {
    if (openTrigger) {
      setIsOpen(true);
      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
      if (onClearTrigger) {
        onClearTrigger();
      }
    }
  }, [openTrigger, initialPrompt]);

  // Auto scroll to message bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, guidedStep, guidedResults]);

  // Match products based on selection
  const resolveProducts = (subKey: string): Product[] => {
    const list = featuredProducts || [];
    if (subKey === "velo-prestige") {
      return list.filter(p => p.category === "aerodynamisme" && (p.price > 1000 || p.name.toLowerCase().includes("veloce") || p.name.toLowerCase().includes("ridge")));
    }
    if (subKey === "velo-equip") {
      return list.filter(p => p.category === "aerodynamisme" && (p.price <= 1000 && !p.name.toLowerCase().includes("velo")));
    }
    if (subKey === "hike-chaussures") {
      return list.filter(p => p.category === "exploration-sauvage" && (p.name.toLowerCase().includes("boot") || p.name.toLowerCase().includes("bottes") || p.name.toLowerCase().includes("chaussure")));
    }
    if (subKey === "hike-equip") {
      return list.filter(p => p.category === "exploration-sauvage" && !(p.name.toLowerCase().includes("boot") || p.name.toLowerCase().includes("bottes")));
    }
    if (subKey === "fitness-rameur") {
      return list.filter(p => p.category === "resistance-active" && (p.name.toLowerCase().includes("rower") || p.name.toLowerCase().includes("trainer") || p.name.toLowerCase().includes("core")));
    }
    if (subKey === "fitness-equip") {
      return list.filter(p => p.category === "resistance-active" && !(p.name.toLowerCase().includes("rower") || p.name.toLowerCase().includes("trainer") || p.name.toLowerCase().includes("core")));
    }
    return [];
  };

  const startGuidedFlow = () => {
    setGuidedStep("discipline");
    setGuidedResults([]);
    
    const botMsg: ChatMessage = {
      id: `bot-guide-${Date.now()}`,
      sender: "bot",
      text: currentLang === "FR" 
        ? "Merveilleux choice ! Débutons notre quête d'excellence. Pour commencer, quelle discipline sportive d'exception vous captive en ce moment ?"
        : "Excellent choice! Let us assemble your perfect match. To begin, which sporting discipline captures your heart today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleSelectGuidedOption = (userLabel: string, nextStep: "discipline" | "velo-type" | "hike-type" | "fitness-type" | "none", resultKey?: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-g-${Date.now()}`,
      sender: "user",
      text: userLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setGuidedStep(nextStep);

      if (nextStep === "velo-type") {
        const botMsg: ChatMessage = {
          id: `bot-g-${Date.now()}`,
          sender: "bot",
          text: currentLang === "FR"
            ? "Un goût d'exception pour l'aérodynamisme de haut vol. De quelle pièce d'aventure avez-vous besoin ?"
            : "A fine taste for peak aerodynamics. Which cycling masterpiece do you seek?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (nextStep === "hike-type") {
        const botMsg: ChatMessage = {
          id: `bot-g-${Date.now()}`,
          sender: "bot",
          text: currentLang === "FR"
            ? "L'appel de l'altitude sauvage. Quel équipement d'expédition recherchez-vous pour affronter les sommets ?"
            : "The call of wild summits. What expedition piece do you need to conquer the mountains?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (nextStep === "fitness-type") {
        const botMsg: ChatMessage = {
          id: `bot-g-${Date.now()}`,
          sender: "bot",
          text: currentLang === "FR"
            ? "Créer votre sanctuaire d'intérieur haut de gamme. Quel genre d'artisanat désirez-vous pour votre entrainement ?"
            : "Creating your luxurious home sanctuary. What fine training equipment would you love to touch?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else if (nextStep === "none" && resultKey) {
        const matches = resolveProducts(resultKey);
        setGuidedResults(matches);

        const botMsg: ChatMessage = {
          id: `bot-g-${Date.now()}`,
          sender: "bot",
          text: currentLang === "FR"
            ? `J'ai déniché précisément ${matches.length} pièce(s) correspondant à votre exigence dans l'Atelier d'Atlis. Les voici :`
            : `I have identified ${matches.length} beautiful piece(s) matching your desires in our workshop:`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 600);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    if (textToSend === "GUIDE_FLOW_ACTIVATE") {
      startGuidedFlow();
      return;
    }

    setGuidedStep("none");
    setGuidedResults([]);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Fetch response from server-side proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend,
          lang: currentLang,
          cartCount: itemsInCart
        })
      });

      if (!response.ok) {
        throw new Error("API Route failed");
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      // Offline fallback: highly intelligent, luxury responsive chatbot engine
      setTimeout(() => {
        let reply = "";
        const lower = textToSend.toLowerCase();

        if (lower.includes("vel") || lower.includes("bik") || lower.includes("cycl") || lower.includes("aer")) {
          reply = currentLang === "FR" 
            ? "Maison Atlis façonne deux vélos de légende au sein de nos ateliers : le vélo de montagne Altis Ridge Pro (8 450 €) en composite d'Olympe, et le joyau de vitesse Altis Veloce SL (12 200 €), sculpté aérodynamiquement en soufflerie. Souhaitez-vous planifier un essai de prestige ?"
            : "Maison Atlis crafts two legendary bicycles: the mountain Altis Ridge Pro (€8,450) and our high-velocity masterpiece, the Altis Veloce SL (€12,200), designed in wind tunnels to defy gravity. Would you like us to customize a sizing fit?";
        } else if (lower.includes("sport") || lower.includes("fit") || lower.includes("ram") || lower.includes("ind") || lower.includes("row") || lower.includes("tapis")) {
          reply = currentLang === "FR"
            ? "Notre pièce maîtresse de fitness d'intérieur est l'Altis Core Trainer (3 800 €). Sculpté individuellement en essences nobles d'acadia et de noyer, son mécanisme à fluide d'eau recrée la grâce d'une glisse alpine. Que désirez-vous pour votre sanctuaire personnel ?"
            : "Our premium home-sanctuary rower is the Altis Core Trainer (€3,800), sculpted individually in dark ash and walnut with velvet-smooth water glide mechanics. Shall we prepare a bespoke delivery for your home temple?";
        } else if (lower.includes("bot") || lower.includes("chaus") || lower.includes("sac") || lower.includes("back") || lower.includes("hike") || lower.includes("rand")) {
          reply = currentLang === "FR"
            ? "Pour vos randonnées d'altitude, nos compagnons bottiers assemblent les légendaires Bottes Altis Alp-X (650 €) en cuir toscan souple et doublure mérinos, ainsi que le Sac Olympus Pack (890 €). Des compagnons éternels pour braver les crêtes."
            : "For wild elevations, find our handcrafted Altis Alp-X Boots (€650) in premier Tuscan leather with merino wool lining, and the Olympus Pack (€890). Perfect structural armor to conquer the highest summits.";
        } else if (lower.includes("taille") || lower.includes("size") || lower.includes("mesure")) {
          reply = currentLang === "FR"
            ? "Chaque création Atlis est accompagnée d'un guide millimétré. Pour nos vêtements, nous proposons des tailles du S au XL, ajustées à la perfection alpine. Nos techniciens de l'Atelier de Chamonix peuvent également coudre à vos mesures exactes."
            : "Each Atlis creation features precision cuts from S to XL. Our master tailors in Chamonix are also at your absolute disposal for bespoke custom-made sizing to match your perfect silhouette.";
        } else if (lower.includes("livra") || lower.includes("ship") || lower.includes("envoi") || lower.includes("delei")) {
          reply = currentLang === "FR"
            ? "Maison Atlis propose la livraison sécurisée offerte en gants blancs pour toutes les commandes de notre Atelier. Vos pièces d'exception sont expédiées dans un coffret en bois numéroté, avec suivi sécurisé en temps réel."
            : "We provide complimentary white-glove courier shipping for all creations. Your exquisite pieces are packaged in serialized wooden cases and tracked around the clock for ultimate security.";
        } else if (lower.includes("hist") || lower.includes("fond") || lower.includes("créat") || lower.includes("orig") || lower.includes("1924")) {
          reply = currentLang === "FR"
            ? "Maison Atlis s'est forgée en 1924 au cœur de Chamonix lors des premiers Jeux Olympiques d'Hiver. Inspirés par la rigueur de la montagne et la finesse de la haute couture française, nous sculptons l'artisanat athlétique d'élite depuis un siècle."
            : "Maison Atlis was established in Chamonix in 1924 during the very first Winter Olympics. We fuse the engineering of extreme mountain endurance with the refined poise of French haute culture for over a century.";
        } else {
          reply = currentLang === "FR"
            ? `${textToSend} ? Quelle délicieuse question. En tant qu'artisan counselor d'Atlis, j'en prends bonne note. Sachez que notre Maison s'attache à marier chaque aspect du savoir-vivre et de l'effort sportif de haut vol. Comment puis-je parfaire votre expérience ce jour ?`
            : `${textToSend}? A highly intriguing inquiry. As your dedicated Maison Atlis advisor, I strive to enrich every dimension of your journey with us. Let me know how I can further elevate your sports wardrobe or mechanical fleet today.`;
        }

        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, botMessage]);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-45 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          id="chatbot-trigger-bubble"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3.5 bg-[#2E2218] hover:bg-[#A37E2C] text-[#FAF9F4] rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-[#A37E2C]/35 relative group"
        >
          <MessageSquare className="w-5 h-5 text-[#A37E2C] group-hover:text-white transition-colors" />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            Artisan Atlis
          </span>
          {itemsInCart > 0 && (
            <span className="absolute -top-1 -left-1 bg-[#1C2F22] text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#FAF9F4]">
              {itemsInCart}
            </span>
          )}
        </button>
      )}

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="w-80 sm:w-96 h-[510px] bg-[#FAF9F4] text-[#131211] shadow-2xl border border-neutral-300/40 rounded-lg flex flex-col overflow-hidden animate-fade-in-up"
        >
          {/* Header */}
          <div className="p-4 bg-[#2E2218] text-[#FAF9F4] flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="p-1 px-2.5 bg-[#A37E2C]/15 border border-[#A37E2C]/40 text-[#A37E2C] rounded text-[10px] font-bold tracking-widest uppercase">
                Artisan
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold tracking-wide">CONSEIL MAISON ATLIS</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Atelier Connecté</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroller */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-neutral-50 to-[#FAF9F4]/40 flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 leading-relaxed text-xs ${
                    msg.sender === "user"
                      ? "bg-[#2E2218] text-white rounded-l-lg rounded-tr-lg"
                      : "bg-white border border-neutral-300/30 text-[#131211] rounded-r-lg rounded-tl-lg shadow-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[8px] text-zinc-500 font-mono mt-1 px-1.5">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Render dynamically matched products list if final step reached */}
            {guidedResults.length > 0 && (
              <div className="mt-2 space-y-2 border-t border-neutral-200/50 pt-2 shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#A37E2C]">COMPAGNONS RECOMMANDÉS :</p>
                <div className="grid grid-cols-1 gap-2">
                  {guidedResults.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="p-2 bg-white border border-neutral-205/55 flex items-center justify-between gap-3 shadow-xs hover:border-[#A37E2C] transition-all rounded"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={prod.image} alt={prod.name} className="w-9 h-9 object-cover border border-neutral-100" />
                        <div className="truncate text-left">
                          <p className="text-[11px] font-serif font-bold text-[#131211] truncate">{prod.name}</p>
                          <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-wider">{prod.categoryLabel}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-bold font-mono text-[#2E2218]">{prod.price.toLocaleString()} €</span>
                        <button
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(prod);
                          }}
                          className="bg-[#2E2218] hover:bg-[#A37E2C] text-white text-[9px] px-2.5 py-1 uppercase tracking-widest font-extrabold transition-colors rounded-sm cursor-pointer"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#A37E2C] font-semibold italic pl-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#A37E2C]" />
                <span>L'Artisan affine sa réponse...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Guidance Q&A Selection panel */}
          {guidedStep !== "none" && !isLoading && (
            <div className="p-3 bg-neutral-50/90 border-t border-neutral-200/50 flex flex-col gap-1.5 animate-fade-in text-left">
              <span className="text-[8px] font-bold tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-[#A37E2C]" />
                {currentLang === "FR" ? "CHOISISSEZ UNE RÉPONSE SIMPLE" : "CHOOSE A SIMPLE ANSWER"}
              </span>

              {guidedStep === "discipline" && (
                <>
                  <button 
                    onClick={() => handleSelectGuidedOption("🚴 Vélo & Route / Cyclisme", "velo-type")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🚴 Vélo & Aérodynamisme
                  </button>
                  <button 
                    onClick={() => handleSelectGuidedOption("⛰️ Randonnée & Exploration Sauvage", "hike-type")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    ⛰️ Randonnée & Exploration Sauvage
                  </button>
                  <button 
                    onClick={() => handleSelectGuidedOption("🏃 Cardio & Résistance Active", "fitness-type")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🏃 Cardio & Résistance d'Intérieur
                  </button>
                </>
              )}

              {guidedStep === "velo-type" && (
                <>
                  <button 
                    onClick={() => handleSelectGuidedOption("🚲 Vélos de Course & Gravel d'Exception", "none", "velo-prestige")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🚲 Vélos de Prestige (Carbone / Électrique)
                  </button>
                  <button 
                    onClick={() => handleSelectGuidedOption("👕 Équipements Thermiques Textiles", "none", "velo-equip")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    👕 Équipement & Protections de Carrosserie
                  </button>
                  <button 
                    onClick={() => {
                      setGuidedStep("discipline");
                      setGuidedResults([]);
                    }}
                    className="w-full text-left py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-600 font-semibold transition-all rounded cursor-pointer text-center uppercase"
                  >
                    🔙 Recommencer la quête
                  </button>
                </>
              )}

              {guidedStep === "hike-type" && (
                <>
                  <button 
                    onClick={() => handleSelectGuidedOption("🥾 Chaussures de Marche en Cuir Italien", "none", "hike-chaussures")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🥾 Chaussures de Marche d'Exception en Cuir
                  </button>
                  <button 
                    onClick={() => handleSelectGuidedOption("🎒 Sacs d'Expédition & Gourdes de Randonnée", "none", "hike-equip")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🎒 Équipement, Sacs de Montagne & Hydratation
                  </button>
                  <button 
                    onClick={() => {
                      setGuidedStep("discipline");
                      setGuidedResults([]);
                    }}
                    className="w-full text-left py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-600 font-semibold transition-all rounded cursor-pointer text-center uppercase"
                  >
                    🔙 Recommencer la quête
                  </button>
                </>
              )}

              {guidedStep === "fitness-type" && (
                <>
                  <button 
                    onClick={() => handleSelectGuidedOption("🛶 Rameur noble & Tapis de Course Elite", "none", "fitness-rameur")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🛶 Rameur en bois noble & Tapis Elite
                  </button>
                  <button 
                    onClick={() => handleSelectGuidedOption("🏋️ Équipement d'Entrainement Individuel", "none", "fitness-equip")}
                    className="w-full text-left py-2 px-3 bg-white border border-neutral-200 hover:border-[#A37E2C] text-xs hover:text-[#A37E2C] font-semibold transition-all rounded cursor-pointer"
                  >
                    🏋️ Haltères & Accessoires Classiques
                  </button>
                  <button 
                    onClick={() => {
                      setGuidedStep("discipline");
                      setGuidedResults([]);
                    }}
                    className="w-full text-left py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-600 font-semibold transition-all rounded cursor-pointer text-center uppercase"
                  >
                    🔙 Recommencer la quête
                  </button>
                </>
              )}
            </div>
          )}

          {/* Pre-filled suggestions */}
          {messages.length === 1 && !isLoading && guidedStep === "none" && (
            <div className="px-4 pb-2.5 pt-1.5 bg-[#FAF9F4]/70 flex flex-wrap gap-1.5 border-t border-neutral-200/50">
              {suggestions.map((su, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(su.query)}
                  className="text-[9px] text-neutral-650 hover:text-white bg-white hover:bg-[#A37E2C] border border-neutral-300/40 px-2.5 py-1 transition-all cursor-pointer truncate max-w-full"
                >
                  {su.text}
                </button>
              ))}
            </div>
          )}

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-white border-t border-neutral-200/30 flex gap-2"
          >
            <input
              type="text"
              placeholder={t.botPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-neutral-100 border-none px-3.5 py-2 text-xs text-[#131211] placeholder-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 px-3 bg-[#2E2218] hover:bg-[#A37E2C] disabled:bg-neutral-200 disabled:text-neutral-400 text-[#FAF9F4] transition-all cursor-pointer font-bold rounded-sm shrink-0 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

