import Fastify from 'fastify';
import { AddressService } from "@services/address.service.js";
import logger from './logger.js';
import {
  schema as addressRetrievalSchema,
  SchemaType as AddressRetrievalSchemaType,
} from '@schemas/address-retrieval.schema.js';
import {
  schema as addressBalanceRetrievalSchema,
  SchemaType as AddressBalanceRetrievalSchemaType,
} from '@schemas/address-balance-retrieval.schema.js';
import {
  schema as transferSchema,
  SchemaType as TransferSchemaType,
} from '@schemas/transfer.schema.js';
import { BlockchainService } from './services/blockchain.service.js';
import { walletId } from "./wallet.js";

const fastify = Fastify({
  logger,
  ajv: { customOptions: { strict: false } }
});

fastify.get<AddressRetrievalSchemaType>(
  '/address',
  { schema: addressRetrievalSchema },
  async (req, reply) => {
    const address = await AddressService.getActive(req.query.walletType, req.query.walletId, req.query.groupId, Boolean(Number(req.query.fresh)));
    return reply.send(address.hash);
  }
);

fastify.get<AddressBalanceRetrievalSchemaType>(
  '/address/balance',
  { schema: addressBalanceRetrievalSchema },
  async (req, reply) => {
    const balance = await AddressService.getBalance(req.query.walletType, req.query.walletId, req.query.currency, req.query.addressHash);
    return reply.send(balance.toString());
  }
);

fastify.post<TransferSchemaType>(
  '/transfer',
  { schema: transferSchema },
  async (req, reply) => {
    return await BlockchainService.transfer(req.body.walletType, req.body.currency, req.body.from, req.body.to, BigInt(req.body.amount));
  }
);

fastify.get(
  '/wallet/id',
  async (req, reply) => {
    return reply.send(walletId);
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
