import { Node, Edge } from 'reactflow';

export interface ElectricalPage {
    id?: string;
    name?: string;
    rank?: string;

    nodes?: Node[]
    edges?: Edge[]

    number?: number;
}
