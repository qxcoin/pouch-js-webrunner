import Fastify from 'fastify';
import { AddressService } from "@services/address.service.js";
import logger from '@app/logger.js';
import {
  schema as addressRetrievalSchema,
  SchemaType as AddressRetrievalSchemaType,
} from '@schemas/address-retrieval.schema.js';
import {
  schema as addressActiveRetrievalSchema,
  SchemaType as AddressActiveRetrievalSchemaType,
} from '@schemas/address-active-retrieval.schema.js';
import {
  schema as addressBalanceRetrievalSchema,
  SchemaType as AddressBalanceRetrievalSchemaType,
} from '@schemas/address-balance-retrieval.schema.js';
import {
  schema as transactionRetrievalSchema,
  SchemaType as TransactionRetrievalSchema,
} from '@schemas/transactions-retrieval.schema.js';
import {
  schema as transferSchema,
  SchemaType as TransferSchemaType,
} from '@schemas/transfer.schema.js';
import {
  schema as scanSchema,
  SchemaType as ScanSchemaType,
} from '@schemas/scan.schema.js';
import { BlockchainService } from '@services/blockchain.service.js';
import { walletId } from "@app/wallet.js";
import { TransactionService } from '@services/transaction.service.js';
import { networks } from '@app/config.js';

const fastify = Fastify({
  logger,
  ajv: { customOptions: { strict: false } }
});

fastify.get<AddressRetrievalSchemaType>(
  '/address',
  { schema: addressRetrievalSchema },
  async (req, reply) => {
    const address = await AddressService.getByIndex(req.query.walletType, req.query.walletId, req.query.index, req.query.accountIndex);
    if (null === address) return reply.status(404).send();
    return reply.send(address.hash);
  }
);

fastify.get<AddressActiveRetrievalSchemaType>(
  '/address/active',
  { schema: addressActiveRetrievalSchema },
  async (req, reply) => {
    const address = await AddressService.getActive(req.query.walletType, req.query.walletId, req.query.groupId, req.query.accountIndex, Boolean(Number(req.query.fresh)));
    return reply.send(address.hash);
  }
);

fastify.get<AddressBalanceRetrievalSchemaType>(
  '/address/balance',
  { schema: addressBalanceRetrievalSchema },
  async (req, reply) => {
    const balance = await AddressService.getBalance(req.query.walletType, req.query.currency, req.query.addressHash);
    return reply.send(balance.toString());
  }
);

fastify.post<TransferSchemaType>(
  '/transfer',
  { schema: transferSchema },
  async (req, reply) => {
    return await BlockchainService.transfer(
      req.body.walletType,
      req.body.currency,
      req.body.from,
      req.body.to,
      BigInt(req.body.amount),
    );
  }
);

fastify.get<TransactionRetrievalSchema>(
  '/transactions',
  { schema: transactionRetrievalSchema },
  async (req, reply) => {
    return await TransactionService.find({
      walletType: req.query.walletType,
      walletId: req.query.walletId,
      currency: req.query.currency,
      to: req.query.addressHash,
    });
  }
);

fastify.post<ScanSchemaType>(
  '/scan',
  { schema: scanSchema },
  async (req, reply) => {
    const transactions = await BlockchainService.checkBlocks(req.body.walletType, req.body.from, req.body.to);
    await TransactionService.reportTransactions(transactions);
    return transactions;
  }
);

fastify.get(
  '/wallet/id',
  async (req, reply) => {
    return reply.send(walletId);
  }
);

fastify.get(
  '/wallet/networks',
  async (req, reply) => {
    return Object.values(networks);
  }
);

fastify.all(
  '/ping',
  async (req, reply) => {
    return reply.send('pong');
  }
);

// test audience
fastify.all(
  '/audience',
  async (req, reply) => {
    logger.debug({ body: req.body }, 'Received a transaction.');
    return reply.status(200).send();
  }
);

export default fastify;
