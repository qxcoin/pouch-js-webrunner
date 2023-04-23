import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { AddressService } from "@services/address.services";
import {
  Schema as AddressRetrievalSchema,
  SchemaType as AddressRetrievalSchemaType,
} from '@schemas/address-retrieval';

const fastify = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

fastify.get<AddressRetrievalSchemaType>(
  '/addresses/:walletType/:accountIndex/:index',
  { schema: AddressRetrievalSchema },
  async (req, reply) => {
    const address = await AddressService.createAddress(req.params.walletType, req.params.index, req.params.accountIndex);
    return reply.send(address.hash);
  }
);

export default fastify;
