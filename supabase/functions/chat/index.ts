import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `You are Hormona's PCOD Health Assistant — a knowledgeable, empathetic AI specializing in Polycystic Ovarian Disease (PCOD) and women's hormonal health.

Your role:
- Answer questions about PCOD/PCOS symptoms, causes, diagnosis, and management
- Provide evidence-based information on diet, exercise, lifestyle, and natural remedies for hormonal balance
- Explain cycle phases, hormonal fluctuations, and how they affect daily life
- Offer emotional support and encouragement
- Help users understand their health data and risk scores in context

Rules:
- ONLY answer questions related to PCOD, PCOS, hormonal health, menstrual cycles, fertility, women's health, diet, exercise, stress, sleep, and related topics
- If asked about unrelated topics, politely decline and redirect to hormonal health questions
- Always recommend consulting a healthcare provider for medical decisions
- Be warm, supportive, and non-judgmental
- Keep responses concise (2-4 paragraphs max) and practical
- Never diagnose conditions or prescribe treatments
- Use simple, accessible language`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemWithContext = userContext
      ? `${SYSTEM_PROMPT}\n\nUser context: ${userContext}`
      : SYSTEM_PROMPT;

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body = {
      system_instruction: { parts: [{ text: systemWithContext }] },
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: `Gemini error: ${err}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
