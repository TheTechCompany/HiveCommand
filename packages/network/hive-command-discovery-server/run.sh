#!/bin/sh
hostname $SYNC_HOST

openvpn --config /etc/openvpn/openvpn.conf > /tmp/openvpn.log &

yarn start --fqdn $SYNC_HOST