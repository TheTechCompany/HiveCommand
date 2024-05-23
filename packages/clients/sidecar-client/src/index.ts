/*
    Command Client - Native Sidecar

    - provides access for native frontend
    - registers subscriptions
*/
import EventEmitter from 'events'
import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors';
import { Server } from 'socket.io'
import path from 'path';

import { ScadaCommand } from '@hive-command/scada';

const OPC_PROXY_PORT = 8484;

(async () => {

    const scada = new ScadaCommand();

    scada.on('values-changed', (changed) => {
        io.emit('data-changed', changed)
    })

    await scada.setup()

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
            // scada.publish_data(data.key, data.value);

        })
    })

    let subscriptions: {
        events: EventEmitter,
        paths: { tag: string, path: string }[],
        unsubscribe?: () => void
    } | undefined = undefined;


    const dataChanged = (data: any) => {
    }

    app.use(bodyParser.json({limit: '100mb'}));
    app.use(cors());

    app.route('/healthcheck')
        .get((req, res) => {
            res.send({running: true});
        })

    app.route('/setup/drivers')
        .post(async (req, res) => {
            await scada.ensureDrivers(req.body.drivers)

            res.send({success: true});
        })

    app.route('/snapshot')
        .get(async (req, res) => {
            const snapshot = scada.getSnapshot()
            res.send({snapshot})
        })

    app.route('/setup')
        .get(async (req, res) => {
            const mainConfig = scada.getConfig();
            const config = mainConfig?.iot;

            res.send(config ? { ...mainConfig } : { error: "No config" })
        })
        .post(async (req, res) => {
            const mainConfig = req.body.config;

            scada.setConfig(mainConfig);

            const config = mainConfig.iot;


            res.send({ config: scada.getConfig() })
        })

    app.route('/controller/alarms')
        .get(async (req, res) => {
            res.send({result: scada.getAlarmRegister().getAll?.()})
        })
        .post(async (req, res) => {
            let id = req.body.id;

            res.send({result: scada.getAlarmRegister().acknowledge?.(id)})
        })

    app.route('/controller/set_data')
        .post(async (req, res) => {
            // if(subscriptions[req.params.host]) return res.send({error:})

            let { path, value } = req.body;

            const code = await scada.setTag(path, value);

            res.send({ code })
        })

    app.post('/:host/subscribe', async (req, res) => {

        // if (subscriptions) {
        //     // current_data[]
        //     return res.send({
        //         data: scada.values
        //     })
        // };

        // const { subscriptionMap, deviceMap } = scada.getConfig() || {}

        // try {
        //     const client = await scada.connect(req.params.host)

        //     const { unsubscribe } = await scada.subscribe(subscriptionMap || [])

        //     console.log("Subscribed to", subscriptionMap)

        //     scada.on('data-changed', dataChanged)

        //     subscriptions = {
        //         events: scada,
        //         paths: subscriptionMap || [],
        //         unsubscribe
        //     };
        // } catch (e: any) {
        //     return res.send({ error: e.message })
        // }



        res.send({ success: true })
    })

    app.post('/:host/unsubscribe', async (req, res) => {
        if (!subscriptions) return res.send({ error: "No subscription found" });

        try {
            
            const { events: eventEmitter, unsubscribe } = subscriptions;

            eventEmitter.removeListener('data-changed', dataChanged);

        } catch (e: any) {
            return res.send({ error: e.message })
        }
        res.send({ success: true })
    })

    server.listen(OPC_PROXY_PORT, () => {
        console.debug(`Listening on ${OPC_PROXY_PORT}`)
    })

    process.on('SIGTERM', () => {
        server.close(() => {
            console.debug('Server stopped');
        })
    })

})();