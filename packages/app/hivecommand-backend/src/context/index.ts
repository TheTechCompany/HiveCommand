import { pubSub, redis, redisPubSub } from "./pubsub"
import { createClient } from 'redis'

export type GraphQLContext = {
    pubSub: typeof pubSub,
    redis: typeof redis
}

export function contextFactory(
    request: any
): GraphQLContext {
    return {
        redis,
        pubSub
    }
}