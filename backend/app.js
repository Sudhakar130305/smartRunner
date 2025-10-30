const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(
    'mongodb+srv://smartrunneruser:run123@cluster0.g7xebkf.mongodb.net/smartrunner?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Run Schema
const runSchema = new mongoose.Schema({
    userEmail: String,
    distance: Number,
    time: Number,
    pace: Number,
    date: { type: Date, default: Date.now }
});
const Run = mongoose.model('Run', runSchema);

// Register User
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ msg: 'All fields are required' });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        console.log(`✅ New user registered: ${name} (${email})`);
        res.json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error('❌ Error in register:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Login User
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ msg: 'All fields are required' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ msg: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: 'Invalid email or password' });

        console.log(`✅ User logged in: ${user.name} (${email})`);
        res.json({ msg: 'Login successful', user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error('❌ Error in login:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add Run (with correct number parsing)
app.post('/addRun', async (req, res) => {
    try {
        let { userEmail, distance, time } = req.body;

        distance = parseFloat(distance);
        time = parseFloat(time);

        if (!userEmail || isNaN(distance) || isNaN(time) || distance <= 0 || time <= 0)
            return res.status(400).json({ msg: 'Please enter valid distance and time' });

        const pace = parseFloat((time / distance).toFixed(2));

        const newRun = new Run({ userEmail, distance, time, pace });
        await newRun.save();

        console.log(`🏃 Run added: ${userEmail}, Distance: ${distance} km, Time: ${time} min, Pace: ${pace} min/km`);
        res.json({ msg: 'Run added successfully', pace });
    } catch (err) {
        console.error('❌ Error adding run:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all runs for user
app.get('/getRuns/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const runs = await Run.find({ userEmail: email }).sort({ date: -1 });
        res.json(runs);
    } catch (err) {
        console.error('❌ Error fetching runs:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a run
app.delete('/deleteRun/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRun = await Run.findByIdAndDelete(id);

        if (!deletedRun) return res.status(404).json({ msg: 'Run not found' });

        console.log(`🗑️ Run deleted: ${id}`);
        res.json({ msg: 'Run deleted successfully' });
    } catch (err) {
        console.error('❌ Error deleting run:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get best pace
app.get('/bestPace/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const bestRun = await Run.find({ userEmail: email, pace: { $gt: 0 } }).sort({ pace: 1 }).limit(1);

        if (bestRun.length === 0)
            return res.json({ msg: 'No valid runs yet' });

        const run = bestRun[0];
        res.json({ pace: parseFloat(run.pace.toFixed(2)), date: run.date });
    } catch (err) {
        console.error('❌ Error fetching best pace:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});
const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
