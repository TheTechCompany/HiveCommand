import { EthernetIPBridge } from "../src";

(async () => {

    const bridge= new EthernetIPBridge({
        host: '192.168.108.33'
    });


    bridge.start();

})();