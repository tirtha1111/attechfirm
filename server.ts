import express from "express";
import next from "next";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const wss = new WebSocketServer({ noServer: true });

  // WebSocket connection for Gemini Live API
  wss.on("connection", async (ws) => {
    console.log("Client connected to Gemini Live bridge");
    
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in environment variables");
      ws.send(JSON.stringify({ error: "API Key not configured on the server." }));
      ws.close();
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are the expert conversational AI assistant representing A&T Tech Firm (built by Tirtharaj and Aditya). Speak in a helpful, concise, professional tone. Keep responses under 2-3 sentences. Assist the user with custom web design, SaaS development, app building, and automated agency workflows.",
        },
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              ws.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              ws.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            console.log("Gemini session closed on Gemini's end");
            ws.close();
          },
          onerror: (err) => {
            console.error("Gemini live session error:", err);
            ws.send(JSON.stringify({ error: "Gemini Live API error" }));
          }
        },
      });

      ws.on("message", (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (err) {
          console.error("Error sending realtime audio input to Gemini:", err);
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected, closing Gemini session");
        session.close();
      });

    } catch (err) {
      console.error("Failed to establish Gemini Live connection:", err);
      ws.send(JSON.stringify({ error: "Failed to connect to Live API" }));
      ws.close();
    }
  });

  // Handle WebSocket Upgrade
  server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
    if (pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // NextJS routing handler
  expressApp.all(/.*/, (req, res) => {
    return handle(req, res);
  });

  const port = 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`> Full-stack Next.js custom server ready on http://localhost:${port}`);
  });
});
