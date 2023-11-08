
export interface HMITemplate {
    id: string;
    name: string;

    inputs?: any[];
    outputs?: {id: string, name: string, type: string}[];

    edges?: any[];

}