import { load_exports, parseValue } from "@hive-command/scripting";
import { DataType } from "node-opcua";
import {transpile, ModuleKind} from 'typescript';
import { OPCMQTTClient, SidecarOptions } from "..";

export class Runner {

    private client: OPCMQTTClient;

    constructor(client: OPCMQTTClient){   
        this.client = client;

        this.getTag = this.getTag.bind(this);
        this.setTag = this.setTag.bind(this);
    }

    get options(){
        return this.client.options;
    }

    getTag(tagPath: string, tagType: string, valueStructure: any) {

        const { deviceMap, subscriptionMap } = this.options || {}
        let tagValue = deviceMap?.find((a) => a.path === tagPath)?.tag;

        if (tagValue?.indexOf('script://') == 0) {
            const jsCode = transpile(tagValue?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', { module: ModuleKind.CommonJS })
            const { getter, setter } = load_exports(jsCode)

            return parseValue(tagType, getter(valueStructure));
        } else {
            let rawTag = subscriptionMap?.find((a) => a.path == tagValue)?.tag

            if (!rawTag) return null;

            return parseValue(tagType, rawTag?.split('.').reduce((prev, curr) => prev[curr], valueStructure))
        }

    }


    async setTag(allValues: any, tagPath: string, value: any) : Promise<{tag: string, dataType: DataType, value: any}[] | null> {
        // if (!this.client) return;

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

        // const setTag = (path: string, value: any, valueFn: (values: {path: string, value: any}[] ) => void ) => {
        let tag = deviceMap?.find((a) => a.path == tagPath)?.tag;

        if (tag?.indexOf('script://') == 0) {

            const jsCode = transpile(tag?.match(/script:\/\/([.\s\S]+)/)?.[1] || '', { module: ModuleKind.CommonJS })
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
                        // if (this.client) {
                            const { type: dt, isArray } = await this.client.getDataType(value.path) || {}
    
                            setValues.push({
                                tag: value.path,
                                dataType: (DataType as any)[dt as any],
                                value: value.value
                            })
                            // await this.setData(this.client, value.path, (DataType as any)[dt as any], value.value)
                        // }
    
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
            // await this.setData(this.client, tag, (DataType as any)[dt as any], value)

        }
        // }
        return setValues

    }

}