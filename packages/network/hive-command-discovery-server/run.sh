#!/bin/sh
hostname $SYNC_HOST

echo "$(echo nameserver 192.168.200.1; cat /etc/resolv.conf)" > /etc/resolv.conf

openvpn --config /etc/openvpn/openvpn.conf > /tmp/openvpn.log &

yarn start --fqdn $SYNC_HOST