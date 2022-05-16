import { all, Config, Output } from "@pulumi/pulumi";
import { Provider } from '@pulumi/kubernetes'
import { RabbitMQDeployment } from "./deployment"
import { RabbitMQService } from "./service"

import * as k8s from '@pulumi/kubernetes'
import { RabbitMQPersistence } from "./persistence";

export default async (provider: Provider, vpcId: Output<any>, namespace: k8s.core.v1.Namespace) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-mq-${suffix}`


    const { storageClaim } = await RabbitMQPersistence(provider, vpcId, namespace)
    const deployment = await RabbitMQDeployment(provider, appName, storageClaim, namespace);

    const service = await RabbitMQService(provider, appName, namespace)

    return {
        deployment,
        service,
        url: all([service.metadata.name, namespace.metadata.name]).apply(([name, namespace]) => `${name}.${namespace}.svc.cluster.local`),
    }
}