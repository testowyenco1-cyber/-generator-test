/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const OFFERS_FILE = path.join(process.cwd(), "offers.json");

  // Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Helper: Read offers
  function readOffers(): any[] {
    try {
      if (!fs.existsSync(OFFERS_FILE)) {
        return [];
      }
      const data = fs.readFileSync(OFFERS_FILE, "utf-8");
      if (!data.trim()) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading offers file, returning empty array:", error);
      return [];
    }
  }

  // Helper: Write offers
  function writeOffers(offers: any[]): boolean {
    try {
      fs.writeFileSync(OFFERS_FILE, JSON.stringify(offers, null, 2), "utf-8");
      return true;
    } catch (error) {
      console.error("Error writing offers file:", error);
      return false;
    }
  }

  // Lazy initialized Gemini Client
  let aiInstance: GoogleGenAI | null = null;
  function getGemini(): GoogleGenAI {
    if (!aiInstance) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY environment variable is required but missing");
      }
      aiInstance = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  }

  // --- API ENDPOINTS ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Get all offers
  app.get("/api/offers", (req, res) => {
    const offers = readOffers();
    // Return all offers
    res.json(offers);
  });

  // Get single offer by ID
  app.get("/api/offers/:id", (req, res) => {
    const offers = readOffers();
    const offer = offers.find((o) => o.id === req.params.id);
    if (!offer) {
      return res.status(404).json({ error: "Nie znaleziono oferty o podanym ID." });
    }
    res.json(offer);
  });

  // Create or Update offer
  app.post("/api/offers", (req, res) => {
    const newOffer = req.body;
    if (!newOffer || !newOffer.id) {
      return res.status(400).json({ error: "Błędne dane oferty. Wymagane ID." });
    }

    const offers = readOffers();
    const existingIndex = offers.findIndex((o) => o.id === newOffer.id);

    if (existingIndex >= 0) {
      offers[existingIndex] = { ...offers[existingIndex], ...newOffer };
    } else {
      offers.unshift(newOffer);
    }

    const success = writeOffers(offers);
    if (!success) {
      return res.status(500).json({ error: "Nie udało się zapisać oferty w bazie danych." });
    }

    res.json({ status: "success", offer: newOffer });
  });

  // Delete offer
  app.delete("/api/offers/:id", (req, res) => {
    const id = req.params.id;
    const offers = readOffers();
    const filteredOffers = offers.filter((o) => o.id !== id);

    if (offers.length === filteredOffers.length) {
      return res.status(404).json({ error: "Nie znaleziono oferty o podanym ID." });
    }

    const success = writeOffers(filteredOffers);
    if (!success) {
      return res.status(500).json({ error: "Nie udało się skasować oferty z bazy danych." });
    }

    res.json({ status: "deleted", id });
  });

  // Optimize text using Gemini AI
  app.post("/api/gemini/enhance", async (req, res) => {
    const { text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Brak tekstu do ulepszenia" });
    }

    try {
      const ai = getGemini();
      const systemPrompt = `Jesteś doświadczonym inżynierem elektroenergetykiem i ekspertem technicznym w firmie ENCO Sp. z o.o., specjalizującym się w stacjach transformatorowych NZ/BEK oraz osprzęcie średniego i niskiego napięcia.
Twoim jedynym zadaniem jest zredagowanie, ulepszenie stylistyczne i techniczne opisu podanego przez użytkownika.
Spraw, by tekst brzmiał profesjonalnie, czytelnie, oficjalnie i precyzyjnie technicznie. Zachowaj formę zwięzłych punktów, jeśli wejściem były punkty.
NIGDY nie zmieniaj ani nie usuwaj podanych danych liczbowych, wymiarów (np. metrów, milimetrów, ton, parametrów elektrycznych kV, A, kA, REI itp.), ale sformatuj je pięknie dla polskiego klienta energetycznego.
Zwróć TYLKO zredagowany tekst, bez żadnych zdań wstępnych typu 'Oto poprawiona wersja', bez komentarzy i wyjaśnień.`;

      const contents = `Przekształć poniższy opis na profesjonalną prozę techniczną oferty handlowej stacji transformatorowych ENCO:
"${text}"
${context ? `Lokalizacja tego pola w ofercie: ${context}` : ""}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.1,
        }
      });

      const enhancedText = response.text || text;
      res.json({ enhancedText: enhancedText.trim() });
    } catch (error: any) {
      console.warn("Gemini is not initialized or failed, fallback to original text:", error.message);
      res.status(200).json({ 
        enhancedText: text, 
        warning: "Wymagany klucz GEMINI_API_KEY w panelu Secrets został niezainicjalizowany lub wystąpił błąd. Zwrócono oryginalny tekst.",
        details: error.message
      });
    }
  });

  // Catch non-existent /api routes before Vite middleware takes over
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `Nie znaleziono ścieżki API: ${req.originalUrl}` });
  });

  // Global API error handler ensuring JSON responses instead of HTML error pages
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path && req.path.startsWith("/api")) {
      console.error("API Error caught:", err);
      const statusCode = err.status || err.statusCode || 500;
      return res.status(statusCode).json({
        error: err.message || "Wystąpił błąd serwera podczas przetwarzania żądania API."
      });
    }
    next(err);
  });

  // --- VITE DEV / PRODUCTION STATIC HANDLING ---
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode serving built files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server runs as container ingress on port ${PORT}`);
    console.log(`Offers active Database file: ${OFFERS_FILE}`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to start backend server:", err);
  process.exit(1);
});
