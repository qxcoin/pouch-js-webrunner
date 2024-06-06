import {
  Queue as BullmqQueue,
  Job as BullmqJob,
  JobsOptions as BullmqJobsOptions,
} from "bullmq";
import redis from '@app/redis.js';

export abstract class Job<DataType> {

  queueName(): string {
    return 'default';
  }

  abstract execute(job: BullmqJob<DataType>): void;

  queue() {
    return new BullmqQueue<DataType>(this.queueName(), { connection: redis });
  }

  dispatch(data: DataType, opts?: BullmqJobsOptions) {
    return this.queue().add(this.constructor.name, data, opts);
  }
}
