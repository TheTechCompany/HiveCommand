FROM node:lts-slim as build

RUN apt-get update; apt-get install openssl -y

WORKDIR /app

COPY . .

RUN yarn

# RUN xnpx lerna bootstrap --scope @hive-command/mqtt-auth-server --include-dependencies

RUN npx lerna run build --scope @hive-command/mqtt-auth-server --include-dependencies

WORKDIR /app/packages/network/mqtt-auth-server


# RUN mkdir -p /root/.config/
# RUN cp -Lr /app/packages/network/hive-command-discovery-server/node_modules/ _node_modules/

# FROM node:lts-slim

# WORKDIR /app

# RUN apt-get update; apt-get install openssl openvpn -y

# RUN apk update; apk add openssl openvpn

# COPY ./packages/network/hive-command-discovery-server/run.sh .

# COPY --from=build /app/packages/network/hive-command-discovery-server/run.sh .

# COPY --from=build /app/packages/network/hive-command-discovery-server/dist/* .

# COPY --from=build /app/packages/network/hive-command-discovery-server/package.json ./package.json

# COPY --from=build /app/_node_modules/ ./node_modules/

# CMD [ "bash", "./run.sh" ]
CMD ["yarn", "start"]
# CMD ["openvpn", "/etc/openvpn/openvpn.conf", ">", "/tmp/openvpn.log", "&", "yarn", "start:prod", "--fqdn", "discovery.hexhive.io"]
