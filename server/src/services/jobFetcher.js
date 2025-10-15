const axios = require('axios');
const xml2js = require('xml2js');

async function fetchJobsFromAPI(apiUrl) {
  try {
    const response = await axios.get(apiUrl);
    const xmlData = response.data;
    const parsed = await xml2js.parseStringPromise(xmlData, { explicitArray: false });

    const jobs = parsed.jobs.job instanceof Array ? parsed.jobs.job : [parsed.jobs.job];
    return jobs.map(job => ({
      jobId: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      datePosted: new Date(job.date),
      url: job.url,
    }));
  } catch (error) {
    console.error('Error fetching or parsing jobs:', error);
    throw error;
  }
}

module.exports = { fetchJobsFromAPI };