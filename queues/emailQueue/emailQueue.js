// queues/emailQueue.js
import Queue from 'bull';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY,REDIS_HOST,REDIS_PORT,REDIS_PASSWORD,EMAIL_FROM} from '../../config/env.js';

sgMail.setApiKey(SENDGRID_API_KEY);

// const emailQueue = new Queue('email', {
//   redis: {
//     host: REDIS_HOST || 'localhost',
//     port: REDIS_PORT || 6379,
//     password: REDIS_PASSWORD || undefined,
//     tls: true  
//   }
// });

const REDIS_URL="rediss://default:AdY5AAIncDFmZTIxMjA5MWY2ZWM0NjU4YWM0NjFjYmE1M2VmMWEyNnAxNTQ4NDE@related-lion-54841.upstash.io:6379"


const emailQueue = new Queue('email', REDIS_URL);

// Process emails in background

emailQueue.process(async (job) => {
    
    console.log('Email queue processor started');



  try {
    const { to, subject, html, from } = job.data;
    
    console.log(`Processing email job for: ${to}`);
    console.log(`Email subject: ${subject}`);
    console.log(`Email from: ${from || EMAIL_FROM}`);

    await sgMail.send({
      to,
      from: from || EMAIL_FROM,
      subject,
      html
    });

    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, to };
  } catch (error) {
    console.error(`❌ Email send failed for ${job.data.to}:`, error.message);
    throw error; // Bull will retry
  }
});

// Handle completion
emailQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed:`, job.data.to);
});

// Handle failures after all retries
emailQueue.on('failed', (job, error) => {
  console.error(
    `❌ Email job ${job.id} failed after ${job.attemptsMade} attempts:`,
    job.data.to,
    error.message
  );
});

// Handle stalled jobs
emailQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled, will retry`);
});

export default emailQueue;