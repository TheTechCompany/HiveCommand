# HiveCommand

SCADA system for IIOT 4.0

- [Electrical Editor](packages/core-ui/command-electrical-editor/README.md)

## Getting Started

Developer pathway

Get dependencies
```
git clone 

cd HiveCommand/

yarn
```

Start Storybook (Component development)
```
cd packages/core-ui/command-electrical-editor

yarn storybook
```


Start backend + web-frontend (HexHive gateway needs configuring first) [HexHive Gateway](https://github.com/TheTechCompany/HexHive)
```
cd packages/app/hivecommand-backend/; yarn start

cd packages/app/hivecommand-frontend/; yarn start

```


Integrator pathway

[Download Builder](https://github.com/TheTechCompany/HiveCommand/releases)

End-user pathway

[Sign Up](https://hivecommand.dev)

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