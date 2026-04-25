const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ── POST /api/users/signup ────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── POST /api/users/login ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'No account found with that email.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── POST /api/users  (legacy — create user without auth, used by old onboarding) ──
router.post('/', async (req, res) => {
  try {
    const { name, age, avgCycleLength, lastPeriodDate } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    const user = await User.create({ name, age, avgCycleLength, lastPeriodDate });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/:id/onboarding ─────────────────────────────────────────
// Saves all the rich onboarding data collected in the new 5-step form
router.put('/:id/onboarding', async (req, res) => {
  try {
    const allowed = [
      'age', 'ageRange', 'goal',
      'lastPeriodDate', 'avgCycleLength', 'cycleVariation',
      'avgPeriodDuration', 'typicalFlow', 'everDiagnosedPCOD',
      'avgSleepHours', 'sleepQuality', 'avgStressLevel', 'avgWaterIntake',
      'exerciseFrequency', 'dietType', 'sugarIntake',
      'symptoms',
      'recentMoodTrend', 'recentSleepTrend', 'recentStressTrend',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.onboardingComplete = true;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────
// General profile update (from Profile page edit)
router.put('/:id', async (req, res) => {
  try {
    const allowed = [
      'age', 'avgCycleLength', 'avgPeriodDuration',
      'avgSleepHours', 'avgStressLevel', 'avgWaterIntake',
      'exerciseFrequency', 'sugarIntake', 'typicalFlow',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
