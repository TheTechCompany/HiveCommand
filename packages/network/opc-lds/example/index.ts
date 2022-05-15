import { DiscoveryService } from '../src'

const discoveryServer = new DiscoveryService({
    port: 4840,
    automaticallyAcceptUnknownCertificate: true,
    force: true,
    applicationName: 'Discovery-Server',
    fqdn: 'dev.hexhive.io'
})

discoveryServer.init().then(() => {
    discoveryServer.start().then(() => {


    })
})