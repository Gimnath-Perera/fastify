import { expectType, expectError, expectAssignable } from 'tsd'
import fastify, { RouteHandlerMethod, RouteHandler, RawRequestDefaultExpression, FastifyContext, FastifyContextConfig, FastifyRequest, FastifyReply, FastifySchema, FastifyTypeProviderDefault } from '../../fastify'
import { RawServerDefault, RawReplyDefaultExpression, ContextConfigDefault } from '../../types/utils'
import { FastifyLoggerInstance } from '../../types/logger'
import { RouteGenericInterface } from '../../types/route'
import { FastifyInstance } from '../../types/instance'
import { Buffer } from 'buffer'
import { ReplyTypeConstrainer } from '../../types/reply'

type DefaultSerializationFunction = (payload: { [key: string]: unknown }) => string
type DefaultFastifyReplyWithCode<Code extends number> = FastifyReply<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, RouteGenericInterface, ContextConfigDefault, FastifySchema, FastifyTypeProviderDefault, ReplyTypeConstrainer<RouteGenericInterface['Reply'], Code>>

const getHandler: RouteHandlerMethod = function (_request, reply) {
  expectType<RawReplyDefaultExpression>(reply.raw)
  expectType<FastifyContext<ContextConfigDefault>>(reply.context)
  expectType<FastifyContextConfig>(reply.context.config)
  expectType<FastifyLoggerInstance>(reply.log)
  expectType<FastifyRequest<RouteGenericInterface, RawServerDefault, RawRequestDefaultExpression>>(reply.request)
  expectType<<Code extends number>(statusCode: Code) => DefaultFastifyReplyWithCode<Code>>(reply.code)
  expectType<<Code extends number>(statusCode: Code) => DefaultFastifyReplyWithCode<Code>>(reply.status)
  expectType<number>(reply.statusCode)
  expectType<boolean>(reply.sent)
  expectType<((payload?: unknown) => FastifyReply)>(reply.send)
  expectType<(key: string, value: any) => FastifyReply>(reply.header)
  expectType<(values: {[key: string]: any}) => FastifyReply>(reply.headers)
  expectType<(key: string) => number | string | string[] | undefined>(reply.getHeader)
  expectType<() => { [key: string]: number | string | string[] | undefined }>(reply.getHeaders)
  expectType<(key: string) => FastifyReply>(reply.removeHeader)
  expectType<(key: string) => boolean>(reply.hasHeader)
  expectType<{(statusCode: number, url: string): FastifyReply; (url: string): FastifyReply }>(reply.redirect)
  expectType<() => FastifyReply>(reply.hijack)
  expectType<() => void>(reply.callNotFound)
  expectType<() => number>(reply.getResponseTime)
  expectType<(contentType: string) => FastifyReply>(reply.type)
  expectType<(fn: (payload: any) => string) => FastifyReply>(reply.serializer)
  expectType<(payload: any) => string | ArrayBuffer | Buffer>(reply.serialize)
  expectType<(fulfilled: () => void, rejected: (err: Error) => void) => void>(reply.then)
  expectType<(key: string, fn: ((reply: FastifyReply, payload: string | Buffer | null) => Promise<string>) | ((reply: FastifyReply, payload: string | Buffer | null, done: (err: Error | null, value?: string) => void) => void)) => FastifyReply>(reply.trailer)
  expectType<(key: string) => boolean>(reply.hasTrailer)
  expectType<(key: string) => FastifyReply>(reply.removeTrailer)
  expectType<FastifyInstance>(reply.server)
  expectAssignable<((httpStatus: string) => DefaultSerializationFunction)>(reply.getSerializationFunction)
  expectAssignable<((schema: {[key: string]: unknown}) => DefaultSerializationFunction)>(reply.getSerializationFunction)
  expectAssignable<((schema: {[key: string]: unknown}, httpStatus?: string) => DefaultSerializationFunction)>(reply.compileSerializationSchema)
  expectAssignable<((input: {[key: string]: unknown}, schema: {[key: string]: unknown}, httpStatus?: string) => unknown)>(reply.serializeInput)
  expectAssignable<((input: {[key: string]: unknown}, httpStatus: string) => unknown)>(reply.serializeInput)
}

interface ReplyPayload {
  Reply: {
    test: boolean;
  };
}

interface ReplyUnion {
  Reply: {
    success: boolean;
  } | {
    error: string;
  }
}

interface ReplyHttpCodes {
  Reply: {
    '1xx': number,
    200: 'abc',
    201: boolean,
    300: { foo: string },
  }
}

const typedHandler: RouteHandler<ReplyPayload> = async (request, reply) => {
  expectType<((payload?: ReplyPayload['Reply']) => FastifyReply<RawServerDefault, RawRequestDefaultExpression<RawServerDefault>, RawReplyDefaultExpression<RawServerDefault>, ReplyPayload>)>(reply.send)
}

const server = fastify()
server.get('/get', getHandler)
server.get('/typed', typedHandler)
server.get<ReplyPayload>('/get-generic-send', async function handler (request, reply) {
  reply.send({ test: true })
})
server.get<ReplyPayload>('/get-generic-return', async function handler (request, reply) {
  return { test: false }
})
expectError(server.get<ReplyPayload>('/get-generic-send-error', async function handler (request, reply) {
  reply.send({ foo: 'bar' })
}))
expectError(server.get<ReplyPayload>('/get-generic-return-error', async function handler (request, reply) {
  return { foo: 'bar' }
}))
server.get<ReplyUnion>('/get-generic-union-send', async function handler (request, reply) {
  if (0 as number === 0) {
    reply.send({ success: true })
  } else {
    reply.send({ error: 'error' })
  }
})
server.get<ReplyUnion>('/get-generic-union-return', async function handler (request, reply) {
  if (0 as number === 0) {
    return { success: true }
  } else {
    return { error: 'error' }
  }
})
expectError(server.get<ReplyUnion>('/get-generic-union-send-error-1', async function handler (request, reply) {
  reply.send({ successes: true })
}))
expectError(server.get<ReplyUnion>('/get-generic-union-send-error-2', async function handler (request, reply) {
  reply.send({ error: 500 })
}))
expectError(server.get<ReplyUnion>('/get-generic-union-return-error-1', async function handler (request, reply) {
  return { successes: true }
}))
expectError(server.get<ReplyUnion>('/get-generic-union-return-error-2', async function handler (request, reply) {
  return { error: 500 }
}))
server.get<ReplyHttpCodes>('/get-generic-http-codes-send', async function handler (request, reply) {
  reply.code(200).send('abc')
  reply.code(201).send(true)
  reply.code(300).send({ foo: 'bar' })
  reply.code(101).send(123)
})
expectError(server.get<ReplyHttpCodes>('/get-generic-http-codes-send-error-1', async function handler (request, reply) {
  reply.code(200).send('def')
}))
expectError(server.get<ReplyHttpCodes>('/get-generic-http-codes-send-error-2', async function handler (request, reply) {
  reply.code(201).send(0)
}))
expectError(server.get<ReplyHttpCodes>('/get-generic-http-codes-send-error-3', async function handler (request, reply) {
  reply.code(300).send({ foo: 123 })
}))
expectError(server.get<ReplyHttpCodes>('/get-generic-http-codes-send-error-4', async function handler (request, reply) {
  reply.code(100).send('asdasd')
}))
expectError(server.get<ReplyHttpCodes>('/get-generic-http-codes-send-error-5', async function handler (request, reply) {
  reply.code(401).send({ foo: 123 })
}))
