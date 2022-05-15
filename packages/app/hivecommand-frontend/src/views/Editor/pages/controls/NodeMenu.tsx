import { BallValve, Blower, Conductivity, Sump, DosingPump, DiaphragmValve, UfMembrane, Filter, FlowSensor, PressureSensor, Pump, SpeedController, Tank, BlowerSparge, NfMembrane, DosingTank } from '../../../../assets/hmi-elements';

export default [
    {
        icon: <Blower width="40px" height="40px" />,
        label: "Blower",
        width: 50,
        height: 50,
        extras: {
            icon: "Blower",
            ports: [
                {
                    id: 'out',
                    x: -30,
                    y: 25
                }
            ]
        }
    },
    {
        icon: <Pump width="40px" height="40px" />,
        label: "Pump",
        extras: {
            icon: "Pump",
            ports: [
                {
                    id: 'in',
                    x: -30,
                    y:  35
                },
                {
                    id: 'out',
                    x: 90,
                    y: 45,
                    rotation: 180
                }
            ]
        }
    },
    {
        icon: <DosingPump width="40px" height="40px"/>,
        label: "Dosing Pump",
        extras: {
            icon: "DosingPump",
        }
    },
    {
        icon: <BallValve width="40px" height="40px" />,
        label: "Ball Valve",
        extras: {
            icon: "BallValve",
            ports: [
                {
                    id: 'in',
                    x: -40,
                    y: 35
                },
                {
                    id: 'out',
                    x: 100,
                    y: 55,
                    rotation: 180
                }
            ]
        }
    },
    {
        icon: <DiaphragmValve width="40px" height="40px" />,
        label: "Diaphragm Valve",
        extras: {
            icon: "DiaphragmValve",
            ports: [
                {
                    id: 'in',
                    x: -40,
                    y: 35
                },
                {
                    id: 'out',
                    x: 100,
                    y: 55,
                    rotation: 180
                }
            ]
        }
    },
    {
        icon: <Tank width="40px" height="40px" />,
        label: "Tank",
        extras: {
            icon: "Tank",
            ports: [
                {
                    id: 'in',
                    x: 10,
                    y: -20,
                    rotation: 90
                },
                {
                    id: 'out',
                    x: 70,
                    y: -20,
                    rotation: 90
                }
            ]
        }
    },
    {
        icon: <DosingTank width="40px" height="40px" />,
        label: "Dosing Tank",
        extras: {
            icon: "DosingTank",
            ports: [
            {
                id: 'outlet',
                x: 50,
                y: 65
            }
            ]
        }
    },
    {
        icon: <PressureSensor width="40px" height="40px" />,
        label: "Pressure Sensor",
        extras: {
            icon: "PressureSensor",
            ports: [
                {
                    id: 'in',
                    x: -5,
                    y: 65
                },
                {
                    id: 'out',
                    x: 70,
                    y: 82,
                    rotation: 180
                }
            ]
        }
    },
    {
        icon: <FlowSensor width="40px" height="40px" />,
        label: "Flow Sensor",
        extras: {
            icon: "FlowSensor",
            ports: [
                {
                    id: 'in',
                    x: -5,
                    y: 65
                },
                {
                    id: 'out',
                    x: 70,
                    y: 82,
                    rotation: 180
                }
            ]
        }
    },
    {
        icon: <Conductivity width="40px" height="40px" />,
        label: "Conductivity Sensor",
        extras: {
            icon: "Conductivity",
            ports: [
                {
                    id: 'in',
                    x: -5,
                    y: 65
                },
                {
                    id: 'out',
                    x: 70,
                    y: 82,
                    rotation: 180
                }
            ]
        }
    },
    {
        icon: <SpeedController width="40px" height="40px" />,
        label: "Speed Controller",
        extras: {
            icon: "SpeedController" 
        }
    },
    {
        icon: <UfMembrane width="40px" height="40px" />,
        label: "UF Membrane",
        extras: {
            icon: "UfMembrane"
        }
    },
    {
        icon: <NfMembrane width="40px" height="40px" />,
        label: "NF Membrane",
        extras: {
            icon: "NfMembrane"
        }
    },
    {
        icon: <BlowerSparge width="40px" height="40px" />,
        label: "Blower Sparge",
        extras: {
            icon: "BlowerSparge"
        }
    },
    {
        icon: <Sump width="40px" height="40px" />,
        label: "Sump",
        extras: {
            icon: "Sump"
        }
    }
]