import { RedisPubSub } from "graphql-redis-subscriptions";

import { PubSub } from "graphql-subscriptions";
import { createClient } from "redis";
import { TypedPubSub } from "typed-graphql-subscriptions";

export type PubSubChannels = {
    watchingDevice: [ { watcher: {id: string} }]
};

export const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

export const redisPubSub = new RedisPubSub();

export const pubSub = new PubSub();