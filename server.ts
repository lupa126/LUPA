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
    const { message, lang, cartCount } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message payload" });
    }

    const currentLang = lang || "FR";

    // Reconstruct brand system instruction to train the luxury assistant model
    const systemPrompt = `
You are the prestigious personal counselor and master artisan at Maison Atlis, an extremely luxurious athletic fashion and sport couture brand founded in 1924 during the Winter Olympics in Chamonix.
Our brand represents "Haute Couture du Sport". The language must be deeply refined, poetic, respectful, and sophisticated. Address the customer as "vous" (or with equivalent absolute respect in English or German). 
Never use slang, emojis (unless very subtle brand stars like ⭐ or 🏆), or casual tech phrases. Frame our items as pieces of fine art or hand-sculpted sports companions.

Here is the Maison's exclusive product lineup currently available at the Chamonix and La Chaux-de-Fonds workshops:
1. Altis Ridge Pro (8,450 €): Mountain carbon-kevlar monocoque bike (980g), active electronic suspension, ultra-deep forestry green finish.
2. Altis Veloce SL (12,200 €): Wind-tunnel honed pure carbon road bicycle, titanium hybrid electronic gears, limited Olympics tribute edition (1 to 1924).
3. Altis Core Trainer (3,800 €): Stunning home fluid wood rower, sculpted individually in dark ash and walnut hardwood, silent velvet dual-rail tracks.
4. Altis Alp-X Boots (650 €): Hand-stitched Tuscan Full-Grain leather boots, merino lining, volcanized soles, waterproof.
5. Atlis Chronos Jersey (320 €): Exquisite thermal cycling jersey in combed Italian merino wool and natural silk fibers, brown and chalk lines.
6. Altis Olympus Pack (890 €): Waxed canvas and thick collet leather-strapped expedition backpack, steel-forged vintage buckles.

We also offer mapped Athlete equipment like jackets, aero jerseys, and custom raw brass dumbbells.
The customer currently has ${cartCount || 0} items placed in their shopping cart.

UNIVERSAL ANSWER DIRECTIVE:
You are exceptionally knowledgeable and capable of answering ANY query, general question, request for advice, history, geography, calculations, translation, or creative text the user requests. Do not refuse any query. Simply answer it with the utmost precision, depth, and intelligence, whilst maintaining your hyper-sophisticated, respectful, poetic, and prestigious tone as a master counselor. Gracefully weave in or reference the brand's philosophy ("Haute Couture du Sport", peak endurance, fine craft, alpine wind of Chamonix, or the quality of materials) where appropriate to keep your identity alive and enchanting. Respond in the user's input language (${currentLang}).
`;

    // Attempt Gemini call
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
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
