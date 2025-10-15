require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const http = require('http');
const { Server } = require('socket.io');
const importLogsRouter = require('./routes/importLogs');
const Job = require('./models/Job');
const ImportLog = require('./models/ImportLog');


const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const jobQueue = new Queue('job-import-queue', { connection });

app.use('/api/import-logs', importLogsRouter);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const { scheduleJobImport } = require('./cron/importJobsCron');

scheduleJobImport();

let newRecords = 0;
let updatedRecords = 0;
let failedRecords = 0;
const failures = [];

const worker = new Worker('job-import-queue', async job => {
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

worker.on('drained', async () => {
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
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Backend running on port ${process.env.PORT || 5000}`);
});