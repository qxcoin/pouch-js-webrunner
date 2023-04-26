import { program } from "commander";
import fastify from "@app/web.js";
import { port } from "@app/config.js";
import { BlockchainScanCommand } from "./commands/blockchain-scan.command";

program.command('web').action(async () => {
  console.log('Starting express app...');
  const result = await fastify.listen({ host: '0.0.0.0', port });
  console.log(`App listening at ${result}`);
});

program.addCommand((new BlockchainScanCommand).build());

export default program;
