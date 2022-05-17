import { all, Config, Output } from "@pulumi/pulumi";
import { Provider } from '@pulumi/kubernetes'
import { TimeseriesDeployment } from "./deployment"
import { TimeseriesService } from "./service";
import { TimeseriesPersistence } from "./persistence";
import * as k8s from '@pulumi/kubernetes'

export default async (provider: Provider, vpcId: Output<any>) => {

    const config = new Config();

    const suffix = config.require('suffix');

    const appName = `hive-command-timeseriesdb-${suffix}`

    const { storagePv, storageClaim } = await TimeseriesPersistence(provider, vpcId)

    const deployment = await TimeseriesDeployment(provider, appName, storageClaim);
    const service = await TimeseriesService(provider, appName)

    return {
        deployment,
        service,
        url: all([service.metadata.name, 'default']).apply(([name, namespace]) => `${name}.${namespace}.svc.cluster.local`),
        storagePv
    }
}