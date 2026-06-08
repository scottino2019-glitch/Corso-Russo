import { GoogleGenAI } from '@google/genai';

// Inizializzazione pigra del client Gemini per evitare arresti anomali in assenza di chiavi
let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("L'ambiente Netlify richiede la variabile GEMINI_API_KEY configurata nelle impostazioni del sito.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-netlify',
        }
      }
    });
  }
  return ai;
}

export const handler = async (event: any) => {
  // Consenti solo richieste POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Metodo non consentito' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { mode, userInput, context = '', history = [] } = body;

    if (!userInput) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Il campo userInput è obbligatorio' })
      };
    }

    const aiClient = getAiClient();

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

    // Ricostruisci la cronologia in formato compatibile con SDK Google GenAI
    const contentsList: any[] = [];
    
    if (history && history.length > 0) {
      for (const msg of history) {
        contentsList.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }]
        });
      }
    }
    
    const latestMessageText = context 
      ? `[Contesto aggiuntivo: ${context}]\n\nRichiesta o input dell'utente: ${userInput}`
      : userInput;
      
    contentsList.push({
      role: 'user',
      parts: [{ text: latestMessageText }]
    });

    let response;
    try {
      response = await aiClient.models.generateContent({
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
        response = await aiClient.models.generateContent({
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ text: response.text })
    };
  } catch (error: any) {
    console.error("Errore nella funzione Netlify Assistant:", error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message || "Errore durante l'elaborazione dell'assistente." })
    };
  }
};
