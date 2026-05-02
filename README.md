# HORMONA — Predictive Health. Preventing Risk.

> A hormonal health intelligence platform that connects daily lifestyle habits to cycle health and PCOD risk, giving women the tools to understand, prevent, and act — before symptoms become diagnoses.

<img width="528" height="352" alt="Picture1" src="https://github.com/user-attachments/assets/638b2cd4-a9c9-4faa-92e8-855fd1bdb790" />

---

## The Problem

**1 in 5 women has PCOD. 50% go undiagnosed.**

Existing period trackers log dates. They don't explain *why* cycles go irregular, or what daily choices are silently driving hormonal disruption. By the time symptoms surface, the window for easy intervention has often closed.

---

## What Hormona Does

Hormona bridges the gap between daily habits and hormonal health with a three-part engine:

| Pillar | What It Does |
|---|---|
| **Track** | Log sleep, stress, sugar intake, mood, symptoms, and cycle data daily |
| **Understand** | See a real-time Hormonal Health Score and PCOD Risk Score driven by your actual lifestyle |
| **Simulate** | Adjust target habits and watch your risk score update instantly — see the future before it happens |

---

## Core Features

### Onboarding Wizard (5 Steps)
Collects cycle history, lifestyle habits, symptoms, and health goals to establish a personalised baseline on first use.

### Dashboard
- **Hormonal Health Score** (0–100) — weighted composite of cycle regularity, stress, and sleep
- **PCOD Risk Score** — additive risk model with Low / Moderate / High classification
- **Cycle Phase Tracker** — current phase (Menstrual / Follicular / Ovulatory / Luteal), cycle day, and days to next period
- **30-day Trend Chart** — cycle gap, sleep, and stress over time
- **Smart Insights** — contextual tips based on the current cycle phase

### Daily Log
- Period status and flow intensity
- Lifestyle sliders: sleep hours, stress level, hydration
- Sugar intake selector
- Mood picker (5 levels)
- Multi-select symptom tracker (bloating, fatigue, acne, cramps, and more)
- Monthly calendar with streak counter

### Risk Simulator
- Dual current / target sliders for sleep, stress, and sugar intake
- Real-time risk recalculation as sliders move
- Side-by-side comparison: current status vs. simulated outcome
- Cycle regularity, hormonal stability, and energy level projections
- Potential risk reduction percentage with personalised action steps

### Insights
- 4 KPI cards: Health Score, Cycle Regularity, PCOD Risk, Logging Streak
- Weekly trend chart
- Cycle statistics: average, shortest, longest cycle lengths
- Positive pattern detection and personalised recommendations

### Hormona AI
An in-app AI chat assistant powered by Google Gemini. Ask questions about PCOD, symptoms, cycle health, nutrition, and lifestyle — and get compassionate, evidence-based responses contextualised to your own health data.

### Demo Mode
A fully functional demo with a pre-seeded user profile ("Anaya") — no sign-up required. Explore every feature immediately without creating an account.

---

## Risk & Scoring Algorithms

All scoring is research-backed and fully deterministic — no black box.

### Hormonal Health Score (0–100)

```
Score = (Cycle Regularity × 0.40)
      + ((10 - Stress Level) / 10 × 100 × 0.30)
      + (min(Sleep Hours, 8) / 8 × 100 × 0.30)
```

### PCOD Risk Score (additive, capped at 100)

| Factor | Points |
|---|---|
| Cycle gap > 45 days | +35 |
| Cycle gap 35–45 days | +20 |
| Cycle gap 30–35 days | +10 |
| Stress ≥ 8/10 | +25 |
| Stress 6–7/10 | +15 |
| Stress 4–5/10 | +8 |
| Sleep < 5 hrs | +25 |
| Sleep < 6.5 hrs | +15 |
| Sleep < 7.5 hrs | +5 |
| High sugar intake | +20 |
| Medium sugar intake | +8 |

### Cycle Phase Detection

| Days Since Last Period | Phase |
|---|---|
| 1–5 | Menstrual |
| 6 – (ovulation day − 2) | Follicular |
| Around midpoint ±2 days | Ovulatory |
| Remaining days | Luteal |

