const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // ── Auth ──────────────────────────────────────────────────────────────────
  email:    { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String },          // hashed with bcrypt

  // ── Basic info ────────────────────────────────────────────────────────────
  name:     { type: String, required: true },
  age:      { type: Number },
  ageRange: { type: String },          // 'under18' | '18-24' | '25-34' | '35+'

  // ── Cycle ─────────────────────────────────────────────────────────────────
  lastPeriodDate:    { type: Date },
  avgCycleLength:    { type: Number, default: 28 },
  cycleVariation:    { type: String, default: 'regular' },   // regular | slightly | irregular | very_irregular
  avgPeriodDuration: { type: Number, default: 5 },
  typicalFlow:       { type: String, default: 'medium' },    // light | medium | heavy | varies
  everDiagnosedPCOD: { type: String },                       // yes | no | suspected | unsure

  // ── Habits ────────────────────────────────────────────────────────────────
  avgSleepHours:      { type: Number, default: 7 },
  sleepQuality:       { type: String, default: 'okay' },
  avgStressLevel:     { type: Number, default: 5 },
  avgWaterIntake:     { type: Number, default: 6 },
  exerciseFrequency:  { type: String, default: '2-3' },
  dietType:           { type: String, default: 'balanced' },
  sugarIntake:        { type: String, default: 'medium' },

  // ── Symptoms ──────────────────────────────────────────────────────────────
  symptoms: { type: [String], default: [] },

  // ── Baseline trends ───────────────────────────────────────────────────────
  recentMoodTrend:   { type: String, default: 'okay' },
  recentSleepTrend:  { type: String, default: 'stable' },
  recentStressTrend: { type: String, default: 'stable' },
  goal:              { type: String, default: 'understand' },

  // ── Onboarding flag ───────────────────────────────────────────────────────
  onboardingComplete: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
