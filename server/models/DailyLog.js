const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  sleepHours: { type: Number, min: 0, max: 12, default: 7 },
  stressLevel: { type: Number, min: 1, max: 10, default: 5 },
  hydration: { type: Number, min: 0, max: 15, default: 6 },
  sugarIntake: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  cycleStatus: { type: String, enum: ['period', 'spotting', 'none'], default: 'none' },
  flow: { type: String, enum: ['light', 'medium', 'heavy', 'none'], default: 'none' },
  mood: { type: String, enum: ['great', 'good', 'okay', 'low', 'bad'], default: 'okay' },
  symptoms: { type: [String], default: [] },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);
