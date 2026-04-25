const router = require('express').Router();
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const { calcStabilityScore, calcPCODRisk, getCyclePhase, calcCycleRegularity } = require('../utils/scoring');

// ── POST /api/logs ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const log = new DailyLog(req.body);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET /api/logs/:userId ──────────────────────────────────────────────────
// Returns last 90 days of logs for a user
router.get('/:userId', async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(90);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/logs/:userId/dashboard ───────────────────────────────────────
// Everything the dashboard needs — safe defaults when data is missing
router.get('/:userId/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const logs = await DailyLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(30);

    const latest = logs[0] || null;

    // Safe cycle calculation — handle missing lastPeriodDate
    let cycleDay = 1;
    let daysUntilNext = user.avgCycleLength || 28;
    let nextPeriodDate = 'Not set';

    if (user.lastPeriodDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24)
      );
      const len = user.avgCycleLength || 28;
      cycleDay = (daysSince % len) + 1;
      daysUntilNext = len - cycleDay;
      const nextDate = new Date(Date.now() + daysUntilNext * 86400000);
      nextPeriodDate = nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }

    const regularity = calcCycleRegularity(logs);
    const score = latest
      ? calcStabilityScore({ cycleRegularity: regularity, stressLevel: latest.stressLevel, sleepHours: latest.sleepHours })
      : 0;

    const risk = latest
      ? calcPCODRisk({ cycleGapDays: user.avgCycleLength || 28, stressLevel: latest.stressLevel, sleepHours: latest.sleepHours, sugarIntake: latest.sugarIntake })
      : 0;

    const trend = [...logs].reverse().map(l => ({
      date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sleep: l.sleepHours || 0,
      stress: l.stressLevel || 0,
      cycle: user.avgCycleLength || 28,
    }));

    res.json({
      score,
      risk,
      riskLevel: risk > 60 ? 'High' : risk > 35 ? 'Moderate' : 'Low',
      cycleDay,
      cyclePhase: getCyclePhase(cycleDay, user.avgCycleLength || 28),
      daysUntilNext,
      nextPeriodDate,
      trend,
      userName: user.name,
      hasData: logs.length > 0,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/logs/:userId/insights ────────────────────────────────────────
// Derived analytics for InsightsPage — safe with 0 logs
router.get('/:userId/insights', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const logs = await DailyLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(90);

    if (logs.length === 0) {
      return res.json({
        hasData: false,
        loggedDays: 0,
        healthScore: { score: 0, label: 'No data yet' },
        pcodRisk: { score: 0, label: 'No data yet' },
        cycleRegularity: { score: 0, label: 'No data yet' },
        trendData: [],
        cycleHighlights: { average: user.avgCycleLength || 28, longest: 0, shortest: 0 },
        positivePatterns: [],
        avgSleep: 0,
        avgStress: 0,
        avgHydration: 0,
      });
    }

    // Averages
    const avgSleep = parseFloat((logs.reduce((s, l) => s + (l.sleepHours || 0), 0) / logs.length).toFixed(1));
    const avgStress = parseFloat((logs.reduce((s, l) => s + (l.stressLevel || 0), 0) / logs.length).toFixed(1));
    const avgHydration = parseFloat((logs.reduce((s, l) => s + (l.hydration || 0), 0) / logs.length).toFixed(1));

    // Weekly buckets for chart (last 5 weeks)
    const weekly = {};
    logs.forEach(log => {
      const d = new Date(log.date);
      // Sunday of that week as key
      const sunday = new Date(d);
      sunday.setDate(d.getDate() - d.getDay());
      const key = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!weekly[key]) weekly[key] = { sleep: [], stress: [], energy: [] };
      weekly[key].sleep.push(log.sleepHours || 0);
      weekly[key].stress.push(log.stressLevel || 0);
      const energyMap = { great: 9, good: 7, okay: 5, low: 3, bad: 1 };
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

    // Scores
    const regularity = calcCycleRegularity(logs);
    const latestLog = logs[0];
    const healthScore = calcStabilityScore({ cycleRegularity: regularity, stressLevel: latestLog.stressLevel, sleepHours: latestLog.sleepHours });
    const pcodRisk = calcPCODRisk({ cycleGapDays: user.avgCycleLength || 28, stressLevel: latestLog.stressLevel, sleepHours: latestLog.sleepHours, sugarIntake: latestLog.sugarIntake });

    // Positive patterns
    const patterns = [];
    if (avgSleep >= 7) patterns.push({ title: 'Good Sleep Habits', description: `Averaging ${avgSleep} hrs/night — great for hormonal balance.`, icon: 'moon' });
    if (avgStress <= 5) patterns.push({ title: 'Stress Under Control', description: `Average stress of ${avgStress}/10 supports cycle regularity.`, icon: 'stress' });
    if (avgHydration >= 6) patterns.push({ title: 'Staying Hydrated', description: `${avgHydration} glasses/day on average — keep it up!`, icon: 'droplet' });
    if (patterns.length === 0) patterns.push({ title: 'Keep Going!', description: 'Log more days to reveal your positive health patterns.', icon: 'moon' });

    // Streak calculation
    let streak = 0;
    const logDates = new Set(logs.map(l => new Date(l.date).toDateString()));
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (logDates.has(d.toDateString())) streak++;
      else if (i > 0) break;
    }

    res.json({
      hasData: true,
      loggedDays: logs.length,
      currentStreak: streak,
      healthScore: {
        score: healthScore,
        label: healthScore >= 75 ? 'Great' : healthScore >= 55 ? 'Good' : 'Building',
        trend: '',
      },
      pcodRisk: {
        score: pcodRisk,
        label: pcodRisk < 30 ? 'Low' : pcodRisk < 60 ? 'Moderate' : 'High',
        trend: '',
      },
      cycleRegularity: {
        score: regularity,
        label: user.cycleVariation === 'regular' ? 'Regular' : 'Variable',
        trend: '',
      },
      trendData,
      cycleHighlights: {
        average: user.avgCycleLength || 28,
        longest: (user.avgCycleLength || 28) + 4,
        shortest: (user.avgCycleLength || 28) - 3,
      },
      positivePatterns: patterns,
      avgSleep,
      avgStress,
      avgHydration,
    });
  } catch (err) {
    console.error('Insights error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/logs/:userId/calendar ────────────────────────────────────────
// Returns logs formatted for a calendar view
router.get('/:userId/calendar', async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(90);

    // Key by YYYY-MM-DD for easy calendar lookup
    const byDate = {};
    logs.forEach(l => {
      const key = new Date(l.date).toISOString().split('T')[0];
      byDate[key] = {
        mood: l.mood,
        sleep: l.sleepHours,
        stress: l.stressLevel,
        cycleStatus: l.cycleStatus,
        flow: l.flow,
      };
    });

    res.json({ calendar: byDate, totalLogs: logs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
