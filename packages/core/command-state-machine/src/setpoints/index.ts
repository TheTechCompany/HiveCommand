import { CommandSetpoint } from "@hive-command/data-types";

export class SetpointManager {

    private setpoints: CommandSetpoint[];


    constructor(setpoints: CommandSetpoint[]){
        this.setpoints = setpoints;
    }

    get(id: string){
        return this.setpoints.find((a) => a.id == id)?.value;
    }

    set(id: string, value: string){
        let ix = this.setpoints.map((x) => x.id).indexOf(id);
        if(ix > -1){
            this.setpoints[ix].value = value;
        }
    }   

}