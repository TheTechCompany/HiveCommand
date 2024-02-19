

export interface HMIType {
    id: string;
    name: string;
    fields: HMITypeField[];
}

export interface HMITypeField {
    id: string, 
    name: string, 
    type?: string | null
}
