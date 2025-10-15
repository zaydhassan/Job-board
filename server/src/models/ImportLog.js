const mongoose = require('mongoose');

const importLogSchema = new mongoose.Schema({
  importDate: { type: Date, default: Date.now },
  totalFetched: Number,
  newRecords: Number,
  updatedRecords: Number,
  failedRecords: Number,
  failures: [
    {
      jobId: String,
      reason: String,
    }
  ],
});

module.exports = mongoose.model('ImportLog', importLogSchema);