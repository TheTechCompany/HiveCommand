export interface TemplateIO {
    id: string;
    name: string;
    type: string;
}

export interface TransformerTemplate {
    inputs?: TemplateIO[]
    outputs?: TemplateIO[]

    edges?: { to: { id: string }, script: string }[]
}
export interface DataTransformer {
    template: TransformerTemplate

    configuration?: any[];
    options?: any;
}

export interface DataScope {
    id: string
    name: string
    description: string | null

    plugin: { 
        id: string; 
        name: string; 
        module: string; 
        configuration: any; 
    };

    configuration: any

}