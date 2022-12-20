FROM node:16-slim as build

ARG BUILD_ENV=github


RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
COPY lerna.json .

RUN yarn

COPY packages/app/hivecommand-backend/ packages/app/hivecommand-backend/
COPY packages/core/command-data/ packages/core/command-data/
# COPY . . 

RUN npx lerna bootstrap --scope @hive-command/backend --include-dependencies

ENV NODE_ENV="production"

# RUN cd packages/core/command-data; npx prisma generate

RUN npx lerna run build --scope @hive-command/backend --include-dependencies

WORKDIR /app/packages/app/hivecommand-backend

RUN cp -Lr /app/packages/app/hivecommand-backend/node_modules/ _node_modules/

FROM node:16

WORKDIR /app

COPY --from=build /app/packages/app/hivecommand-backend/package.json .
COPY --from=build /app/packages/app/hivecommand-backend/dist .
COPY --from=build /app/packages/app/hivecommand-backend/_node_modules node_modules/

CMD ["yarn", "run", "start:prod"]