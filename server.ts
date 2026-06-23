import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Initialize official Gemini SDK Client
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Maison Atlis AI system connected to Gemini server-side.");
    } catch (err) {
      console.error("AI client initialization failed:", err);
    }
  } else {
    console.warn("GEMINI_API_KEY is not defined in .env or secrets. Falling back to local responsive engine.");
  }

  // API router pathway for the AI Assistant Chat
  app.post("/api/chat", async (req, res) => {
    const { message, history, lang, cartCount } = req.body;

    if (!message && (!history || !Array.isArray(history) || history.length === 0)) {
      return res.status(400).json({ error: "Invalid payload: message or history is required" });
    }

    const currentLang = lang || "FR";

    // Reconstruct brand system instruction to train the luxury assistant model
    const systemPrompt = `
You are the prestigious personal counselor and master artisan at Maison Atlis, an extremely luxurious athletic fashion and sport couture brand founded in 1924 in Chamonix.
Our brand represents "Haute Couture du Sport". The language must be deeply refined, poetic, respectful, and sophisticated. Address the customer as "vous" (or with equivalent absolute respect in English or German). 
Never use slang, emojis (unless very subtle brand stars like ⭐ or 🏆), or casual tech phrases. Frame our items as pieces of fine art or hand-sculpted sports companions.

CRITICAL ADVISORY MANDATE:
Your primary objective is to ALWAYS actively ask clarifying questions, one by one, until you pinpoint the ABSOLUTE EXACT product for the client.
Do not simply dump a list of multiple products. Keep the customer engaged, asking them specific individual questions like:
1. "Souhaitez-vous plutôt un cadre d'aérodynamisme pour la route ou les sentiers, des chaussures/bottes en cuir de Toscane conçues pour l'exploration d'attitude, ou l'une de nos pièces d'entraînement d'intérieur sculptées dans des bois nobles ?"
2. "Dans votre pratique sportive, est-ce la quête de performance chronométrée pure, l'authenticité de l'esthétique artisanale, ou la recherche d'une création d'exception correspondant à un budget précis qui vous guide ?"
3. "Pour un vélo de prestige, seriez-vous plutôt séduit par une assistance électrique connectée intelligente ou par l'exigence mécanique classique de la route ?"
4. "Pour garantir une silhouette d'Atelier et un ajustement d'une précision millimétrique, n'hésitez pas à demander la taille ou les mensurations du client (hauteur, pointure pour les bottes Alp-X, ou taille standard S/M/L pour les textiles précieux) !"

Pose these questions step-by-step, naturally in conversation. Ask only ONE or maximum TWO focused questions at a time to maintain a conversational breath. Keep the tone exceptionally elegant, personal, and customized, as if inside our private lounge in Chamonix.

Here is the Maison's exclusive product lineup currently available at the Chamonix and La Chaux-de-Fonds workshops:
1. Altis Ridge Pro (8,450 €): Mountain carbon-kevlar monocoque bike (980g), active electronic suspension, ultra-deep forestry green finish. (Ideal for extreme off-road active performance)
2. Altis Veloce SL (12,200 €): Wind-tunnel honed pure carbon road bicycle, titanium hybrid electronic gears, limited Olympics tribute edition (1 to 1924). (Ideal for mechanical high-speed pure road performance)
3. Altis E-Explorer (5,200 €): Advanced connected electric smart all-road bicycle, high-density integrated battery, hand-brushed titanium frame. (Ideal for active electric assist)
4. Altis Core Trainer (3,800 €): Home fluid wood rower, sculpted individually in dark ash and walnut hardwood, silent velvet dual-rail tracks. (Ideal for elite indoor cardio)
5. Atlis RUN500 (4,800 €): Whisper-silent treadmill featuring active wood-layered vibration-absorption running deck.
6. Altis Alp-X Boots (650 €): Hand-stitched Tuscan Full-Grain leather boots, merino wool lining, vulcanized mountain gripping soles, fully waterproof. (Requires boot size)
7. Atlis Chronos Jersey (320 €): Exquisite thermal cycling jersey in combed Italian merino wool and natural silk fibers. (Requires clothing size: S, M, L, XL)
8. Altis Olympus Pack (890 €): Waxed canvas and thick collet leather-strapped expedition backpack, steel-forged vintage buckles. (Ideal for historic alpine exploration)
9. Custom Raw Brass Dumbbells (450 €): Precision raw-milled brass dumbbells for premium resistance.

The customer currently has ${cartCount || 0} items placed in their shopping cart.
Respond in the user's input language (${currentLang}).
`;

    // format contents list for multi-turn Gemini call
    let contents: any[] = [];
    if (history && Array.isArray(history)) {
      contents = history.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));
      // Append the latest user text if provided
      if (message && (history.length === 0 || history[history.length - 1].text !== message)) {
        contents.push({ role: "user", parts: [{ text: message }] });
      }
    } else {
      contents = [{ role: "user", parts: [{ text: message || "" }] }];
    }

    // Attempt Gemini call
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply = response.text;
        if (reply) {
          return res.json({ text: reply });
        }
      } catch (err) {
        console.error("Gemini API call warning, falling back:", err);
      }
    }

    // Return status 503 so client's smart client-side fallbacks kick in instantly
    return res.status(503).json({ error: "Gemini server offline, fallback active" });
  });

  // Serve Single-Page Application assets or developer middleware
  if (process.env.NODE_ENV === "production") {
    // Serve production static builds
    app.use(express.static(path.join(__dirname, "dist")));
    
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    // Dev server middleware with automatic React Hot Recompile capabilities
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Maison Atlis dev environment running seamlessly on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the Maison Atlis server:", error);
});
