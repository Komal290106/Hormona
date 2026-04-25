const router = require('express').Router();
const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
const { calcStabilityScore, calcPCODRisk, getCyclePhase, calcCycleRegularity } = require('../utils/scoring');

// POST /api/logs — submit daily log
router.post('/', async (req, res) => {
  try {
    const log = new DailyLog(req.body);
    await log.save();
    res.json(log);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// GET /api/logs/:userId — all logs for a user (used by LogDataPage calendar)
router.get('/:userId', async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(90);          // last 3 months is plenty
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/logs/:userId/dashboard — everything the dashboard needs
router.get('/:userId/dashboard', async (req, res) => {
  try {
    const user  = await User.findById(req.params.userId);
    const logs  = await DailyLog.find({ userId: req.params.userId })
                    .sort({ date: -1 }).limit(30);
    const latest = logs[0];

    // Days since last period
    const daysSince = Math.floor(
      (Date.now() - new Date(user.lastPeriodDate)) / (1000 * 60 * 60 * 24)
    );
    const cycleDay = (daysSince % user.avgCycleLength) + 1;
    const daysUntilNext = user.avgCycleLength - cycleDay;
    const nextPeriodDate = new Date(Date.now() + daysUntilNext * 86400000)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const regularity = calcCycleRegularity(logs);
    const score = latest ? calcStabilityScore({
      cycleRegularity: regularity,
      stressLevel: latest.stressLevel,
      sleepHours: latest.sleepHours
    }) : 72;

    const risk = latest ? calcPCODRisk({
      cycleGapDays: user.avgCycleLength,
      stressLevel: latest.stressLevel,
      sleepHours: latest.sleepHours,
      sugarIntake: latest.sugarIntake
    }) : 22;

    // Build trend (last 30 logs reversed for chart)
    const trend = [...logs].reverse().map(l => ({
      date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sleep: l.sleepHours,
      stress: l.stressLevel,
      cycle: user.avgCycleLength
    }));

    res.json({
      score, risk, cycleDay,
      cyclePhase: getCyclePhase(cycleDay, user.avgCycleLength),
      daysUntilNext, nextPeriodDate, trend,
      latest, userName: user.name
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
