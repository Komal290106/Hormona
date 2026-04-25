import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message, message }, status);
}

// ── Scoring utilities ──────────────────────────────────────────────────────
function calcStabilityScore({
  cycleRegularity,
  stressLevel,
  sleepHours,
}: {
  cycleRegularity: number;
  stressLevel: number;
  sleepHours: number;
}) {
  const cycleScore = cycleRegularity * 0.4;
  const stressScore = ((10 - stressLevel) / 10) * 100 * 0.3;
  const sleepScore = (Math.min(sleepHours, 8) / 8) * 100 * 0.3;
  return Math.round(cycleScore + stressScore + sleepScore);
}

function calcPCODRisk({
  cycleGapDays,
  stressLevel,
  sleepHours,
  sugarIntake,
}: {
  cycleGapDays: number;
  stressLevel: number;
  sleepHours: number;
  sugarIntake: string;
}) {
  let risk = 0;
  if (cycleGapDays > 45) risk += 35;
  else if (cycleGapDays > 35) risk += 20;
  else if (cycleGapDays > 30) risk += 10;
  if (stressLevel >= 8) risk += 25;
  else if (stressLevel >= 6) risk += 15;
  if (sleepHours < 5) risk += 25;
  else if (sleepHours < 6.5) risk += 15;
  if (sugarIntake === "high") risk += 20;
  else if (sugarIntake === "medium") risk += 8;
  return Math.min(risk, 100);
}

function getCyclePhase(dayOfCycle: number, cycleLength = 28) {
  const ovulationDay = Math.round(cycleLength * 0.5);
  if (dayOfCycle <= 5) return "Menstrual Phase";
  if (dayOfCycle <= ovulationDay - 2) return "Follicular Phase";
  if (dayOfCycle <= ovulationDay + 2) return "Ovulation Phase";
  return "Luteal Phase";
}

