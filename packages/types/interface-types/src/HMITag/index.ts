
export interface HMITag {
    id: string;
    name: string;
    type?: string | null;
    scope?: {
        id: string,
        plugin: {
            module: string
        }
    } | null
}