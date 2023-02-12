# PLC Drivers

PLC Drivers provide an interface from a connection technology into the HiveCommand Types system

## Required methods

- getTags()
- getTemplates()?
- writeTag(key: string, value: any)
- readTag(key: string)
- subscribe(key: string | string[])?

## Supported systems

- Ethernet/IP
- OPC-UA
- IO-Link
- MQTT