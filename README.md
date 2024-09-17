# HiveCommand

SCADA system for IIOT 4.0

## Getting Started

### Developer pathway

Get dependencies

[HexHive Gateway](https://github.com/TheTechCompany/HexHive)

```
git clone 

cd HiveCommand/

yarn
```

Start gateway, backend + web-frontend
```
hexhive-dev

cd packages/app/hivecommand-backend/; yarn start

cd packages/app/hivecommand-frontend/; yarn start

```

#### Typescript references
To keep typescript inference throughout the monorepo follow the below steps;

Keep the root tsconfig.json up to date with project references
Extend each project from the root tsconfig.json
Add composite to each module that is re-used
Add references at the bottom of modules that use shared modules

For webpack ts-loader with projectReferences and tsconfig-paths-webpack-plugin must be setup

### Integrator pathway

[Device onboarding](/docs/device-onboarding.md)

Architecture

```
┌─────────────────────┐         
│EdgeDevice (RPi / PC)│         
└┬────────────────────┘         
┌▽────────────────┐             
│SCADA Client     │             
└┬───────────────┬┘             
┌▽─────────────┐┌▽─────────────┐
│Evented values││PLC Driver Bus│
└┬─────────────┘└┬─────────────┘
┌▽───┐┌──────────▽┐             
│MQTT││PLC        │             
└────┘└───────────┘             
```

Available SCADA Clients

- [@hive-command/cli-client](/packages/clients/cli-client/)
- [@hive-command/native](https://github.com/TheTechCompany/HiveCommand/releases)

Available PLC Drivers

- [Driver interface](/packages/drivers/command-driver/)
- [OPC-UA](/packages/drivers/command-opcua/)
- [Ethernet/IP](/packages/drivers/command-ethernet-ip/)


## Testing

```
npx lerna run test
```

Coverage is needed across the entire repo to stop regressions

## Structure

```
packages/
  app/ - WebApp resources
    hivecommand-api/
    hivecommand-backend/
    hivecommand-frontend/
    hivecommand-native/
    hivecommand-native-dev/
  clients/
    iot-cli/
  communication/ - MQTT, OPC, Driver libraries
    amqp-client/
    amqp-hub/
    opc-client/
    opc-ethernet-ip-bridge/
    opc-amqp-bridge/
    opc-server/
    opc-utils/
    rabbitmq-auth/
    sms-utils/
  core/ - DB defs, scripting helpers, local-bridge
    command-data/
    command-local-sidecar/
    command-scripting/
    command-subscription-lock/
  core-ui/ - Nodes, Remote Components, Canvas
    command-canvas-nodes/
    command-remote-components/
    command-surface/
  infrastructure/ - Infrastructure (Pulumi)
    main/
    supporting/
  network/ - WAN Network (Auth/Discovery + SCADA)
    global-discovery-network/
    mqtt-auth-server/
```

## Dependencies

Provide jump-point for dependencies that are networked

[HexHive UI](https://github.com/TheTechCompany/HiveUI)