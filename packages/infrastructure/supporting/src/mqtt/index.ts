import { all, Config, Input, Output } from "@pulumi/pulumi";
import { Provider } from '@pulumi/kubernetes'
import { RabbitMQDeployment } from "./deployment"
import { RabbitMQService } from "./service"
import * as aws from '@pulumi/aws'
import * as k8s from '@pulumi/kubernetes'
import { RabbitMQPersistence } from "./persistence";

export const MQTT = async (provider: Provider, vpcId: Output<any>, zoneId: Input<string>, domainName: string, authApi: Output<string>, ns: k8s.core.v1.Namespace) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hivecommand-mqtt-${suffix}`

    const { storageClaim } = await RabbitMQPersistence(provider, vpcId, ns)
    const deployment = await RabbitMQDeployment(provider, appName, storageClaim, authApi, ns);

    const service = await RabbitMQService(provider, appName, deployment, ns)


    // Export the URL for the load balanced service.
    const url = service.status.loadBalancer.ingress[0].hostname;
    //service.status.loadBalancer.ingress[0].hostname;

    const gatewayRecord = new aws.route53.Record(`${appName}-dns`, {
        zoneId: zoneId,
        name: domainName,
        type: "A",
        aliases: [{
            name: url,
            zoneId: 'Z1GM3OXH4ZPM65',
            evaluateTargetHealth: true
        }]   
    })

    return {
        endpoint: domainName,
        deployment,
        service,
        url: all([service.metadata.name, ns.metadata.name]).apply(([name, namespace]) => `${name}.${namespace}.svc.cluster.local`),
    }
}