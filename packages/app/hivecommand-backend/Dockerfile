FROM node:22-slim as build

ARG BUILD_ENV=github


RUN apt-get update && apt-get install -y openssl python3

WORKDIR /app

# COPY tsconfig.json .
# COPY package.json .
# COPY yarn.lock .
# COPY lerna.json .


COPY . .

# COPY packages/app/hivecommand-backend/ packages/app/hivecommand-backend/
# COPY packages/communication/amqp-client/ packages/communication/amqp-client/
# COPY packages/core/command-scripting/ packages/core/command-scripting/
# COPY packages/app/hivecommand-db/ packages/app/hivecommand-db/

RUN yarn

# COPY . . 

# RUN yarn

# RUN npx lerna bootstrap --scope @hive-command/backend --include-dependencies

ENV NODE_ENV="production"

# RUN cd packages/core/command-data; npx prisma generate

RUN npx lerna run build --scope @hive-command/backend --include-dependencies

WORKDIR /app/packages/app/hivecommand-backend

WORKDIR /app

RUN cp -Lr /app/packages/app/hivecommand-backend/node_modules/ _node_modules/


FROM node:22-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY --from=build /app/packages/app/hivecommand-backend/package.json .
COPY --from=build /app/packages/app/hivecommand-backend/dist/ .
COPY --from=build /app/_node_modules/ node_modules/

CMD ["yarn", "run", "start:prod"]