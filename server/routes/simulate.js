const router = require('express').Router();
const { calcPCODRisk } = require('../utils/scoring');

// POST /api/simulate — what-if risk calculation
router.post('/', (req, res) => {
  const { cycleGapDays, stressLevel, sleepHours, sugarIntake } = req.body;
  const risk = calcPCODRisk({ cycleGapDays, stressLevel, sleepHours, sugarIntake });

  let level = 'Low';
  if (risk > 60) level = 'High';
  else if (risk > 35) level = 'Moderate';

  const tips = [];
  if (stressLevel >= 6) tips.push('Try daily mindfulness or deep breathing to lower cortisol');
  if (sleepHours < 6.5) tips.push('Aim for 7–8 hours of sleep to support hormone regulation');
  if (sugarIntake === 'high') tips.push('Reduce refined sugar to improve insulin sensitivity');
  if (cycleGapDays > 35) tips.push('Track your cycle for 3+ months to identify irregularity patterns');
  if (tips.length === 0) tips.push('Great inputs! Keep up these healthy habits.');

  res.json({ risk, level, tips });
});

module.exports = router;
