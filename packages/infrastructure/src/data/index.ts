import { Provider } from "@pulumi/kubernetes";
import { Config, Output } from "@pulumi/pulumi"
import { Deployment } from "./deployment";
import { Persistence } from "./persistence";
import { Service } from "./service";

export const Data = async (provider: Provider, vpcId: Output<any>) => {
    const config = new Config()
    const suffix = config.require('suffix');

    const appName = `hive-command-data-${suffix}`

    // // const { timeseriesPersistence, rabbitPersistence } = await Persistence(provider, vpcId)
    // const dep = await Deployment(provider, appName, timeseriesPersistence, rabbitPersistence)
    // const svc = await Service(provider, appName)

    // return svc.metadata.name.apply(name => `${name}.default.svc.cluster.local`)
}