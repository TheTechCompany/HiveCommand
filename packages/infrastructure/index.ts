import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Provider } from '@pulumi/kubernetes'
import { Config } from "@pulumi/pulumi";
import * as eks from '@pulumi/eks';
import { Deployment } from './src/deployment'
import { Service } from './src/service'
import SyncServer from './src/sync-server'
import Timeseries from './src/timeseries'
import RabbitMQ from './src/rabbitmq'
import * as k8s from '@pulumi/kubernetes'

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
    const dbUrl = dbRef.getOutput('postgres_name');
    const dbPass = dbRef.getOutput('postgres_pass');

    const provider = new Provider('eks', { kubeconfig });

    const namespace = new k8s.core.v1.Namespace(`hivecommand-sync-${suffix}`, {
        metadata: {
            name: `hivecommand-sync-${suffix}`
        }
    }, {
        provider
    })
    

    const { service: rabbitMQService, url: rabbitURL } = await RabbitMQ(provider, vpcId)
    const { service: timeseriesService, url: timeseriesURL } = await Timeseries(provider, vpcId)

    const { deployment: syncServer } = await SyncServer(provider, timeseriesURL, rabbitURL, namespace)

    const deployment = await rootServer.apply(async (url) => await Deployment(provider, url, dbUrl, dbPass, timeseriesURL, rabbitURL));
    const service = await Service(provider)

    return {
        service,
        deployment,
        timeseriesService,
        syncServer
    }
})()

export const deployment = main.then((res) => res.deployment.metadata.name)

export const service = main.then((res) => res.service.metadata.name)