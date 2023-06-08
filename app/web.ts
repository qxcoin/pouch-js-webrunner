import Fastify from 'fastify';
import { AddressService } from "@services/address.service.js";
import logger from './logger.js';
import { wallets as walletsConfig } from './config.js';
import {
  schema as addressRetrievalSchema,
  SchemaType as AddressRetrievalSchemaType,
} from '@schemas/address-retrieval.schema.js';
import {
  schema as transferSchema,
  SchemaType as TransferSchemaType,
} from '@schemas/transfer.schema.js';
import { BlockchainService } from './services/blockchain.service.js';

const fastify = Fastify({
  logger,
  ajv: { customOptions: { strict: false } }
});

fastify.get<AddressRetrievalSchemaType>(
  '/address',
  { schema: addressRetrievalSchema },
  async (req, reply) => {
    const address = await AddressService.getActive(req.query.walletType, req.query.groupId, Boolean(Number(req.query.fresh)));
    return reply.send(address.hash);
  }
);

fastify.post<TransferSchemaType>(
  '/transfer',
  { schema: transferSchema },
  async (req, reply) => {
    const conf = walletsConfig[req.body.walletType];
    if (conf['coin'] === req.body.currency)
      return BlockchainService.transfer(req.body.walletType, req.body.from, req.body.to, BigInt(req.body.amount));
    else if (undefined !== conf['tokens'][req.body.currency])
      return BlockchainService.transferToken(req.body.walletType, req.body.currency, req.body.from, req.body.to, BigInt(req.body.amount));
    else
      return reply.status(400).send(new Error(`Currency ${req.body.currency} is not supported in ${req.body.walletType} wallet.`));
  }
);

fastify.all(
  '/ping',
  async (req, reply) => {
    return reply.send('pong');
  }
);

fastify.all(
  '/audience',
  async (req, reply) => {
    logger.debug({ body: req.body }, 'Received a request.');
    return reply.send(200);
  }
);

export default fastify;
