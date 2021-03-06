import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Provider } from '@pulumi/kubernetes'
import { Config } from "@pulumi/pulumi";
import * as eks from '@pulumi/eks';
import { Deployment } from './src/deployment'
import { Service } from './src/service'
import SyncServer from './src/sync-server'
import { config } from 'dotenv';

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

    const kubeconfig = stackRef.getOutput('kubeconfig');

    const rootServer = gatewayRef.getOutput('gatewayUrl');

    const rabbitURL = dbRef.getOutput('rabbitURL');
    
    const dbUrl = dbRef.getOutput('timescale_url');
    const mongoUrl = dbRef.getOutput('mongo_url');
    const dbPass = dbRef.getOutput('postgres_pass');

    const provider = new Provider('eks', { kubeconfig });

    const namespace = new k8s.core.v1.Namespace(`hivecommand-sync-${suffix}`, {
        metadata: {
            name: `hivecommand-sync-${suffix}`
        }
    }, {
        provider
    })
    
    const { deployment: syncServer } = await SyncServer(provider, dbUrl, dbPass, rabbitURL, mongoUrl, namespace)

    const deployment = await rootServer.apply(async (url) => await Deployment(provider, url, dbUrl, dbPass, rabbitURL, mongoUrl));
    const service = await Service(provider)

    return {
        service,
        deployment,
        rabbitURL,
        syncServer
    }
})()

export const rabbitURL = main.then((res) => res.rabbitURL)

export const deployment = main.then((res) => res.deployment.metadata.name)

export const service = main.then((res) => res.service.metadata.name)