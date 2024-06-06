import { program } from "commander";
import fastify from "@app/web.js";
import { port } from "@app/config.js";
import { BlockchainScanCommand } from "./commands/blockchain-scan.command.js";
import { BlockchainMempoolScanCommand } from "./commands/blockchain-mempool-scan.command.js";
import { QueueWork } from "./commands/queue-work.command.js";

program.command('web').action(async () => {
  console.log('Starting express app...');
  const result = await fastify.listen({ host: '0.0.0.0', port });
  console.log(`App listening at ${result}`);
});

program.addCommand((new BlockchainScanCommand).build());
program.addCommand((new BlockchainMempoolScanCommand).build());
program.addCommand((new QueueWork).build());

export default program;
