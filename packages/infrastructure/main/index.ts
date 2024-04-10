import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Provider } from '@pulumi/kubernetes'
import { all, Config } from "@pulumi/pulumi";
import * as eks from '@pulumi/eks';
import { Deployment } from './src/deployment'
import { Service } from './src/service'
// import SyncServer from './src/sync-server'
import { config } from 'dotenv';
import { DiscoveryServer } from './src/discovery-server'
import { RecoveryServer } from './src/recovery-server'

import * as k8s from '@pulumi/kubernetes'

config();


const main = (async () => {

    const config = new Config();
    const org = config.require('org');

    const suffix = config.require('suffix');

    const stackRef = new pulumi.StackReference(`${org}/base-infrastructure/prod`)
    
    const dbRef = new pulumi.StackReference(`${org}/hexhive-db/db-${suffix}`)

    const gatewayRef = new pulumi.StackReference(`${org}/apps/${suffix}`)

    const mqttRef = new pulumi.StackReference(`${org}/hivecommand-mqtt/mqtt-${suffix}`);

    const lambdaRef = new pulumi.StackReference(`${org}/hivecommand-lambdas/lambdas-${suffix}`)

    const vpcId = stackRef.getOutput('vpcId');

    const kubeconfig = stackRef.getOutput('k3sconfig');

    const rootServer = gatewayRef.getOutput('internalGatewayUrl');

    const rabbitURL = dbRef.getOutput('rabbitURL');
    const redisUrl = dbRef.getOutput('redisUrl');
    
    const dbUrl = dbRef.getOutput('timescale_url');
    const mongoUrl = dbRef.getOutput('mongo_url');
    const dbPass = dbRef.getOutput('postgres_pass');

    const internalURL = mqttRef.getOutput('internalURL');
    const externalURL = mqttRef.getOutput('externalURL');

    const exportLambda = lambdaRef.getOutput('exportFunction');


    const exportLambda = lambdaRef.getOutput('exportFunction');

    // const reportBotBucket = lambdaRef.getOutput('reportBotBucket');
    // const hexhiveZone = await aws.route53.getZone({name: "hexhive.io"})

    const provider = new Provider('eks', { 
        kubeconfig
    });

    const namespace = new k8s.core.v1.Namespace(`hivecommand-sync-${suffix}`, {
        metadata: {
            name: `hivecommand-sync-${suffix}`
        }
    }, {
        provider
    })

    const { deployment: discoveryServer } = await DiscoveryServer(provider, namespace, dbUrl, dbPass, config.require('discoveryUrl'), redisUrl, externalURL)
    const { deployment: recoveryServer } = await RecoveryServer(provider, namespace, dbUrl, dbPass, redisUrl, externalURL)


    const deployment = await all([rootServer, internalURL, exportLambda]).apply(async ([url, internal, lambdaFn]) => await Deployment(provider, url, dbUrl, dbPass, rabbitURL, mongoUrl, redisUrl, `mqtt://${internal}`, lambdaFn));
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