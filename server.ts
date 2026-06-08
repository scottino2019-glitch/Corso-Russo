import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());
  
  const PORT = 3000;

  // Assistant API endpoint
  app.post('/api/assistant', async (req, res) => {
    try {
      const { mode, userInput, context = '', history = [] } = req.body;
      let systemInstruction = "Sei un assistente virtuale e tutor esperto per l'insegnamento della lingua russa ad italiani. Rispondi in modo cordiale, chiaro e strutturato, usando caratteri russi e pronuncia trascritta dove opportuno.";
      
      if (mode === 'translate') {
        systemInstruction += " Ruolo: Traduttore russo-italiano. Traduci il testo fornito dall'utente. Fornisci la traduzione corretta, la traslitterazione fonetica per la pronuncia, e una spiegazione dettagliata delle parole e delle strutture usate (es. casi, desinenze).";
      } else if (mode === 'grammar') {
        systemInstruction += " Ruolo: Insegnante di grammatica. Spiega l'argomento grammaticale richiesto. Usa formatting Markdown con tabelle chiare e diciture nitide. Fornisci 3 esempi d'uso completi di accenti, pronuncia figurata e traduzione.";
      } else if (mode === 'vocabulary') {
        systemInstruction += " Ruolo: Dizionario e vocabolario. Analizza la parola russa o italiana inserita dall'utente. Spiegala indicandone la pronuncia, genere, declinazione/coniugazione principale, aspetto verbale se verbo, sinonimi e fornisce 2 frasi di esempio.";
      } else if (mode === 'exercise') {
        systemInstruction += " Ruolo: Valutatore di esercizi. Correggi la risposta dell'utente ad un esercizio. Il contesto contiene l'esercizio originale con la soluzione o la consegna. Spiega chiaramente se la risposta è corretta o meno, evidenzia accuratamente gli errori e dai la correzione con spiegazione grammaticale.";
      } else if (mode === 'tutor') {
        systemInstruction += " Ruolo: Tutor amichevole e partner di conversazione. Chiacchiera con l'utente. Scrivi frasi semplici in russo con la loro traduzione tra parentesi o a lato in italiano. Incoraggialo a rispondere e dagli consigli di apprendimento.";
      }

      // Convert history to format acceptable by SDK generator
      const contentsList: any[] = [];
      
      if (history && history.length > 0) {
        for (const msg of history) {
          contentsList.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          });
        }
      }
      
      // Append the latest user message
      const latestMessageText = context 
        ? `[Contesto aggiuntivo: ${context}]\n\nRichiesta o input dell'utente: ${userInput}`
        : userInput;
        
      contentsList.push({
        role: 'user',
        parts: [{ text: latestMessageText }]
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contentsList,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });
      } catch (err: any) {
        console.warn("Spike in demand or error on gemini-3.5-flash, trying fallback to gemini-3.1-flash-lite:", err);
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: contentsList,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });
        } catch (fallbackErr: any) {
          console.error("All Gemini models failed:", fallbackErr);
          throw new Error("I server AI di Google sono momentaneamente sovraccarichi o non raggiungibili (Stato 503). Per favore, attendi un istante e riprova.");
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Errore nell'API Assistant:", error);
      res.status(500).json({ error: error.message || "Errore sconosciuto nel server dell'assistente." });
    }
  });

  // Serve Vite or static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
  });
}

startServer();
