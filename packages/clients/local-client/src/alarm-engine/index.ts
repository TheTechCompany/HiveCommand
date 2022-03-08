import { sendSMS } from "@hive-command/sms";

export interface AlarmEngineOptions {
    
	number: string,
	messagePrefix?: string,
	username: string,
	password: string
	
}

export class AlarmEngine {
    private options: AlarmEngineOptions;

    constructor(options: AlarmEngineOptions){
        this.options = options;
    }

    async send(msg: string){
        console.log(`Sending alarm: ${msg}`)
        try{
            await sendSMS(this.options.number, this.options.messagePrefix + " " + msg, this.options.username, this.options.password);
        }catch(e){
            console.log(`Failed to send alarm: ${msg}`, e)
        }
    }
}