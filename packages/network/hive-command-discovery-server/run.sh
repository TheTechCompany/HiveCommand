#!/bin/bash
hostname $SYNC_HOST

nameserver="nameserver 192.168.200.1"
resolv="$(cat /etc/resolv.conf)"
if [[ $resolv == *"192.168.200.1"* ]]; then
  echo "nameserver already configured"
else
  echo "$(echo $nameserver; echo $resolv)" > /etc/resolv.conf
fi

openvpn --config /etc/openvpn/openvpn.conf > /tmp/openvpn.log &

yarn start:prod --fqdn $SYNC_HOST