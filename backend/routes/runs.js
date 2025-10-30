const express = require('express');
const router = express.Router();
const Run = require('../models/Run');

// GET all runs
router.get('/', async (req, res) => {
  try {
    const runs = await Run.find();
    res.json(runs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new run
router.post('/', async (req, res) => {
  const { user, date, distance, duration } = req.body;
  const pace = duration / distance;

  const run = new Run({
    user,
    date,
    distance,
    duration,
    pace
  });

  try {
    const newRun = await run.save();
    res.status(201).json(newRun);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
