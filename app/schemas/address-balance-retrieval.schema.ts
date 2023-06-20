import { FastifySchema, RouteGenericInterface } from 'fastify';
import yup from 'yup';
import { convertSchema } from '@sodaru/yup-to-json-schema';
import { wallets as walletsConfig } from '@app/config.js';
import { walletId } from '@app/wallet.js';

const querystringSchema = yup.object({
  walletType: yup.mixed<keyof typeof walletsConfig>().oneOf(Object.keys(walletsConfig) as Array<keyof typeof walletsConfig>).required(),
  walletId: yup.string().required().equals([walletId]),
  currency: yup.string().required(),
  addressHash: yup.string().required(),
});

export interface SchemaType extends RouteGenericInterface {
  Querystring: yup.InferType<typeof querystringSchema>,
}

export const schema: FastifySchema = {
  querystring: convertSchema(querystringSchema),
}
