import { Static, Type } from '@sinclair/typebox'
import { FastifySchema, RouteGenericInterface } from 'fastify';

const QuerystringSchema = Type.Object({
  walletType: Type.Union([Type.Literal('bitcoin')]),
  groupId: Type.String(),
  fresh: Type.Optional(Type.Boolean()),
});

export interface SchemaType extends RouteGenericInterface {
  Querystring: Static<typeof QuerystringSchema>,
}

export const Schema: FastifySchema = {
  querystring: QuerystringSchema,
}
