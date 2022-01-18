export interface AgentInformation {
    applicationName: string;
    version: string;
}

/*
    Runner

    - Sends heartbeat with agent information
    - Join web-socket room
*/