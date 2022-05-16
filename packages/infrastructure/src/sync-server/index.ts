import { Provider } from '@pulumi/kubernetes'
import { Config, Output } from '@pulumi/pulumi'
import { Deployment } from './deployment'
import * as k8s from '@pulumi/kubernetes'

export default async (provider: Provider, timeseriesHost: Output<any>, rabbitHost: Output<any>, namespace: k8s.core.v1.Namespace) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-sync-${suffix}`

    const deployment = await Deployment(provider, appName, timeseriesHost, rabbitHost, namespace)

    return {
        deployment
    }
}