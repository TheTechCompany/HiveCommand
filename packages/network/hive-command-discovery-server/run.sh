#!/bin/sh
mkdir -p /dev/net 

mknod /dev/net/tun c 10 200

chmod 600 /dev/net/tun

openvpn --config /etc/openvpn/openvpn.conf &

yarn start:prod --fqdn discovery.hexhive.io