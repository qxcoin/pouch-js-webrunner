import { Command } from "commander";
import defaultWorker from "@app/workers/default.worker.js";
import logger from "@app/logger.js";

export class QueueWork {

  public build(): Command {
    const program = new Command();
    program.name('queue:work');
    program.argument('<queue name>');
    program.action(this.run.bind(this));
    return program;
  }

  public async run(queueName: string) {
    logger.info(`Starting worker for queue ${queueName}...`);
    if ('default' === queueName) {
      defaultWorker.run();
    }
  }

}
