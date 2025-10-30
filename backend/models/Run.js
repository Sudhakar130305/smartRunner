const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  user: { type: String, required: true },
  date: { type: Date, default: Date.now },
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  pace: { type: Number },
});


module.exports = mongoose.model('Run', runSchema);
