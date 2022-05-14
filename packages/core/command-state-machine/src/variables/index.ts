import { CommandVariable } from "@hive-command/data-types";

export class VariableManager {

    private variableState: CommandVariable[];

    private variables : any;

    constructor(variables: CommandVariable[]){
        this.variableState = variables;

        this.variables = this.variableState.reduce((prev, curr) => {
            return {
                ...prev,
                [curr.name]: curr.defaultValue
            }
        }, {})
    }

    updateVar(key: string, value: any){
        this.variables[key] = value;
    }

    getVar(key: string){
        return this.variables[key];
    }
}