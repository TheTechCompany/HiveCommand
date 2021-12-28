# HiveCommand Clients

## Get Started

```bash

npm i -g @hive-command/local-client

hive-io pilot
```


## Plugins

```bash

cd $COMMAND_PLUGIN_DIR

npm i @hive-command/plugin-iolink
```

plugins.json

```json
{
	"plugins": ["@hive-command/plugin-revpi", "@hive-command/plugin-iolink"],
	"ignorePlugins": ["@hive-command/plugin-revpi"]
}
```