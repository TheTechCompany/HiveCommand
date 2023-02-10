import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Provider } from '@pulumi/kubernetes'
import { Config } from "@pulumi/pulumi";
import * as eks from '@pulumi/eks';
import { Deployment } from './src/deployment'
import { Service } from './src/service'
// import SyncServer from './src/sync-server'
import { config } from 'dotenv';
import { DiscoveryServer } from './src/discovery-server'
import MQTT from './src/mqtt';

import * as k8s from '@pulumi/kubernetes'

config();


const main = (async () => {

    const config = new Config();
    const org = config.require('org');

    const suffix = config.require('suffix');

    const stackRef = new pulumi.StackReference(`${org}/base-infrastructure/prod`)
    const dbRef = new pulumi.StackReference(`${org}/hexhive-db/db-${suffix}`)
    const gatewayRef = new pulumi.StackReference(`${org}/apps/${suffix}`)

    const vpcId = stackRef.getOutput('vpcId');

    const kubeconfig = stackRef.getOutput('k3sconfig');

    const rootServer = gatewayRef.getOutput('internalGatewayUrl');

    const rabbitURL = dbRef.getOutput('rabbitURL');
    const redisUrl = dbRef.getOutput('redisUrl');
    
    const dbUrl = dbRef.getOutput('timescale_url');
    const mongoUrl = dbRef.getOutput('mongo_url');
    const dbPass = dbRef.getOutput('postgres_pass');

    const hexhiveZone = await aws.route53.getZone({name: "hexhive.io"})

    const provider = new Provider('eks', { kubeconfig });

    const namespace = new k8s.core.v1.Namespace(`hivecommand-sync-${suffix}`, {
        metadata: {
            name: `hivecommand-sync-${suffix}`
        }
    }, {
        provider
    })
    
    const mqttAuth = `hive-command-discovery-server-${suffix}-internal-svc`

    const mqttServer = await MQTT(provider, vpcId, hexhiveZone.zoneId, config.require('mqttEndpoint'), `http://${mqttAuth}.svc.cluster.local`, namespace)
    
    // const { deployment: syncServer } = await SyncServer(provider, dbUrl, dbPass, rabbitURL, mongoUrl, namespace)

    const { deployment: discoveryServer } = await DiscoveryServer(provider, namespace, dbUrl, dbPass, config.require('discoveryUrl'), redisUrl, mqttServer.endpoint)

    const deployment = await rootServer.apply(async (url) => await Deployment(provider, url, dbUrl, dbPass, rabbitURL, mongoUrl, redisUrl));
    const service = await Service(provider)

    return {
        service,
        deployment,
        rabbitURL,
        // syncServer
    }
})()

export const rabbitURL = main.then((res) => res.rabbitURL)

export const deployment = main.then((res) => res.deployment.metadata.name)

export const service = main.then((res) => res.service.metadata.name)