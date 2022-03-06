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
        await sendSMS(this.options.number, this.options.messagePrefix + " " + msg, this.options.username, this.options.password);
    }
}