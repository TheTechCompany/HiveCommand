import { CommandClient } from '@hivecommand-clients/revpi'

const client = new CommandClient({
	pluginDir: '.'
})

client.start()