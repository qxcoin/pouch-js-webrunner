import yup from 'yup';
import { FastifySchema, RouteGenericInterface } from 'fastify';
import { convertSchema } from '@sodaru/yup-to-json-schema';
import { wallets as walletsConfig } from '@app/config.js';

const bodySchema = yup.object({
  walletType: yup.mixed<keyof typeof walletsConfig>().oneOf(Object.keys(walletsConfig) as Array<keyof typeof walletsConfig>).required(),
  from: yup.number().required(),
  to: yup.number().required(),
});

export interface SchemaType extends RouteGenericInterface {
  Body: yup.InferType<typeof bodySchema>,
}

export const schema: FastifySchema = {
  body: convertSchema(bodySchema),
}
