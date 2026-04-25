# HORMONA — Predictive Health. Preventing Risk.

> A hormonal health intelligence platform that connects daily lifestyle habits to cycle health and PCOD risk, giving women the tools to understand, prevent, and act — before symptoms become diagnoses.

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

### Demo Mode
A fully functional demo with a pre-seeded user profile ("Anaya") — no sign-up required. Judges can explore every feature immediately.

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
| Charts & Visuals | Custom SVG / canvas, Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Backend | Supabase Edge Functions (Deno / TypeScript) |
| Database | Supabase PostgreSQL |
| Auth | Custom bcrypt hashing via `bcryptjs` |
| Hosting | Supabase (functions + DB), Vite static build |

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
└──────────────┬──────────────────────┘
               │ Axios (Bearer token)
               ▼
┌─────────────────────────────────────┐
│    Supabase Edge Function (/api)    │
│    Deno TypeScript runtime          │
│                                     │
│  POST /users          (register)    │
│  POST /users/login    (auth)        │
│  GET  /users/:id      (profile)     │
│  GET  /logs/:userId   (history)     │
│  POST /logs           (daily log)   │
│  GET  /simulate/:id   (risk data)   │
└──────────────┬──────────────────────┘
               │ Supabase JS client
               ▼
┌─────────────────────────────────────┐
│    PostgreSQL (Supabase)            │
│                                     │
│  users       — profile + baseline   │
│  daily_logs  — per-day entries      │
│                                     │
│  Row Level Security on all tables   │
└─────────────────────────────────────┘
```

**Key design decisions:**
- **Demo-first:** full offline demo mode with a realistic pre-seeded user — zero friction for evaluators
- **Client-side simulation:** risk recalculation runs entirely in the browser for instant feedback without round-trips
- **Graceful degradation:** onboarding and dashboard fall back to localStorage if the API is unavailable
- **RLS everywhere:** every table has Row Level Security enabled; users can only access their own data
- **No generative AI:** all intelligence is algorithmic, transparent, and reproducible — by design

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Run the dev server
npm run dev
```

The Supabase Edge Function is deployed separately via the Supabase MCP toolchain.

---

## Trying the Demo

1. Open the app and click **Try Demo** on the landing page
2. You are immediately logged in as Anaya — a pre-seeded user with 60 days of health history
3. Explore the Dashboard, Insights, and Risk Simulator without creating an account
4. To test with your own data, click **Sign Up** and complete the onboarding wizard

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
