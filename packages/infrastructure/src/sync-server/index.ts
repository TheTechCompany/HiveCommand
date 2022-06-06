import { Provider } from '@pulumi/kubernetes'
import { Config, Output } from '@pulumi/pulumi'
import { StorageClaim } from './claim';
import { Deployment } from './deployment'
import * as k8s from '@pulumi/kubernetes'

export default async (provider: Provider, dbUrl: Output<any>, dbPass: Output<any>, rabbitHost: Output<any>, namespace: k8s.core.v1.Namespace) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-sync-${suffix}`

    const storageClaim = await StorageClaim(provider, namespace)
    const deployment = await Deployment(provider, appName, dbUrl, dbPass, rabbitHost, storageClaim, namespace)

    return {
        deployment
    }
}