import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { AddressService } from "@services/address.services.js";
import logger from './logger.js';
import {
  Schema as AddressRetrievalSchema,
  SchemaType as AddressRetrievalSchemaType,
} from '@schemas/address-retrieval.js';

const fastify = Fastify({ logger }).withTypeProvider<TypeBoxTypeProvider>();

fastify.get<AddressRetrievalSchemaType>(
  '/address',
  { schema: AddressRetrievalSchema },
  async (req, reply) => {
    const address = await AddressService.get(req.query.walletType, req.query.groupId, req.query.fresh);
    return reply.send(address.hash);
  }
);

export default fastify;
