#!/bin/sh

openvpn --config /etc/openvpn/openvpn.conf &

yarn start:prod --fqdn discovery.hexhive.io