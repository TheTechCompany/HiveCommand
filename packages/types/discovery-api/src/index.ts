export interface GDSNetworkLayout {
    deviceMapping: device?.deviceMapping || [],
    deviceId: string

    dataScopes: device.activeProgram?.dataScopes || [],

    alarmPathways: (device.activeProgram?.alarmPathways || []).filter((pathway) => pathway.scope?.toLowerCase() == "local"),

    iotEndpoint: IOT_ENDPOINT,
    iotSubject: process.env.IOT_EXCHANGE,
    iotUser: device.network_name,
    iotToken: token
}