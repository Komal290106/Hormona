// Weighted hormonal stability score (0–100)
function calcStabilityScore({ cycleRegularity, stressLevel, sleepHours }) {
  const cycleScore  = cycleRegularity * 0.40;
  const stressScore = ((10 - stressLevel) / 10 * 100) * 0.30;
  const sleepScore  = (Math.min(sleepHours, 8) / 8 * 100) * 0.30;
  return Math.round(cycleScore + stressScore + sleepScore);
}

// PCOD risk score (0–100)
function calcPCODRisk({ cycleGapDays, stressLevel, sleepHours, sugarIntake }) {
  let risk = 0;
  if (cycleGapDays > 45)      risk += 35;
  else if (cycleGapDays > 35) risk += 20;
  else if (cycleGapDays > 30) risk += 10;
  if (stressLevel >= 8)       risk += 25;
  else if (stressLevel >= 6)  risk += 15;
  if (sleepHours < 5)         risk += 25;
  else if (sleepHours < 6.5)  risk += 15;
  if (sugarIntake === 'high')  risk += 20;
  else if (sugarIntake === 'medium') risk += 8;
  return Math.min(risk, 100);
}

// Cycle phase from day number
function getCyclePhase(dayOfCycle, cycleLength = 28) {
  const ovulationDay = Math.round(cycleLength * 0.5);
  if (dayOfCycle <= 5)                        return 'Menstrual Phase';
  if (dayOfCycle <= ovulationDay - 2)         return 'Follicular Phase';
  if (dayOfCycle <= ovulationDay + 2)         return 'Ovulation Phase';
  return 'Luteal Phase';
}

// Cycle regularity score from logs array
function calcCycleRegularity(logs) {
  if (logs.length < 3) return 70; // default if not enough data
  const gaps = [];
  for (let i = 1; i < logs.length; i++) {
    const diff = (new Date(logs[i].date) - new Date(logs[i - 1].date)) / (1000 * 60 * 60 * 24);
    gaps.push(diff);
  }
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((a, b) => a + Math.abs(b - avg), 0) / gaps.length;
  return Math.max(0, Math.round(100 - variance * 3));
}

module.exports = { calcStabilityScore, calcPCODRisk, getCyclePhase, calcCycleRegularity };
