import sensorFactory from './sensors'
import actuatorFactory from './actuators'
import { Namespace } from 'node-opcua'

export default (namespace: Namespace) => {
    let actuators = actuatorFactory(namespace)
    let sensors = sensorFactory(namespace)

    return {
        ...actuators,
        ...sensors
    }
}