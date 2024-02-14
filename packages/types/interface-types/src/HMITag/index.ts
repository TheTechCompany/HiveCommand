
export interface HMITag {
    id: string;
    name: string;
    type: string;
    scope?: {
        id: string,
        plugin: {
            module: string
        }
    }
}