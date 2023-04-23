import { Static, Type } from '@sinclair/typebox'
import { FastifySchema, RouteGenericInterface } from 'fastify';

const ParamsSchema = Type.Object({
  walletType: Type.Union([Type.Literal('bitcoin')]),
  index: Type.Integer(),
  accountIndex: Type.Integer(),
});

export interface SchemaType extends RouteGenericInterface {
  Params: Static<typeof ParamsSchema>,
}
export const Schema: FastifySchema = {
  params: ParamsSchema,
}
