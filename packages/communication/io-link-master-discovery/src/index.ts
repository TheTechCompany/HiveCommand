const arpScan = require('arpscan/promise')

export interface ArpResponse {
    ip: string;
    mac: string;
    vendor: string;
    timestamp: number;
}

/**
 * Returns a list of devices on the arp table that match a mac prefix
 * 
 * @param {string} iface - Network interface to search on (default eth0) 
 * @param {string} macPrefix - Mac prefix to search for (default to "00:02:01" : ifm)
 * @param {boolean} sudo - Run command as sudo (necessary for revpi)
 * @returns {Promise}
 * 
 */
export const scanNetwork = async (
        iface: string = 'eth0', 
        macPrefix: string = '00:02:01', 
        sudo: boolean = true
    ): Promise<ArpResponse[]> => {

    const network = await arpScan({ interface: iface, sudo }) || []
    return network.filter((a: ArpResponse) => !macPrefix || a.mac.indexOf(macPrefix) > -1)
}
