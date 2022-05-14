#!/bin/sh

openvpn --config /etc/openvpn/openvpn.conf > /tmp/openvpn.log &

yarn start:prod --fqdn $SYNC_HOST