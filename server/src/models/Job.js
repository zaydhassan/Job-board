const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  company: String,
  location: String,
  datePosted: Date,
  url: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model('Job', jobSchema);