### Cycle Regularity Index

Computed from historical log gaps. Variance from the expected 28-day cycle is penalised: `Regularity = 100 − (variance × 3)`, minimum 0, default 70 with fewer than 3 data points.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS 4 |
| Routing | React Router DOM 7 |
| Charts & Visuals | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | bcryptjs (password hashing) |
| AI Chat | Google Gemini 1.5 Flash API |
| Hosting | Vercel (frontend), Render (backend) |

---

## Architecture

```
┌─────────────────────────────────────┐
│           React 19 SPA              │
│  (Vite + TailwindCSS + Router)      │
│                                     │
│  LandingPage  →  Onboarding         │
│  Dashboard    →  LogData            │
│  Insights     →  RiskSimulator      │
│  Hormona AI (floating chat)         │
└──────────────┬──────────────────────┘
               │ Axios / fetch
               ▼
┌─────────────────────────────────────┐
│    Express 5 REST API               │
│    Node.js runtime                  │
│                                     │
│  POST /api/users          (register)│
│  POST /api/users/login    (auth)    │
│  GET  /api/users/:id      (profile) │
│  GET  /api/logs/:userId   (history) │
│  POST /api/logs           (log)     │
│  GET  /api/simulate/:id   (risk)    │
│  POST /api/chat           (AI)      │
└──────────────┬──────────────────────┘
               │ Mongoose / Gemini API
               ▼
┌─────────────────────────────────────┐
│    MongoDB Atlas                    │
│                                     │
│  users       — profile + baseline   │
│  daily_logs  — per-day entries      │
└─────────────────────────────────────┘
```

**Key design decisions:**
- **Demo-first:** full offline demo mode with a realistic pre-seeded user — zero friction for evaluators
- **Client-side simulation:** risk recalculation runs entirely in the browser for instant feedback without round-trips
- **Graceful degradation:** onboarding and dashboard fall back to localStorage if the API is unavailable
- **Transparent algorithms:** all scoring is deterministic and documented — no black box AI for health scores
- **Contextual AI:** Hormona AI receives the user's health profile alongside each message for personalised answers

---

## Local Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server && npm install && cd ..

# 3. Configure environment — frontend
# Create .env in project root:
VITE_API_URL=http://localhost:5000/api

# 4. Configure environment — backend
# Create server/.env:
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
CLIENT_URL=http://localhost:5173

# 5. Start the backend
cd server && npm run dev

# 6. Start the frontend (in a separate terminal)
npm run dev
```

---

## Deployment

### Frontend — Vercel
Set environment variable:
- `VITE_API_URL` = your Render backend URL (e.g. `https://hormona-api.onrender.com/api`)

### Backend — Render
Set environment variables:
- `MONGO_URI` = MongoDB Atlas connection string
- `GEMINI_API_KEY` = Google Gemini API key
- `CLIENT_URL` = your Vercel frontend URL
- `PORT` = 5000 (or leave unset; Render sets this automatically)

Set the start command to: `node index.js` from the `server/` directory.

---

## Trying the Demo

1. Open the app and click **Try Demo** on the landing page
2. You are immediately logged in as Anaya — a pre-seeded user with 60 days of health history
3. Explore the Dashboard, Insights, and Risk Simulator without creating an account
4. Chat with **Hormona AI** for personalised PCOD guidance
5. To test with your own data, click **Sign Up** and complete the onboarding wizard

---

## Impact & Vision

Hormona is not just a tracker — it is a preventive health companion.

- **Early detection:** surface PCOD risk signals months before clinical diagnosis
- **Behaviour change:** show users the direct, quantified effect of one more hour of sleep or one less sugary drink
- **Accessibility:** no wearable, no doctor visit, no cost — just consistent daily logging
- **Scalability:** the scoring model can be refined with aggregated (anonymised) data to improve population-level accuracy over time

The long-term vision is to integrate with clinical workflows so that Hormona-generated risk reports can inform GP conversations — turning self-tracked data into medically relevant signals.

---

## Team

**CodeNova** — Built at Elite Her Hackathon 2026
