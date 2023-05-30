import { EthernetIPBridge } from "../src";

(async () => {

    const bridge= new EthernetIPBridge({
        host: '192.168.108.33',
        listenTags: {
            tags: [{name: 'A'}, {name: 'B'}, {name: 'C'}, {name: 'D'}]
        }
    });


    bridge.start();

})();