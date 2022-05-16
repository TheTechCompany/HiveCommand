import { all, Config, Output } from "@pulumi/pulumi";
import { Provider } from '@pulumi/kubernetes'
import { TimeseriesDeployment } from "./deployment"
import { TimeseriesService } from "./service";
import { TimeseriesPersistence } from "./persistence";
import * as k8s from '@pulumi/kubernetes'

export default async (provider: Provider, vpcId: Output<any>, namespace: k8s.core.v1.Namespace) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-timeseriesdb-${suffix}`

    const { storagePv, storageClaim } = await TimeseriesPersistence(provider, vpcId, namespace)

    const deployment = await TimeseriesDeployment(provider, appName, storageClaim, namespace);
    const service = await TimeseriesService(provider, appName, namespace)

    return {
        deployment,
        service,
        url: all([service.metadata.name, namespace.metadata.name]).apply(([name, namespace]) => `${name}.${namespace}.svc.cluster.local`),
        storagePv
    }
}