/*
    Command Client - Native Sidecar

    - maintains opc connections
    - provides access for native frontend
    - registers subscriptions
*/
import EventEmitter from 'events'
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import { Server } from 'socket.io'

import { Sidecar } from './wrapper';

const OPC_PROXY_PORT = 8484;

const sidecar = new Sidecar();

const app = express();

const http = require('http');
const server = http.createServer(app);

const io = new Server(server, {
    allowRequest: (req, fn) => {
        fn(null, true)
    },
    cors: {

    }
});

io.on('connection', (socket) => {
    socket.on('publish-change', (data) => {
        sidecar.publish_data(data.key, data.value);

    })
})

// io.on('publish-change', (data) => {
//     sidecar.publish_data(data.key, data.value);
// });

let subscriptions: {
    events: EventEmitter,
    paths: { tag: string, path: string }[],
    unsubscribe?: () => void
} | undefined = undefined;


const dataChanged = (data: any) => {
    io.emit('data-changed', data)
    // console.log({data});
    // sidecar.publish_data()
}

app.use(bodyParser.json());
app.use(cors());

app.route('/healthcheck')
    .get((req, res) => {
        res.send({running: true});
    })

app.route('/setup')
    .get(async (req, res) => {
        const mainConfig = sidecar.getConfig();
        const config = mainConfig?.iot;

        if (mainConfig && mainConfig.opcuaServer && config) {

            await sidecar.updateConfig(mainConfig);

            await sidecar.connect(mainConfig.opcuaServer)

            await sidecar.setup_data(config.host, config.user, config.pass, config.exchange)
        }

        res.send(config ? { config } : { error: "No config" })
    })
    .post(async (req, res) => {
        const mainConfig = req.body.config;

        sidecar.setConfig(mainConfig);

        const config = mainConfig.iot;

        sidecar.stop()

        await sidecar.connect(mainConfig.opcuaServer)

        await sidecar.setup_data(config.host, config.user, config.pass, config.exchange);

        await sidecar.start()
        res.send({ config: sidecar.getConfig() })
    })

app.route('/:host/set_data')
    .post(async (req, res) => {
        // if(subscriptions[req.params.host]) return res.send({error:})

        let { path, value } = req.body;

        const code = await sidecar.setTag(path, value);

        // const client = await sidecar.connect(req.params.host)

        // const { type: dt, isArray } = await sidecar.getDataType(client, path)

        // if(!dt) return res.send({error: "No datatype"})

        // // const client = await sidecar.connect(req.params.host)
        // //TODO pickup dataType from somewhere dynamic
        // const code = await sidecar.setData(client, path, (DataType as any)[dt as any], value);

        res.send({ code })
    })

app.post('/:host/subscribe', async (req, res) => {
    // if(subscriptions[req.params.host]) return res.send({error: "Already subscribed"});


    // if(subscriptions && !isEqual(subscriptionMap, subscriptions?.paths)){
    //     const {events: eventEmitter, unsubscribe} = subscriptions

    //     eventEmitter.removeListener('data-changed', dataChanged);
    //     unsubscribe() 

    //     subscriptions = undefined
    //     // delete subscriptions
    // }

    if (subscriptions) {
        // current_data[]
        return res.send({
            data: sidecar.values
        })
    };

    const { subscriptionMap, deviceMap } = sidecar.getConfig() || {}

    try {
        const client = await sidecar.connect(req.params.host)

        const { unsubscribe } = await sidecar.subscribe(subscriptionMap || [])

        console.log("Subscribed to", subscriptionMap)

        sidecar.on('data-changed', dataChanged)

        subscriptions = {
            events: sidecar,
            paths: subscriptionMap || [],
            unsubscribe
        };
    } catch (e: any) {
        return res.send({ error: e.message })
    }



    res.send({ success: true })
})

app.post('/:host/unsubscribe', async (req, res) => {
    if (!subscriptions) return res.send({ error: "No subscription found" });

    try {
        const { events: eventEmitter, unsubscribe } = subscriptions;

        eventEmitter.removeListener('data-changed', dataChanged);
        unsubscribe?.()
    } catch (e: any) {
        return res.send({ error: e.message })
    }
    res.send({ success: true })
})

app.get('/:host/tree', async (req, res) => {
    try {
        const client = await sidecar.connect(req.params.host);

        const tree = await sidecar.browse(client, '/Objects', true, true);
        res.send({ results: tree })
    } catch (e: any) {
        return res.send({ error: e.message })
    }
});

server.listen(OPC_PROXY_PORT, () => {
    console.debug(`Listening on ${OPC_PROXY_PORT}`)
})

process.on('SIGTERM', () => {
    server.close(() => {
        console.debug('Server stopped');
    })
})