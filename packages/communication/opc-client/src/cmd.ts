#!/usr/bin/env node

import { Command } from 'commander'
import OPC from './index';

const pkg = require('../package.json')

const program = new Command();

program.version(pkg.version)
    .arguments('<server> [path]')
    .description('Browse OPC-UA Server by path', {
        server: "OPC-UA Server",
        path: "OPC-UA Path to browse"
    }).action(async (server, path) => {
        let client = new OPC()

        console.log(`Connecting to ${server} ...`)
        await client.connect(server)
        console.log(`Connected`)

        console.log(`Browsing ${path}`)
        const result = await client.browse(path)

        // const path_id = await client.getPathID(path)
        console.log(result?.references?.map((x) => x.typeDefinition.toJSON()))
        console.log(result?.references?.map((x) => x.browseName.toString()))

                await client.disconnect();

    })

program.parse();