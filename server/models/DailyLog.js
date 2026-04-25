const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:        { type: Date, default: Date.now },
  sleepHours:  { type: Number, min: 0, max: 12 },
  stressLevel: { type: Number, min: 1, max: 10 },
  hydration:   { type: Number, min: 0, max: 15 },
  sugarIntake: { type: String, enum: ['low', 'medium', 'high'] },
  cycleStatus: { type: String, enum: ['period', 'spotting', 'none'] },
  flow:        { type: String, enum: ['light', 'medium', 'heavy', 'none'] },
  mood:        { type: String, enum: ['great', 'good', 'okay', 'low', 'bad'] },
});

module.exports = mongoose.model('DailyLog', DailyLogSchema);
