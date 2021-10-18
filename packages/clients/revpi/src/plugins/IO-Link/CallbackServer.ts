import express from 'express';
import bodyParser from 'body-parser'
import { networkInterfaces } from 'os';

export class IngressServer {
    private app: express.Express;

    private port: number;

    private webhook : (id: number, payload: any) => void;

    constructor(port: number, webhook: (id: number, payload: any) => void){
        this.port = port;

        this.webhook = webhook;

        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.setup();

        this.app.listen(this.port)
    }

    getIP(iface: string = 'eth0'){
        const ifaces = networkInterfaces()
        if(ifaces[iface]){
            return ifaces[iface]?.find((a) => a.family == 'IPv4')?.address
        }
    }

    getCallbackURL(iface: string = 'eth0'){
        let ip = this.getIP(iface);
        if(ip){
            return `http://${ip}:${this.port}/io`
        }
    }

    setup(){
        this.app.route('/io')
            .post((req, res) => {
                // console.log("POST", req.body)
                if(req.body.code === 'event'){
                    let payload = req.body.data.payload;

                    // for(var k in payload){
                    //     console.debug(`Payload Data ${k}`, JSON.stringify(payload[k]))
                    // }

                    this.webhook(req.body.cid, payload)
                }
                res.sendStatus(200)
            })
            .get((req, res) => {
                console.log("QUERY", req.query)
                res.sendStatus(200)
            })
    }

}