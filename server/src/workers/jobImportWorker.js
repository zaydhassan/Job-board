const { Worker } = require('bullmq');
const Job = require('../models/Job');
const ImportLog = require('../models/ImportLog');
const { connection, io } = require('../app');

let newRecords = 0;
let updatedRecords = 0;
let failedRecords = 0;
const failures = [];

const worker = new Worker('job-import-queue', async (job) => {
  try {
    const jobData = job.data;
    const existing = await Job.findOne({ jobId: jobData.jobId });
    if (existing) {
      existing.title = jobData.title;
      existing.description = jobData.description;
      existing.company = jobData.company;
      existing.location = jobData.location;
      existing.datePosted = jobData.datePosted;
      existing.url = jobData.url;
      existing.updatedAt = new Date();
      await existing.save();
      updatedRecords++;
    } else {
      const newJob = new Job(jobData);
      await newJob.save();
      newRecords++;
    }
    io.emit('jobProgress', { jobId: job.data.jobId, status: 'processed' });
  } catch (error) {
    failedRecords++;
    failures.push({ jobId: job.data.jobId, reason: error.message });
    throw error;
  }
}, {
  connection,
  settings: {
    backoffStrategies: {
      exponential: (attemptsMade) => Math.pow(2, attemptsMade) * 1000
    }
  },
  attempts: 5,
  backoff: { type: 'exponential' }
});

async function logImportSummary() {
  const total = newRecords + updatedRecords + failedRecords;
  const log = new ImportLog({
    totalFetched: total,
    newRecords,
    updatedRecords,
    failedRecords,
    failures,
  });
  await log.save();
  console.log('Import summary logged');
  newRecords = 0;
  updatedRecords = 0;
  failedRecords = 0;
  failures.length = 0;
}

module.exports = { worker, logImportSummary };