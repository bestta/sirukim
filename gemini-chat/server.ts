import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env.local") });
dotenv.config({ path: path.join(__dirname, ".env") });

async function startServer() {
  const app = express();
  const PORT = 5174;

  // Body parser
  app.use(express.json());

  // Initialize Gemini client (Lazy initialization to prevent crash if key is missing)
  let ai: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in your AI Studio Secrets.");
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  }

  // API Route: Send message and get non-streaming or streaming response
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, stream = true } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const client = getGeminiClient();

      // Transform messages into @google/genai contents format
      // `{ role: "user" | "model", parts: [{ text: string }] }[]`
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : m.role === "user" ? "user" : "user",
        parts: [{ text: m.content }]
      }));

      let modelName = req.body.model || "gemini-3.5-flash";

      if (stream) {
        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        try {
          let responseStream;
          try {
            responseStream = await client.models.generateContentStream({
              model: modelName,
              contents,
              config: {
                systemInstruction: "You are Gemini Chat, a highly intelligent, polite, and helpful AI assistant. Always reply in the user's input language. Answer concisely, engage appropriately, and format replies beautifully with clear typography, bold lists, code highlights, and tables using Markdown. Do not larp as a system or console; be a supportive human-friendly AI."
              }
            });
          } catch (firstError: any) {
            // Check if model was gemini-3.5-flash and fell back due to 503 or transient issues
            const isTransientError = firstError.message?.includes("503") || 
                                     firstError.message?.includes("UNAVAILABLE") || 
                                     firstError.message?.includes("high demand");
            
            if (modelName === "gemini-3.5-flash" && isTransientError) {
              console.warn("gemini-3.5-flash is unavailable or experiencing high demand. Falling back to gemini-3.1-flash-lite...");
              modelName = "gemini-3.1-flash-lite";
              responseStream = await client.models.generateContentStream({
                model: modelName,
                contents,
                config: {
                  systemInstruction: "You are Gemini Chat, a highly intelligent, polite, and helpful AI assistant. Always reply in the user's input language. Answer concisely, engage appropriately, and format replies beautifully with clear typography, bold lists, code highlights, and tables using Markdown. Do not larp as a system or console; be a supportive human-friendly AI."
                }
              });
            } else {
              throw firstError;
            }
          }

          for await (const chunk of responseStream) {
            const text = chunk.text || "";
            // Send chunk to client in SSE format
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }

          res.write("data: [DONE]\n\n");
          res.end();
        } catch (streamError: any) {
          console.error("Stream generation error:", streamError);
          res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
          res.end();
        }
      } else {
        let response;
        try {
          response = await client.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: "You are Gemini Chat, a highly intelligent, polite, and helpful AI assistant. Always reply in the user's input language. Answer concisely, engage appropriately, and format replies beautifully with clear typography, bold lists, code highlights, and tables using Markdown. Do not larp as a system or console; be a supportive human-friendly AI."
            }
          });
        } catch (firstError: any) {
          const isTransientError = firstError.message?.includes("503") || 
                                   firstError.message?.includes("UNAVAILABLE") || 
                                   firstError.message?.includes("high demand");

          if (modelName === "gemini-3.5-flash" && isTransientError) {
            console.warn("gemini-3.5-flash is unavailable. Falling back to gemini-3.1-flash-lite...");
            modelName = "gemini-3.1-flash-lite";
            response = await client.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction: "You are Gemini Chat, a highly intelligent, polite, and helpful AI assistant. Always reply in the user's input language. Answer concisely, engage appropriately, and format replies beautifully with clear typography, bold lists, code highlights, and tables using Markdown. Do not larp as a system or console; be a supportive human-friendly AI."
              }
            });
          } else {
            throw firstError;
          }
        }

        res.json({ text: response.text });
      }
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message || "An error occurred with the Gemini API." });
    }
  });

  // Serve static files / Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: __dirname,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
