import {DiagnosticsApi} from '..'

const client = new DiagnosticsApi(undefined, 'http://localhost')

describe('IFM-core-api', () => {
    it('Request diagnostic info', async () => {
        const temperature = await client.getTemperature()
        console.log(temperature)

        expect(temperature).toBe(null)
    });
});
