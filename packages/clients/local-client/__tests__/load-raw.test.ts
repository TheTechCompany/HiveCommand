import { CommandStateMachineMode } from "@hive-command/state-machine";
import { Machine } from "../src/machine";
import payload from './test-payload.json'
import log from 'loglevel'

log.setLevel('debug')
jest.setTimeout(60000);

describe("Load payload blobs", () => {
	it('Can load', async () => {
		const result = await new Promise(async (resolve, reject) => {
			const machine = new Machine({
				pluginDir: '/tmp/plugins'
			})
	
			await machine.load(payload as any)

			machine.changeMode(CommandStateMachineMode.AUTO)
			
			await machine.start()
			resolve(true)
		})
		expect(result).toBe(true)
	})
})