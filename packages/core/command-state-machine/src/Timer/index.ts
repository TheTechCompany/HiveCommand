
export class Timer {
    public hasRun: boolean = false;
    private timeout: number;

    constructor(timeout: number){
        this.timeout = timeout;    
    }

    async countDown(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.hasRun = true;
                resolve(true);
            }, this.timeout)
        })
    }
}