const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a compassionate, knowledgeable PCOD (Polycystic Ovarian Disease) health assistant for the Hormona app. You help women understand and manage PCOD through evidence-based information.

You can answer questions about PCOD/PCOS symptoms, menstrual cycle health, hormonal balance, diet and nutrition for PCOD, exercise and lifestyle, sleep and stress, fertility, and medications (informational only).

Always be warm, supportive, and non-judgmental. Give practical advice. Remind users to consult their doctor. Keep responses concise (2-4 short paragraphs max). Refuse unrelated questions and redirect to women's health topics.`;

router.post('/', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const filtered = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));

    while (filtered.length > 0 && filtered[0].role === 'assistant') {
      filtered.shift();
    }

    if (filtered.length === 0) {
      return res.status(400).json({ error: 'No user messages found' });
    }

    if (userContext) {
      filtered[0].content = `[User context: ${userContext}]\n\n${filtered[0].content}`;
    }

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...filtered,
      ],
    });

    const reply = response.choices[0]?.message?.content || null;
    if (!reply) return res.status(502).json({ error: 'No reply' });

    res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;