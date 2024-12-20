import { FnTranspileOptions, load_exports, parseValue } from "@hive-command/scripting";
import { DataType } from "node-opcua";
import {transpile, ModuleKind} from 'typescript';
import { OPCMQTTClient, SidecarOptions } from "..";

export class Runner {

    private client: OPCMQTTClient;

    private transformers : {path: string, fn: (values: any) => any}[] = [];

    constructor(client: OPCMQTTClient){   
        this.client = client;

        this.setupTransformers()

        this.client.on('config-update', () => {
            this.setupTransformers()
        })

        this.getTag = this.getTag.bind(this);
        this.setTag = this.setTag.bind(this);

    }

    get options(){
        return this.client.getConfig();
    }

    private setupTransformers(){

        this.transformers = (this.options?.deviceMap || []).map((deviceMap) => {
            let tagValue = deviceMap.tag;
            
            if (tagValue?.indexOf('script://') == 0) {
                const jsCode = transpile(tagValue?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', FnTranspileOptions)
                const { getter, setter } = load_exports(jsCode)
            
                return {path: deviceMap.path, fn: (valueStructure: any) => getter(valueStructure)};
            } else{
                let rawTag = this.options?.subscriptionMap?.find((a) => a.path == tagValue)?.tag;

                if(!rawTag) return {path: deviceMap.path, fn: (valueStructure: any) => null};

                return {path: deviceMap.path, fn: (valueStructure: any) => rawTag?.split('.').reduce((prev, curr) => prev[curr], valueStructure)}
            }
        })
    }

    getTag(tagPath: string, tagType: string, valueStructure: any) {

        let fn = this.transformers?.find((a) => a.path === tagPath)?.fn;

        return parseValue(tagType, fn?.(valueStructure));

    }

    /*
        tagPath: AV101.open
    */
    async setTag(allValues: any, tagPath: string, value: any) : Promise<{tag: string, dataType: DataType, value: any}[] | null> {

        let setValues : {tag: string, dataType: DataType, value: any}[] = [];

        const { deviceMap, tags, types, subscriptionMap } = this.options || {}

        let rootTag = tags?.find((a) => a.name === tagPath?.split('.')?.[0])
        let rootType = types?.find((a) => a.name === rootTag?.type) || rootTag?.type;
        let childTag;
        
        if(typeof(rootType) === "string"){
            value = parseValue(rootType, value);
        }else{
            childTag = rootType?.fields.find((a) => a.name === tagPath?.split('.')?.[1])
            if(childTag){
                value = parseValue(childTag?.type, value)
            }
        };

        let tag = deviceMap?.find((a) => a.path == tagPath)?.tag;

        if (tag?.indexOf('script://') == 0) {

            const jsCode = transpile(tag?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', FnTranspileOptions)
            const { getter, setter } = load_exports(jsCode)

            await new Promise((resolve, reject) => {

                setter(value, allValues, async (values: any) => {

                    let tags = this.client.getTagPaths(values) //.reduce((prev: any, curr: any) => [...prev, ...curr], []);
    
                    console.log({tags});

                    let newValues: ({ path: string, value: any } | null)[] = tags.map((t: any) => {
    
                        let path = subscriptionMap?.find((a) => a.tag?.replace(/[ -]/g, '_') == t.parent)?.path
    
                        if (!path) return null;
    
                        return {
                            path,
                            value: t.tag
                        }
    
                    })

                    console.log({newValues})
    
                    for (value of newValues) {
                            const { type: dt, isArray } = await this.client.getDataType(value.path) || {}
    
                            setValues.push({
                                tag: value.path,
                                dataType: (DataType as any)[dt as any],
                                value: value.value
                            })
                    }
                    resolve(true)
    
                })
            }) 
        } else {
            if (!tag) return null; //valueFn([]);

            const { type: dt, isArray } = await this.client.getDataType(tag) || {}

            setValues.push({
                tag,
                dataType: (DataType as any)[dt as any],
                value
            })

        }
        // }
        return setValues

    }

}