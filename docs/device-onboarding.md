# Device onboarding

Prerequisites 

- [IO Mapping](./program-io.md)

## Stages 

1. Device creation
2. Token setup
3. Provisioning
4. Runtime setup

### Device Creation

In the deployments menu click the add button, provide a site level name describing where this device will be, customise the ID if required and select the Program from the dropdown.

### Token Setup

Click the more button and select settings for the device you are trying to setup. 

Click the add button and provide a name for the token you are trying to generate, click next and a token will be generated for this installation.

### Provisioning

Install the required client library for your installation, for a headless installation the [CLI Client](https://npmjs.com/@hive-command/cli-client) is probably the right choice, for a manned installation the [Native App](https://github.com/TheTechCompany/HiveCommand/releases) is a better choice.

Start the client and provide the provisoning code, after fetching the required context from the discovery server and installing the drivers data transmission should begin. 

### Runtime setup

Power outages, maintenance and other things can cause the client to crash so it's a good idea to either set it up as a Windows service or run with a watchdog like forever