function calcCycleRegularity(logs: { date: string }[]) {
  if (logs.length < 3) return 70;
  const gaps: number[] = [];
  for (let i = 1; i < logs.length; i++) {
    const diff =
      (new Date(logs[i].date).getTime() - new Date(logs[i - 1].date).getTime()) /
      (1000 * 60 * 60 * 24);
    gaps.push(diff);
  }
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((a, b) => a + Math.abs(b - avg), 0) / gaps.length;
  return Math.max(0, Math.round(100 - variance * 3));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/api", "").replace(/\/$/, "");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // ── GET /api/setup — one-time demo user password fix ──────────────────
    if (path === "/setup" && req.method === "GET") {
      const { data: anaya } = await supabase
        .from("users")
        .select("id, password")
        .eq("email", "anaya@hormona.app")
        .maybeSingle();
      if (!anaya) {
        return errorResponse("Demo user not found.", 404);
      }
      // If password starts with $2a$10$dummy, it needs to be re-hashed
      if (anaya.password.startsWith("$2a$10$dummy")) {
        const hashed = await bcrypt.hash("hormona123", 10);
        await supabase
          .from("users")
          .update({ password: hashed })
          .eq("id", anaya.id);
        return jsonResponse({ message: "Demo password set successfully. You can now log in as anaya@hormona.app / hormona123" });
      }
      return jsonResponse({ message: "Demo user already has a proper password." });
    }

    // ── POST /api/users/signup ────────────────────────────────────────────
    if (path === "/users/signup" && req.method === "POST") {
      const body = await req.json();
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return errorResponse("Name, email and password are required.");
      }
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (existing) {
        return errorResponse("An account with this email already exists.", 409);
      }
      const hashed = await bcrypt.hash(password, 10);
      const { data: user, error: insertErr } = await supabase
        .from("users")
        .insert({ name, email, password: hashed })
        .select("id, name, email, onboarding_complete")
        .single();
      if (insertErr) return errorResponse(insertErr.message, 500);
      return jsonResponse({
        _id: user.id,
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboarding_complete,
      }, 201);
    }

    // ── POST /api/users/login ─────────────────────────────────────────────
    if (path === "/users/login" && req.method === "POST") {
      const body = await req.json();
      const { email, password } = body;
      if (!email || !password) {
        return errorResponse("Email and password are required.");
      }
      const { data: user } = await supabase
        .from("users")
        .select("id, name, email, password, onboarding_complete")
        .eq("email", email)
        .maybeSingle();
      if (!user) {
        return errorResponse("No account found with that email.", 401);
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return errorResponse("Incorrect password. Please try again.", 401);
      }
      return jsonResponse({
        _id: user.id,
        name: user.name,
        email: user.email,
        onboardingComplete: user.onboarding_complete,
      });
    }

    // ── GET /api/users/demo ───────────────────────────────────────────────
    if (path === "/users/demo" && req.method === "GET") {
      const { data: anaya } = await supabase
        .from("users")
        .select("id, name, email, age, age_range, last_period_date, avg_cycle_length, cycle_variation, avg_period_duration, typical_flow, ever_diagnosed_pcod, avg_sleep_hours, sleep_quality, avg_stress_level, avg_water_intake, exercise_frequency, diet_type, sugar_intake, symptoms, recent_mood_trend, recent_sleep_trend, recent_stress_trend, goal, onboarding_complete, created_at")
        .eq("email", "anaya@hormona.app")
        .maybeSingle();
      if (!anaya) {
        return errorResponse("Demo user not found. Seed the database first.", 404);
      }
      return jsonResponse({
        _id: anaya.id,
        name: anaya.name,
        email: anaya.email,
        age: anaya.age,
        ageRange: anaya.age_range,
        lastPeriodDate: anaya.last_period_date,
        avgCycleLength: anaya.avg_cycle_length,
        cycleVariation: anaya.cycle_variation,
        avgPeriodDuration: anaya.avg_period_duration,
        typicalFlow: anaya.typical_flow,
        everDiagnosedPCOD: anaya.ever_diagnosed_pcod,
        avgSleepHours: anaya.avg_sleep_hours,
        sleepQuality: anaya.sleep_quality,
        avgStressLevel: anaya.avg_stress_level,
        avgWaterIntake: anaya.avg_water_intake,
        exerciseFrequency: anaya.exercise_frequency,
        dietType: anaya.diet_type,
        sugarIntake: anaya.sugar_intake,
        symptoms: anaya.symptoms,
        recentMoodTrend: anaya.recent_mood_trend,
        recentSleepTrend: anaya.recent_sleep_trend,
        recentStressTrend: anaya.recent_stress_trend,
        goal: anaya.goal,
        onboardingComplete: anaya.onboarding_complete,
        createdAt: anaya.created_at,
      });
    }

    // ── GET /api/users/:id ────────────────────────────────────────────────
    const userMatch = path.match(/^\/users\/([0-9a-f-]+)$/);
    if (userMatch && req.method === "GET") {
      const userId = userMatch[1];
      const { data: user } = await supabase
        .from("users")
        .select("id, name, email, age, age_range, last_period_date, avg_cycle_length, cycle_variation, avg_period_duration, typical_flow, ever_diagnosed_pcod, avg_sleep_hours, sleep_quality, avg_stress_level, avg_water_intake, exercise_frequency, diet_type, sugar_intake, symptoms, recent_mood_trend, recent_sleep_trend, recent_stress_trend, goal, onboarding_complete, created_at")
        .eq("id", userId)
        .maybeSingle();
      if (!user) return errorResponse("User not found.", 404);
      return jsonResponse({
        _id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        ageRange: user.age_range,
        lastPeriodDate: user.last_period_date,
        avgCycleLength: user.avg_cycle_length,
        cycleVariation: user.cycle_variation,
        avgPeriodDuration: user.avg_period_duration,
        typicalFlow: user.typical_flow,
        everDiagnosedPCOD: user.ever_diagnosed_pcod,
        avgSleepHours: Number(user.avg_sleep_hours),
        sleepQuality: user.sleep_quality,
        avgStressLevel: user.avg_stress_level,
        avgWaterIntake: user.avg_water_intake,
        exerciseFrequency: user.exercise_frequency,
        dietType: user.diet_type,
        sugarIntake: user.sugar_intake,
        symptoms: user.symptoms,
        recentMoodTrend: user.recent_mood_trend,
        recentSleepTrend: user.recent_sleep_trend,
        recentStressTrend: user.recent_stress_trend,
        goal: user.goal,
        onboardingComplete: user.onboarding_complete,
        createdAt: user.created_at,
      });
    }

    // ── PUT /api/users/:id/onboarding ─────────────────────────────────────
    const onboardingMatch = path.match(/^\/users\/([0-9a-f-]+)\/onboarding$/);
    if (onboardingMatch && req.method === "PUT") {
      const userId = onboardingMatch[1];
      const body = await req.json();
      // Map camelCase frontend keys to snake_case DB columns
      const camelToSnake: Record<string, string> = {
        age: "age", ageRange: "age_range", goal: "goal",
        lastPeriodDate: "last_period_date", avgCycleLength: "avg_cycle_length",
        cycleVariation: "cycle_variation", avgPeriodDuration: "avg_period_duration",
        typicalFlow: "typical_flow", everDiagnosedPCOD: "ever_diagnosed_pcod",
        avgSleepHours: "avg_sleep_hours", sleepQuality: "sleep_quality",
        avgStressLevel: "avg_stress_level", avgWaterIntake: "avg_water_intake",
        exerciseFrequency: "exercise_frequency", dietType: "diet_type",
        sugarIntake: "sugar_intake", symptoms: "symptoms",
        recentMoodTrend: "recent_mood_trend", recentSleepTrend: "recent_sleep_trend",
        recentStressTrend: "recent_stress_trend",
        // Also accept snake_case directly
        age_range: "age_range", last_period_date: "last_period_date",
        avg_cycle_length: "avg_cycle_length", cycle_variation: "cycle_variation",
        avg_period_duration: "avg_period_duration", typical_flow: "typical_flow",
        ever_diagnosed_pcod: "ever_diagnosed_pcod", avg_sleep_hours: "avg_sleep_hours",
        sleep_quality: "sleep_quality", avg_stress_level: "avg_stress_level",
        avg_water_intake: "avg_water_intake", exercise_frequency: "exercise_frequency",
        diet_type: "diet_type", sugar_intake: "sugar_intake",
        recent_mood_trend: "recent_mood_trend", recent_sleep_trend: "recent_sleep_trend",
        recent_stress_trend: "recent_stress_trend",
      };
      const updates: Record<string, unknown> = {};
      Object.entries(body).forEach(([key, value]) => {
        const dbKey = camelToSnake[key];
        if (dbKey && value !== undefined) updates[dbKey] = value;
      });
      updates.onboarding_complete = true;

      const { data: user, error: updateErr } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
      if (updateErr) return errorResponse(updateErr.message, 500);
      if (!user) return errorResponse("User not found.", 404);
      return jsonResponse(user);
    }

    // ── PUT /api/users/:id (general profile update) ──────────────────────
    if (userMatch && req.method === "PUT") {
      const userId = userMatch[1];
      const body = await req.json();
      const camelToSnake: Record<string, string> = {
        age: "age", avgCycleLength: "avg_cycle_length",
        avgPeriodDuration: "avg_period_duration",
        avgSleepHours: "avg_sleep_hours", avgStressLevel: "avg_stress_level",
        avgWaterIntake: "avg_water_intake", exerciseFrequency: "exercise_frequency",
        sugarIntake: "sugar_intake", typicalFlow: "typical_flow",
        // Also accept snake_case directly
        avg_cycle_length: "avg_cycle_length", avg_period_duration: "avg_period_duration",
        avg_sleep_hours: "avg_sleep_hours", avg_stress_level: "avg_stress_level",
        avg_water_intake: "avg_water_intake", exercise_frequency: "exercise_frequency",
      };
      const updates: Record<string, unknown> = {};
      Object.entries(body).forEach(([key, value]) => {
        const dbKey = camelToSnake[key];
        if (dbKey && value !== undefined) updates[dbKey] = value;
      });
      const { data: user, error: updateErr } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
      if (updateErr) return errorResponse(updateErr.message, 500);
      if (!user) return errorResponse("User not found.", 404);
      return jsonResponse(user);
    }

    // ── POST /api/logs ────────────────────────────────────────────────────
    if (path === "/logs" && req.method === "POST") {
      const body = await req.json();
      const insertData: Record<string, unknown> = {
        user_id: body.userId,
        sleep_hours: body.sleepHours ?? 7,
        stress_level: body.stressLevel ?? 5,
        hydration: body.hydration ?? 6,
        sugar_intake: body.sugarIntake || "medium",
        cycle_status: body.cycleStatus || "none",
        flow: body.flow || "none",
        mood: body.mood || "okay",
        symptoms: body.symptoms || [],
        notes: body.notes || "",
      };
      if (body.date) insertData.date = body.date;
      const { data: log, error: insertErr } = await supabase
        .from("daily_logs")
        .insert(insertData)
        .select()
        .single();
      if (insertErr) return errorResponse(insertErr.message, 400);
      const l = log as Record<string, unknown>;
      return jsonResponse({
        _id: l.id, userId: l.user_id, date: l.date,
        sleepHours: Number(l.sleep_hours), stressLevel: l.stress_level,
        hydration: l.hydration, sugarIntake: l.sugar_intake,
        cycleStatus: l.cycle_status, flow: l.flow, mood: l.mood,
        symptoms: l.symptoms, notes: l.notes, createdAt: l.created_at,
      }, 201);
    }

    // ── GET /api/logs/:userId ─────────────────────────────────────────────
    const logsMatch = path.match(/^\/logs\/([0-9a-f-]+)$/);
    if (logsMatch && req.method === "GET") {
      const userId = logsMatch[1];
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(90);
      // Transform snake_case to camelCase for frontend compatibility
      const transformed = (logs || []).map((l: Record<string, unknown>) => ({
        _id: l.id,
        userId: l.user_id,
        date: l.date,
        sleepHours: Number(l.sleep_hours),
        stressLevel: l.stress_level,
        hydration: l.hydration,
        sugarIntake: l.sugar_intake,
        cycleStatus: l.cycle_status,
        flow: l.flow,
        mood: l.mood,
        symptoms: l.symptoms,
        notes: l.notes,
        createdAt: l.created_at,
      }));
      return jsonResponse(transformed);
    }

    // ── GET /api/logs/:userId/dashboard ───────────────────────────────────
    const dashboardMatch = path.match(/^\/logs\/([0-9a-f-]+)\/dashboard$/);
    if (dashboardMatch && req.method === "GET") {
      const userId = dashboardMatch[1];
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!user) return errorResponse("User not found.", 404);

      const { data: logs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30);

      const latest = logs?.[0] || null;
      const hasData = logs && logs.length > 0;

      let cycleDay = 1;
      let daysUntilNext = user.avg_cycle_length || 28;
      let nextPeriodDate = "Not set";

      if (user.last_period_date) {
        const daysSince = Math.floor(
          (Date.now() - new Date(user.last_period_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const len = user.avg_cycle_length || 28;
        cycleDay = (daysSince % len) + 1;
        daysUntilNext = len - cycleDay;
        const nextDate = new Date(Date.now() + daysUntilNext * 86400000);
        nextPeriodDate = nextDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
      }

      const regularity = calcCycleRegularity(logs || []);
      const score = latest
        ? calcStabilityScore({
            cycleRegularity: regularity,
            stressLevel: latest.stress_level,
            sleepHours: Number(latest.sleep_hours),
          })
        : 0;

      const risk = latest
        ? calcPCODRisk({
            cycleGapDays: user.avg_cycle_length || 28,
            stressLevel: latest.stress_level,
            sleepHours: Number(latest.sleep_hours),
            sugarIntake: latest.sugar_intake,
          })
        : 0;

      const trend = [...(logs || [])].reverse().map((l) => ({
        date: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sleep: Number(l.sleep_hours) || 0,
        stress: l.stress_level || 0,
        cycle: user.avg_cycle_length || 28,
      }));

      return jsonResponse({
        score,
        risk,
        riskLevel: risk > 60 ? "High" : risk > 35 ? "Moderate" : "Low",
        cycleDay,
        cyclePhase: getCyclePhase(cycleDay, user.avg_cycle_length || 28),
        daysUntilNext,
        nextPeriodDate,
        trend,
        userName: user.name,
        hasData,
      });
    }

    // ── GET /api/logs/:userId/insights ────────────────────────────────────
    const insightsMatch = path.match(/^\/logs\/([0-9a-f-]+)\/insights$/);
    if (insightsMatch && req.method === "GET") {
      const userId = insightsMatch[1];
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (!user) return errorResponse("User not found.", 404);

      const { data: logs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(90);

      if (!logs || logs.length === 0) {
        return jsonResponse({
          hasData: false,
          loggedDays: 0,
          healthScore: { score: 0, label: "No data yet" },
          pcodRisk: { score: 0, label: "No data yet" },
          cycleRegularity: { score: 0, label: "No data yet" },
          trendData: [],
          cycleHighlights: { average: user.avg_cycle_length || 28, longest: 0, shortest: 0 },
          positivePatterns: [],
          avgSleep: 0,
          avgStress: 0,
          avgHydration: 0,
        });
      }

      const avgSleep = parseFloat(
        (logs.reduce((s, l) => s + (Number(l.sleep_hours) || 0), 0) / logs.length).toFixed(1)
      );
      const avgStress = parseFloat(
        (logs.reduce((s, l) => s + (l.stress_level || 0), 0) / logs.length).toFixed(1)
      );
      const avgHydration = parseFloat(
        (logs.reduce((s, l) => s + (l.hydration || 0), 0) / logs.length).toFixed(1)
      );

      // Weekly buckets
      const weekly: Record<string, { sleep: number[]; stress: number[]; energy: number[] }> = {};
      logs.forEach((log) => {
        const d = new Date(log.date);
        const sunday = new Date(d);
        sunday.setDate(d.getDate() - d.getDay());
        const key = sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!weekly[key]) weekly[key] = { sleep: [], stress: [], energy: [] };
        weekly[key].sleep.push(Number(log.sleep_hours) || 0);
        weekly[key].stress.push(log.stress_level || 0);
        const energyMap: Record<string, number> = { great: 9, good: 7, okay: 5, low: 3, bad: 1 };
        weekly[key].energy.push(energyMap[log.mood] || 5);
      });

      const trendData = Object.entries(weekly)
        .slice(-5)
        .map(([week, vals]) => ({
          week,
          sleep: parseFloat((vals.sleep.reduce((a, b) => a + b, 0) / vals.sleep.length).toFixed(1)),
          stress: parseFloat((vals.stress.reduce((a, b) => a + b, 0) / vals.stress.length).toFixed(1)),
          energy: parseFloat((vals.energy.reduce((a, b) => a + b, 0) / vals.energy.length).toFixed(1)),
        }));

      const regularity = calcCycleRegularity(logs);
      const latestLog = logs[0];
      const healthScore = calcStabilityScore({
        cycleRegularity: regularity,
        stressLevel: latestLog.stress_level,
        sleepHours: Number(latestLog.sleep_hours),
      });
      const pcodRisk = calcPCODRisk({
        cycleGapDays: user.avg_cycle_length || 28,
        stressLevel: latestLog.stress_level,
        sleepHours: Number(latestLog.sleep_hours),
        sugarIntake: latestLog.sugar_intake,
      });

      const patterns: { title: string; description: string; icon: string }[] = [];
      if (avgSleep >= 7) patterns.push({ title: "Good Sleep Habits", description: `Averaging ${avgSleep} hrs/night — great for hormonal balance.`, icon: "moon" });
      if (avgStress <= 5) patterns.push({ title: "Stress Under Control", description: `Average stress of ${avgStress}/10 supports cycle regularity.`, icon: "stress" });
      if (avgHydration >= 6) patterns.push({ title: "Staying Hydrated", description: `${avgHydration} glasses/day on average — keep it up!`, icon: "droplet" });
      if (patterns.length === 0) patterns.push({ title: "Keep Going!", description: "Log more days to reveal your positive health patterns.", icon: "moon" });

      // Streak
      let streak = 0;
      const logDates = new Set(logs.map((l) => new Date(l.date).toDateString()));
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (logDates.has(d.toDateString())) streak++;
        else if (i > 0) break;
      }

      return jsonResponse({
        hasData: true,
        loggedDays: logs.length,
        currentStreak: streak,
        healthScore: {
          score: healthScore,
          label: healthScore >= 75 ? "Great" : healthScore >= 55 ? "Good" : "Building",
          trend: "",
        },
        pcodRisk: {
          score: pcodRisk,
          label: pcodRisk < 30 ? "Low" : pcodRisk < 60 ? "Moderate" : "High",
          trend: "",
        },
        cycleRegularity: {
          score: regularity,
          label: user.cycle_variation === "regular" ? "Regular" : "Variable",
          trend: "",
        },
        trendData,
        cycleHighlights: {
          average: user.avg_cycle_length || 28,
          longest: (user.avg_cycle_length || 28) + 4,
          shortest: (user.avg_cycle_length || 28) - 3,
        },
        positivePatterns: patterns,
        avgSleep,
        avgStress,
        avgHydration,
      });
    }

    // ── GET /api/logs/:userId/calendar ────────────────────────────────────
    const calendarMatch = path.match(/^\/logs\/([0-9a-f-]+)\/calendar$/);
    if (calendarMatch && req.method === "GET") {
      const userId = calendarMatch[1];
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(90);

      const byDate: Record<string, { mood: string; sleep: number; stress: number; cycleStatus: string; flow: string }> = {};
      (logs || []).forEach((l) => {
        const key = new Date(l.date).toISOString().split("T")[0];
        byDate[key] = {
          mood: l.mood,
          sleep: Number(l.sleep_hours),
          stress: l.stress_level,
          cycleStatus: l.cycle_status,
          flow: l.flow,
        };
      });
      return jsonResponse({ calendar: byDate, totalLogs: logs?.length || 0 });
    }

    // ── POST /api/simulate ────────────────────────────────────────────────
    if (path === "/simulate" && req.method === "POST") {
      const body = await req.json();
      const { cycleGapDays, stressLevel, sleepHours, sugarIntake } = body;
      const risk = calcPCODRisk({ cycleGapDays, stressLevel, sleepHours, sugarIntake });

      let level = "Low";
      if (risk > 60) level = "High";
      else if (risk > 35) level = "Moderate";

      const tips: string[] = [];
      if (stressLevel >= 6) tips.push("Try daily mindfulness or deep breathing to lower cortisol");
      if (sleepHours < 6.5) tips.push("Aim for 7-8 hours of sleep to support hormone regulation");
      if (sugarIntake === "high") tips.push("Reduce refined sugar to improve insulin sensitivity");
      if (cycleGapDays > 35) tips.push("Track your cycle for 3+ months to identify irregularity patterns");
      if (tips.length === 0) tips.push("Great inputs! Keep up these healthy habits.");

      return jsonResponse({ risk, level, tips });
    }

    // ── Health check ──────────────────────────────────────────────────────
    if (path === "/health") {
      return jsonResponse({ status: "ok" });
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    console.error("API error:", err);
    return errorResponse("Internal server error", 500);
  }
});
