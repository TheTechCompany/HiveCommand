export interface TemplateIO {
    id: string;
    name: string;
    type: string;
}

export interface TransformerTemplate {
    inputs?: TemplateIO[]
    outputs?: TemplateIO[]

    edges?: {to: {id: string}, script: string}[]
}
export interface DataTransformer {
    template: TransformerTemplate

    configuration?: any[];
    options?: any;
}