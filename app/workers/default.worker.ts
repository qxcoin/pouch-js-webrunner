import { Job, Worker } from "bullmq";
import redis from "@app/redis.js";
import { ReportTransactionJob } from "@app/jobs/report-transaction.job.js";
import logger from "@app/logger.js";

export default new Worker('default', processor, {
  connection: redis,
  autorun: false,
});

// TODO: we can make this dynamic, but for now it is enough
async function processor(job: Job) {

  logger.info(`Working for job ${job.name}...`);

  switch (job.name) {
    case ReportTransactionJob.name:
      await (new ReportTransactionJob()).execute(job);
      break;
  }
}
