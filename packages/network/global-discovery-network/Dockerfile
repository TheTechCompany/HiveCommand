FROM node:lts-slim as build

RUN apt-get update; apt-get install openssl -y

WORKDIR /app

COPY . .

RUN yarn

# RUN npx lerna bootstrap --scope @hive-command/gds --include-dependencies

RUN npx lerna run build --scope @hive-command/gds
#  --include-dependencies

WORKDIR /app/packages/network/global-discovery-network

WORKDIR /app

# RUN mkdir -p /root/.config/
RUN cp -Lr /app/packages/network/global-discovery-network/node_modules/ _node_modules/

FROM node:lts-slim

WORKDIR /app

RUN apt-get update; apt-get install openssl -y

# RUN apk update; apk add openssl openvpn

# COPY ./packages/network/hive-command-discovery-server/run.sh .

# COPY --from=build /app/packages/network/hive-command-discovery-server/run.sh .

COPY --from=build /app/packages/network/global-discovery-network/dist/ .

COPY --from=build /app/packages/network/global-discovery-network/package.json ./package.json

COPY --from=build /app/_node_modules/ ./node_modules/

# CMD [ "bash", "./run.sh" ]
CMD ["yarn", "start:prod"]
# CMD ["openvpn", "/etc/openvpn/openvpn.conf", ">", "/tmp/openvpn.log", "&", "yarn", "start:prod", "--fqdn", "discovery.hexhive.io"]
