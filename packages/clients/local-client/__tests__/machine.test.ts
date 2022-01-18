import { Machine } from "../src/machine"

describe("Client Machine", () => {
	it('runs write_loop', async () => {
		await new Promise((resolve) => {
			const machine = new Machine({pluginDir: '/tmp/plugin-dir'})
			machine.start()
		})
	})
})