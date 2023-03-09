import OPCUAServer from '@hive-command/opcua-server'

export const TestServer = async (port?: number) => {

    let server = new OPCUAServer({
        port: port || 4444,
        productName: "TestServer"
    })

    await server.start()

    let num = 123;
    
    await server.addVariable(
        'Permeate', 
        'Number', 
        false, 
        () => {
            return num
        }, 
        (value) => console.log({value})
    );



    return {
        changeValue: (value: any) => {
            num = value;
        },
        start: async () => {
                await server.start()
        },
        stop: async () => {
            await server.stop()
        }
    }
}