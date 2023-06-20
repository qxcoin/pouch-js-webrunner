import { FastifySchema, RouteGenericInterface } from 'fastify';
import yup from 'yup';
import { convertSchema } from '@sodaru/yup-to-json-schema';
import { wallets as walletsConfig } from '@app/config.js';
import { walletId } from '@app/wallet.js';

const querystringSchema = yup.object({
  walletType: yup.mixed<keyof typeof walletsConfig>().oneOf(Object.keys(walletsConfig) as Array<keyof typeof walletsConfig>),
  walletId: yup.string().oneOf([walletId]),
  currency: yup.string(),
  addressHash: yup.string(),
  spent: yup.string().matches(/^0|1$/),
});

export interface SchemaType extends RouteGenericInterface {
  Querystring: yup.InferType<typeof querystringSchema>,
}

export const schema: FastifySchema = {
  querystring: convertSchema(querystringSchema),
}
