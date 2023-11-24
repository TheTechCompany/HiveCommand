FROM node:lts-slim as build

RUN apt-get update; apt-get install openssl -y

WORKDIR /app

COPY . .

RUN yarn

# RUN xnpx lerna bootstrap --scope @hive-command/mqtt-auth-server --include-dependencies

RUN npx lerna run build --scope @hive-command/mqtt-auth-server --include-dependencies

WORKDIR /app/packages/network/mqtt-auth-server

WORKDIR /app

# RUN mkdir -p /root/.config/
RUN cp -Lr /app/packages/network/mqtt-auth-server/node_modules/ _node_modules/

FROM node:lts-slim

WORKDIR /app

RUN apt-get update; apt-get install openssl -y

# RUN apk update; apk add openssl openvpn

# COPY ./packages/network/hive-command-discovery-server/run.sh .

# COPY --from=build /app/packages/network/hive-command-discovery-server/run.sh .

COPY --from=build /app/packages/network/mqtt-auth-server/dist/ .

COPY --from=build /app/packages/network/mqtt-auth-server/package.json ./package.json

COPY --from=build /app/_node_modules/ ./node_modules/

# CMD [ "bash", "./run.sh" ]
CMD ["yarn", "start:prod"]
# CMD ["openvpn", "/etc/openvpn/openvpn.conf", ">", "/tmp/openvpn.log", "&", "yarn", "start:prod", "--fqdn", "discovery.hexhive.io"]
