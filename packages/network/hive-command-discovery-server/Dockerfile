FROM node:alpine as build

RUN apk add openssl

WORKDIR /app

COPY . .

RUN yarn

RUN npx lerna bootstrap --scope @hive-command/discovery-server --include-dependencies

RUN npx lerna run build --scope @hive-command/discovery-server --include-dependencies

RUN cp -Lr /app/packages/network/hive-command-discovery-server/node_modules/ _node_modules/

FROM node:alpine

WORKDIR /app

COPY --from=build /app/packages/network/hive-command-discovery-server/dist .

COPY --from=build /app/packages/network/hive-command-discovery-server/package.json ./package.json

COPY --from=build /app/_node_modules/ ./node_modules/
# WORKDIR /app/packages/network/hive-command-discovery-server

# CMD ["yarn", "start", "--fqdn", "discovery.hexhive.io"]