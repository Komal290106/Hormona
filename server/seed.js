require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use real models
const User = require('./models/User');
const DailyLog = require('./models/DailyLog');

async function seedAnaya() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('❌ MONGO_URI not found in .env file');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Wipe existing Anaya + her logs
    const existing = await User.findOne({ email: 'anaya@hormona.app' });
    if (existing) {
        await DailyLog.deleteMany({ userId: existing._id });
        await User.deleteOne({ _id: existing._id });
        console.log('🗑️  Removed previous Anaya data');
    }

    // Create Anaya with full onboarding profile
    const hashed = await bcrypt.hash('hormona123', 10);
    const anaya = await User.create({
        name: 'Anaya',
        email: 'anaya@hormona.app',
        password: hashed,
        age: 22,
        ageRange: '18-24',
        goal: 'manage_pcod',
        lastPeriodDate: new Date(Date.now() - 6 * 86400000),
        avgCycleLength: 32,
        cycleVariation: 'irregular',
        avgPeriodDuration: 5,
        typicalFlow: 'medium',
        everDiagnosedPCOD: 'suspected',
        avgSleepHours: 7,
        sleepQuality: 'okay',
        avgStressLevel: 6,
        avgWaterIntake: 6,
        exerciseFrequency: '2-3',
        sugarIntake: 'medium',
        symptoms: ['irregularPeriods', 'acne', 'fatigue'],
        recentMoodTrend: 'okay',
        recentSleepTrend: 'stable',
        recentStressTrend: 'stable',
        onboardingComplete: true,
    });

    console.log('\n🎉 ANAYA CREATED');
    console.log('=========================================');
    console.log('USER ID  :', anaya._id.toString());
    console.log('Email    : anaya@hormona.app');
    console.log('Password : hormona123');
    console.log('=========================================\n');

    // 14 days of realistic logs — bad start, clear improvement arc
    const logData = [
        { daysAgo: 13, sleep: 5.0, stress: 8, water: 4, sugar: 'high', cycle: 'none', flow: 'none', mood: 'low', symptoms: ['fatigue', 'acne'] },
        { daysAgo: 12, sleep: 5.5, stress: 9, water: 3, sugar: 'high', cycle: 'none', flow: 'none', mood: 'bad', symptoms: ['fatigue', 'moodSwings'] },
        { daysAgo: 11, sleep: 4.5, stress: 8, water: 4, sugar: 'high', cycle: 'none', flow: 'none', mood: 'low', symptoms: ['acne'] },
        { daysAgo: 10, sleep: 6.0, stress: 7, water: 5, sugar: 'medium', cycle: 'none', flow: 'none', mood: 'okay', symptoms: ['bloating'] },
        { daysAgo: 9, sleep: 5.0, stress: 9, water: 3, sugar: 'high', cycle: 'none', flow: 'none', mood: 'bad', symptoms: ['fatigue', 'cramps'] },
        { daysAgo: 8, sleep: 6.5, stress: 6, water: 6, sugar: 'medium', cycle: 'period', flow: 'heavy', mood: 'low', symptoms: ['cramps'] },
        { daysAgo: 7, sleep: 7.0, stress: 5, water: 6, sugar: 'medium', cycle: 'period', flow: 'medium', mood: 'okay', symptoms: [] },
        { daysAgo: 6, sleep: 7.0, stress: 5, water: 7, sugar: 'medium', cycle: 'period', flow: 'medium', mood: 'okay', symptoms: [] },
        { daysAgo: 5, sleep: 7.5, stress: 4, water: 7, sugar: 'low', cycle: 'period', flow: 'light', mood: 'good', symptoms: [] },
        { daysAgo: 4, sleep: 7.5, stress: 4, water: 8, sugar: 'low', cycle: 'spotting', flow: 'light', mood: 'good', symptoms: [] },
        { daysAgo: 3, sleep: 8.0, stress: 3, water: 8, sugar: 'low', cycle: 'none', flow: 'none', mood: 'good', symptoms: [] },
        { daysAgo: 2, sleep: 7.5, stress: 4, water: 9, sugar: 'low', cycle: 'none', flow: 'none', mood: 'great', symptoms: [] },
        { daysAgo: 1, sleep: 8.0, stress: 3, water: 8, sugar: 'low', cycle: 'none', flow: 'none', mood: 'great', symptoms: [] },
        { daysAgo: 0, sleep: 7.5, stress: 4, water: 7, sugar: 'low', cycle: 'none', flow: 'none', mood: 'good', symptoms: [] },
    ];

    const logs = logData.map(d => ({
        userId: anaya._id,
        date: new Date(Date.now() - d.daysAgo * 86400000),
        sleepHours: d.sleep,
        stressLevel: d.stress,
        hydration: d.water,
        sugarIntake: d.sugar,
        cycleStatus: d.cycle,
        flow: d.flow,
        mood: d.mood,
        symptoms: d.symptoms,
        notes: '',
    }));

    await DailyLog.insertMany(logs);
    console.log(`✅ Created ${logs.length} daily logs for Anaya`);
    console.log('\n🚀 Done! Run: npm run dev\n');

    await mongoose.disconnect();
}

seedAnaya().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
