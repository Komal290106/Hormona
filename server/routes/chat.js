const express = require('express');
const router = express.Router();

const SYSTEM_PROMPT = `You are a compassionate, knowledgeable PCOD (Polycystic Ovarian Disease) health assistant for the Hormona app. You help women understand and manage PCOD through evidence-based information.

You can answer questions about:
- PCOD/PCOS symptoms, diagnosis, and management
- Menstrual cycle health and tracking
- Hormonal balance and endocrine health
- Diet and nutrition for PCOD
- Exercise and lifestyle recommendations
- Sleep, stress, and mental health in relation to hormones
- Fertility and reproductive health
- Medications commonly used for PCOD (informational only)

Always:
- Be warm, supportive, and non-judgmental
- Give practical, actionable advice
- Remind users to consult their doctor for diagnosis or treatment decisions
- Keep responses concise (2-4 short paragraphs max)

Refuse to answer questions unrelated to women's health, hormones, or the topics above. For unrelated questions, politely redirect to PCOD/hormonal health topics.`;

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Build Gemini contents array from conversation history
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Prepend user context to the first user message if available
    if (userContext && contents.length > 0) {
      const firstUser = contents.find(c => c.role === 'user');
      if (firstUser) {
        firstUser.parts[0].text = `[User context: ${userContext}]\n\n${firstUser.parts[0].text}`;
      }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini error:', data);
      return res.status(502).json({ error: 'Gemini API error', details: data });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(502).json({ error: 'No reply from Gemini' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
