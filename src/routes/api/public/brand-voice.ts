import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/brand-voice")({
  server: {
    handlers: {
      GET: async () => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response("TTS not configured", { status: 500 });
        }

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/speech",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input: "Flexi Keys. Growth to a better future.",
              voice: "ash",
              response_format: "mp3",
              instructions:
                "Speak like an epic cinematic movie trailer announcer: deep, powerful, slow, dramatic, with gravitas. Pause briefly between 'Flexi Keys' and 'Growth to a better future'.",
            }),
          }
        );

        if (!upstream.ok) {
          const text = await upstream.text().catch(() => "");
          return new Response(`TTS upstream error: ${text}`, {
            status: upstream.status,
          });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
