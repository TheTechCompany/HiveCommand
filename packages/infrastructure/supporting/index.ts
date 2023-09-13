import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { MQTTAuth, MQTT } from './src'
import * as k8s from '@pulumi/kubernetes';
import { Config } from "@pulumi/pulumi";

const main = (async () => {

    const config = new Config();
    const org = config.require('org');

    const suffix = config.require('suffix');

    const stackRef = new pulumi.StackReference(`${org}/base-infrastructure/prod`)

    const dbRef = new pulumi.StackReference(`${org}/hexhive-db/db-${suffix}`)

    const kubeconfig = stackRef.getOutput('k3sconfig');
    const vpcId = stackRef.getOutput('vpcId');
    
    const hexhiveZone = await aws.route53.getZone({name: "hexhive.io"})

    const dbUrl = dbRef.getOutput('timescale_url');
    const dbPass = dbRef.getOutput('postgres_pass');

    const provider = new k8s.Provider('eks', { kubeconfig });

    const namespace = new k8s.core.v1.Namespace(`hivecommand-mqtt-${suffix}`, {
        metadata: {
            name: `hivecommand-mqtt-${suffix}`
        }
    }, {
        provider
    })

    const { url } = await MQTTAuth(provider, dbUrl, dbPass, namespace)

    const mqttServer = await MQTT(provider, vpcId, hexhiveZone.zoneId, config.require('mqttEndpoint'), url, namespace)
    
    return {
        internalURL: mqttServer.url,
        externalURL: config.require('mqttEndpoint')
    }
})();

export const internalURL = main.then((res) => res.internalURL)
export const externalURL = main.then((res) => res.externalURL)
