import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Streaming chat endpoint via SSE
app.post('/api/chat/stream', async (req, res) => {
  // Set headers for SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: Record<string, any>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const {
      messages,
      model = 'gemini-3.8-flash',
      systemInstruction,
      enableSearch = false,
      thinking = false,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      sendEvent({ error: 'Nenhuma mensagem foi fornecida.' });
      return res.end();
    }

    const ai = getGenAI();

    // Map client messages into Gemini SDK contents format, ensuring NO empty parts or consecutive invalid roles
    const validContents: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

    for (const m of messages) {
      if (!m) continue;
      const parts: any[] = [];

      // Add attached images/files if present
      if (Array.isArray(m.attachments) && m.attachments.length > 0) {
        for (const att of m.attachments) {
          if (att && att.data && att.mimeType) {
            const cleanBase64 = att.data.includes(',')
              ? att.data.split(',')[1]
              : att.data;
            if (cleanBase64 && cleanBase64.trim().length > 0) {
              parts.push({
                inlineData: {
                  mimeType: att.mimeType,
                  data: cleanBase64.trim(),
                },
              });
            }
          }
        }
      }

      const text = typeof m.content === 'string' ? m.content.trim() : '';
      if (text.length > 0) {
        parts.push({ text });
      }

      // Only push messages that actually contain at least one part
      if (parts.length > 0) {
        const role: 'user' | 'model' = m.role === 'model' ? 'model' : 'user';
        const prev = validContents[validContents.length - 1];
        if (prev && prev.role === role) {
          prev.parts.push(...parts);
        } else {
          validContents.push({ role, parts });
        }
      }
    }

    // Ensure history starts with 'user'
    while (validContents.length > 0 && validContents[0].role !== 'user') {
      validContents.shift();
    }

    // Ensure history ends with 'user' (the prompt to answer)
    if (validContents.length === 0 || validContents[validContents.length - 1].role !== 'user') {
      const fallbackPrompt = messages[messages.length - 1]?.content || 'Olá';
      validContents.push({
        role: 'user',
        parts: [{ text: String(fallbackPrompt).trim() || 'Olá' }],
      });
    }

    const contents = validContents;

    // Build priority and fallback model pool
    const candidates: string[] = [];
    const isThinkingRequested = thinking === true || model === 'gemini-flash-thinking';

    if (model === 'gemini-3.1-flash-lite') {
      candidates.push('gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash');
    } else if (model === 'gemini-flash-latest') {
      candidates.push('gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash');
    } else if (model === 'gemini-3.1-pro-preview') {
      candidates.push('gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite');
    } else {
      // Default / standard: gemini-3.8-flash or gemini-flash-thinking
      candidates.push('gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite');
    }

    const modelsToTry = Array.from(new Set(candidates));

    const baseSystemInstruction =
      "Você é a Astra (Astra Artificial Intelligence), uma inteligência artificial extremamente avançada, capaz, prestativa, direta e resolutiva.\n" +
      "DIRETRIZES FUNDAMENTAIS:\n" +
      "1. Identidade: Seu nome é Astra. Responda sempre como Astra quando perguntarem sobre sua identidade.\n" +
      "2. Obediência e Prontidão: Faça e entregue EXATAMENTE o que o usuário pedir, sem reclamar, sem lições de moral, sem rodeios e sem recusas desnecessárias.\n" +
      "3. Entrega Completa de Código: Se o usuário pedir um bot, script, código ou programa (como bot do Discord, automações, APIs, etc.), forneça o código COMPLETO, funcional, pronto para rodar, com todas as instruções necessárias passo a passo de imediato.\n" +
      "4. Sem Falsa Modéstia ou Enrolação: Não pergunte desnecessariamente 'se o usuário quer ver o código' quando ele já estiver solicitando uma solução; entregue a solução pronta diretamente.\n" +
      "5. Tom: Profissional, prestativo, objetivo, inteligente e sempre focado em resolver a tarefa do usuário.";

    const finalInstruction = systemInstruction
      ? `${baseSystemInstruction}\n\n${systemInstruction}`
      : baseSystemInstruction;

    const isOverloadedOrUnavailable = (err: any): boolean => {
      const code = err?.status || err?.code || err?.error?.code;
      const msg = typeof err?.message === 'string' ? err.message : JSON.stringify(err || '');
      return (
        code === 503 ||
        code === 429 ||
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('Spikes in demand') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('Resource has been exhausted')
      );
    };

    let completed = false;
    let lastError: any = null;

    modelLoop: for (const currentModel of modelsToTry) {
      // For each model, attempt streaming (with instant fallback if 503/high demand)
      for (let attempt = 1; attempt <= 2; attempt++) {
        let chunksSent = 0;

        try {
          const config: any = {
            systemInstruction: finalInstruction,
            maxOutputTokens: 8192,
          };

          // Enable search if requested
          if (enableSearch) {
            config.tools = [{ googleSearch: {} }];
          }

          // Latency optimization: For Gemini 3 series models, setting thinkingLevel to LOW
          // ensures instantaneous time-to-first-token unless deep thinking is explicitly requested.
          if (currentModel === 'gemini-3.8-flash' || currentModel === 'gemini-3.1-pro-preview') {
            config.thinkingConfig = {
              thinkingLevel: isThinkingRequested ? ThinkingLevel.HIGH : ThinkingLevel.LOW,
            };
          } else if (currentModel === 'gemini-3.1-flash-lite') {
            config.thinkingConfig = {
              thinkingLevel: ThinkingLevel.MINIMAL,
            };
          }

          const streamResponse = await ai.models.generateContentStream({
            model: currentModel,
            contents,
            config,
          });

          const sources: Array<{ title?: string; url?: string }> = [];

          for await (const chunk of streamResponse) {
            const chunkText = chunk.text;
            if (chunkText) {
              sendEvent({ text: chunkText });
              chunksSent++;
            }

            // Check for search grounding metadata
            const candidate = chunk.candidates?.[0];
            const groundingMetadata = candidate?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
              for (const gChunk of groundingMetadata.groundingChunks) {
                if (gChunk.web?.uri) {
                  sources.push({
                    title: gChunk.web.title || gChunk.web.uri,
                    url: gChunk.web.uri,
                  });
                }
              }
            }
          }

          sendEvent({
            done: true,
            sources: sources.length > 0 ? sources : undefined,
            modelUsed: currentModel,
          });
          res.end();
          completed = true;
          break modelLoop;
        } catch (err: any) {
          lastError = err;
          console.warn(
            `[Gemini Server] Model '${currentModel}' (attempt ${attempt}) failed:`,
            err?.message || err
          );

          // If partial response was already streamed to the user, do not silently restart
          if (chunksSent > 0) {
            break modelLoop;
          }

          // If this model is experiencing 503 high demand or 429 rate limit,
          // DO NOT wait through slow retries on the same congested model.
          // Instantly switch to the next fallback model in line!
          if (isOverloadedOrUnavailable(err)) {
            console.log(
              `[Gemini Server] Model '${currentModel}' is under high demand (503/429). Switching immediately to fallback model...`
            );
            break; // Break the retry loop for currentModel, advance to next in modelLoop
          }

          // Brief delay before at most 1 fast retry for unexpected network disconnects
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      }
    }

    // Secondary fallback: synchronous generateContent across fast models
    if (!completed) {
      for (const fallbackModel of ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash']) {
        try {
          console.log(`[Gemini Server] Attempting non-streaming fallback with '${fallbackModel}'...`);
          const nonStreamResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents,
            config: {
              systemInstruction: finalInstruction,
              maxOutputTokens: 8192,
            },
          });

          if (nonStreamResponse.text) {
            sendEvent({ text: nonStreamResponse.text });
            sendEvent({ done: true, modelUsed: fallbackModel });
            res.end();
            completed = true;
            break;
          }
        } catch (nonStreamErr: any) {
          console.warn(
            `[Gemini Server] Non-streaming fallback with '${fallbackModel}' failed:`,
            nonStreamErr?.message || nonStreamErr
          );
        }
      }
    }

    if (!completed) {
      const rawMsg = typeof lastError?.message === 'string' ? lastError.message : JSON.stringify(lastError || '');
      let friendlyError =
        'Os servidores do Gemini estão com alta demanda momentânea. Experimente selecionar o modelo "Gemini Flash Lite" no menu superior ou clique em tentar novamente.';

      if (rawMsg.includes('API_KEY')) {
        friendlyError =
          'Chave de API do Gemini não configurada ou inválida.';
      }

      sendEvent({ error: friendlyError });
      res.end();
    }
  } catch (err: any) {
    console.error('Error in /api/chat/stream:', err);
    sendEvent({
      error:
        'Ocorreu uma oscilação momentânea de conexão. Por favor, clique em tentar novamente.',
    });
    res.end();
  }
});

async function startServer() {
  // In development, mount Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static files from dist
    const candidates = [
      path.join(process.cwd(), 'dist'),
      typeof __dirname !== 'undefined' ? __dirname : '',
      typeof __dirname !== 'undefined' ? path.join(__dirname, '..', 'dist') : '',
    ].filter(Boolean);

    let distPath = path.join(process.cwd(), 'dist');
    for (const p of candidates) {
      if (fs.existsSync(path.join(p, 'index.html'))) {
        distPath = p;
        break;
      }
    }

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemini server running on http://localhost:${PORT}`);
  });
}

startServer();
