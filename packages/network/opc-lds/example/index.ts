import { DiscoveryService } from '../src'

const discoveryServer = new DiscoveryService({
    port: 4840,
    automaticallyAcceptUnknownCertificate: true,
    force: true,
    applicationName: 'HiveCommand OPCUA',
    fqdn: 'staging_discovery.hexhive.io'
})

discoveryServer.init().then(() => {
    discoveryServer.start().then(() => {


    })
})