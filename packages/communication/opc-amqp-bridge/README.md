# OPCUA MQTT Client

## Purpose

Connects to opc-mqtt-hub and passes information from an OPCUA server


## Important Info

### Blocking OPCUA monitors

```setTimeout(func)``` is used instead of async or sync calls to keep the main event loop free and run the time intensive processing as a macrotask