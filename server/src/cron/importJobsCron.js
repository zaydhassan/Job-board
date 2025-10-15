const cron = require('node-cron');
const { jobQueue } = require('../app');
const { fetchJobsFromAPI } = require('../services/jobFetcher');

const JOB_API_URL = process.env.JOB_API_URL;

function scheduleJobImport() {
  cron.schedule('0 * * * *', async () => {
    try {
      const jobs = await fetchJobsFromAPI(JOB_API_URL);
      for (const job of jobs) {
        await jobQueue.add('importJob', job);
      }
      console.log(`Queued ${jobs.length} jobs for import`);
    } catch (error) {
      console.error('Error in scheduled job importing:', error);
    }
  });
}

module.exports = { scheduleJobImport };