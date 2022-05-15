
export class Timer {

    public hasRun: boolean = false;
    private timeout: number;
    private bypass: boolean = false;

    private timer?: NodeJS.Timeout;

    private success?: (suc: boolean) => void;

    constructor(timeout: number){
        this.timeout = timeout;    
    }

    skip(){
        if(this.timer){
            clearTimeout(this.timer)
            this.success?.(true);
        }
    }

    stop(){
        if(this.timer){
            clearTimeout(this.timer)
        }
    }

    async countDown(){
        return new Promise((resolve, reject) => {
            this.success = resolve;

            this.timer = setTimeout(() => {
                this.hasRun = true;
                resolve(true);
            }, this.timeout)
        })
    }
}