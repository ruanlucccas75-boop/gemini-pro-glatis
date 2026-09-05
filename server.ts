import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

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

    // Map client messages into Gemini SDK contents format
    const contents = messages.map((m: any) => {
      const parts: any[] = [];

      // Add attached images/files if present
      if (Array.isArray(m.attachments) && m.attachments.length > 0) {
        for (const att of m.attachments) {
          if (att.data && att.mimeType) {
            // Clean up base64 prefix if present
            const cleanBase64 = att.data.includes(',')
              ? att.data.split(',')[1]
              : att.data;
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: cleanBase64,
              },
            });
          }
        }
      }

      if (m.content) {
        parts.push({ text: m.content });
      }

      return {
        role: m.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

    // Determine model candidate list
    const primaryModel =
      model === 'gemini-3.1-pro-preview'
        ? 'gemini-3.1-pro-preview'
        : 'gemini-3.8-flash';

    const modelsToTry = [primaryModel];
    if (primaryModel !== 'gemini-3.8-flash') {
      modelsToTry.push('gemini-3.8-flash');
    }

    const baseSystemInstruction =
      "Você é o Gemini, uma inteligência artificial extremamente capaz, prestativa, direta e resolutiva.\n" +
      "DIRETRIZES FUNDAMENTAIS:\n" +
      "1. Obediência e Prontidão: Faça e entregue EXATAMENTE o que o usuário pedir, sem reclamar, sem lições de moral, sem rodeios e sem recusas desnecessárias.\n" +
      "2. Entrega Completa de Código: Se o usuário pedir um bot, script, código ou programa (como bot do Discord, automações, APIs, etc.), forneça o código COMPLETO, funcional, pronto para rodar, com todas as instruções necessárias passo a passo de imediato.\n" +
      "3. Sem Falsa Modéstia ou Enrolação: Não pergunte desnecessariamente 'se o usuário quer ver o código' quando ele já estiver solicitando uma solução; entregue a solução pronta diretamente.\n" +
      "4. Tom: Profissional, prestativo, objetivo, inteligente e sempre focado em resolver a tarefa do usuário.";

    const finalInstruction = systemInstruction
      ? `${baseSystemInstruction}\n\n${systemInstruction}`
      : baseSystemInstruction;

    let completed = false;
    let lastError: any = null;

    modelLoop: for (const currentModel of modelsToTry) {
      // Up to 3 attempts with backoff per model
      for (let attempt = 1; attempt <= 3; attempt++) {
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

          // Enable thinking only on gemini-3.8-flash if requested
          if (thinking && currentModel === 'gemini-3.8-flash') {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
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
            `[Gemini Server] Attempt ${attempt}/3 with model '${currentModel}' failed:`,
            err?.message || err
          );

          // If partial response was already streamed to user, we cannot silently restart
          if (chunksSent > 0) {
            break modelLoop;
          }

          // Delay before next attempt: 700ms, 1400ms...
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, attempt * 700));
          }
        }
      }
    }

    // Secondary fallback: synchronous generateContent if streaming experienced an SSE timeout/503
    if (!completed) {
      try {
        console.log('[Gemini Server] Attempting non-streaming fallback...');
        const nonStreamResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: finalInstruction,
            maxOutputTokens: 8192,
          },
        });

        if (nonStreamResponse.text) {
          sendEvent({ text: nonStreamResponse.text });
          sendEvent({ done: true, modelUsed: 'gemini-3.8-flash' });
          res.end();
          completed = true;
        }
      } catch (nonStreamErr: any) {
        console.warn(
          '[Gemini Server] Non-streaming fallback failed:',
          nonStreamErr?.message || nonStreamErr
        );
      }
    }

    if (!completed) {
      const rawMsg = lastError?.message || '';
      let friendlyError =
        'O Gemini está enfrentando uma alta demanda momentânea nos servidores. Por favor, clique em tentar novamente.';

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
  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
