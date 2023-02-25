import { Provider } from '@pulumi/kubernetes'
import * as k8s from '@pulumi/kubernetes'
import { Deployment } from './deployment'
import { Service } from './service'
import { Config, Input, Output } from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

export const DiscoveryServer = async (provider: Provider, namespace: k8s.core.v1.Namespace, dbUrl: Output<any>, dbPass: Output<any>, discoveryUrl: string, rabbitHost: Output<any>, iotEndpoint: Output<any>) => {

    const config = new Config();

    const hexhiveZone = await aws.route53.getZone({name: "hexhive.io"})

    const suffix = config.require('suffix');
    
    const appName = `hive-command-discovery-server-${suffix}`

    const appLabels = { appClass: appName };

    const deployment = Deployment(provider, namespace, appName, appLabels, dbUrl, dbPass, rabbitHost, iotEndpoint);
    const service = Service(provider, namespace, appName, appLabels, discoveryUrl, hexhiveZone.id);

    return {deployment,service}
}