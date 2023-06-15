import { FastifySchema, RouteGenericInterface } from 'fastify';
import yup from 'yup';
import { convertSchema } from '@sodaru/yup-to-json-schema';
import { wallets as walletsConfig } from '@app/config.js';

const querystringSchema = yup.object({
  addressHash: yup.string().required(),
  currency: yup.string().required(),
  walletType: yup.mixed<keyof typeof walletsConfig>().oneOf(Object.keys(walletsConfig) as Array<keyof typeof walletsConfig>).required(),
});

export interface SchemaType extends RouteGenericInterface {
  Querystring: yup.InferType<typeof querystringSchema>,
}

export const schema: FastifySchema = {
  querystring: convertSchema(querystringSchema),
}
