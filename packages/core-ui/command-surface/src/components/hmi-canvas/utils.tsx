import React from 'react';
import { useRemoteComponents } from "@hive-command/remote-components";
import {compile, templateSettings, template} from 'dot'
import { HMINode } from '../../';
import {transpile, ModuleKind } from 'typescript'
export interface HMICanvasNode {
    id: string;
    width?: number;
    height?: number;
    zIndex?: number;
    
    scaleX?: number;
    scaleY?: number;
    devicePlaceholder?: any;
    x: number;
    y: number;
    options: any;
    rotation: number;
    type: string;
    icon: any;
}

export type TransformerValue = string | {fn: string} | {connect: string};

export const parseTransformerValue = (value: TransformerValue) => {
    if(typeof(value) === 'string'){
        if(value.match(/{{=.*}}/) != null){
            //Template
            return template(value)()
        }else{
            //Literal
            return value;
        }

    }else if('fn' in value){
        //Parse function into new context and run with values
        value.fn
    }else if('connect' in value){
        //Pull value from connect path in values
    }
}

export const getNodeValues = (node: HMINode) : {[key: string]: any }=> {
    
    
    const templatedKeys = node.dataTransformer?.template?.outputs?.map((x) => x.name) || [];

    let nodeValues = Object.keys(node.options).map((optionKey) => {
        if(templatedKeys.indexOf(optionKey) > -1){
            //Has templated override
            let templateOutput = node.dataTransformer?.template?.outputs?.[templatedKeys.indexOf(optionKey)];

            let templateOverride = node?.dataTransformer?.template?.edges?.find((a) => a.to.id == templateOutput?.id)?.script;
            
            // if(typeof(templateOverride) === 'string'){
            //     //Override is either literal or template
            // }else if(templateOverride.fn){
            //     //Override is function descriptor containing getter/setter
            // }

            //TODO make this run through the normal channel for options
            if(!templateOverride) return {key: optionKey, value: node.options?.[optionKey]}

            const exports : {getter?: (inputs: any) => void, setter?: () => void }= {};
            const module = { exports };
            const func = new Function("module", "exports", transpile(templateOverride, { module: ModuleKind.CommonJS }) );
            func(module, exports);

            return { key: optionKey, value: exports.getter?.({device: {on: true}}) }
        }else{
            let optionValue = node.options?.[optionKey];

            if(typeof(optionValue) === 'string'){
                //Is either literal or template string
                if(optionValue.match(/{{=.*}}/) != null){
                    try{
                        //Try template the optionValue and apply values object to it
                        //Caveats
                        //1. All string values will get templated
                        //2. Values could be incomplete / Circular request
                        return {key: optionKey, value: template(optionValue || '')({valve: {on: false}})}
                    }catch(e){
                        return {key: optionKey, value: optionValue}
                    }
                }
                
                return {key: optionKey, value: optionValue}
            }else{
                //Is function
                const exports : { handler?: () => void }= {};
                const module = { exports };
                const func = new Function("module", "exports", transpile(optionValue.fn, {kind: ModuleKind.CommonJS}) );
                func(module, exports);

                return { key: optionKey, value: exports?.handler?.() };
            }
        }
    }).reduce((prev, curr) => ({
        ...prev,
        [curr.key]: curr.value
    }), {})
    
    return nodeValues;
}  

export const registerNodes = async (nodes: HMICanvasNode[], templatePacks?: any[], values?: any, getPack?: any, functions?: any[]) => {

    //Fetch node component packs

    // console.log("Registering", {nodes})
    console.log({templatePacks, nodes});

    const nodesParsed : HMICanvasNode[] = await Promise.all(nodes.map(async (node) => {

        const [packId, templateName] = (node.type || '').split(':')
        const url = templatePacks?.find((a) => a.id == packId)?.url;

        
        if (url) {
            let base = url.split('/');
            let [url_slug] = base.splice(base.length - 1, 1)
            base = base.join('/');

            const pack = await getPack(packId, `${base}/`, url_slug)

            return {
                ...node,
                icon: pack.find((a: any) => a.name == templateName)?.component
            }
        }

        return { ...node, icon: <div>no icon found</div> };
        // return pack

    }))

    return nodesParsed.map((x) => {
        let width = x.width || x?.icon?.metadata?.width //|| x.type.width ? x.type.width : 50;
        let height = x.height || x?.icon?.metadata?.height //|| x.type.height ? x.type.height : 50;

        let opts = Object.keys(x.options || {}).map((key) => {
            if(x.options[key]?.fn){
                return {key, value: functions?.find((a) => a.id == x.options[key]?.fn)?.fn?.bind(this, x.options[key]?.args)}
            }


            // console.log(template('{{=it.stuff}}', {varname: 'stuff',})({stuff: 'abc'}))
            let value;
            try{
            // console.log({varname, tmpl: x.options[key], values})
                value = template(x.options[key] || '')(values)
            }catch(e){
                value = x.options[key];
            };
//x.options[key] /
            return {key, value: value}
        }).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})

        return {
            id: x.id,
            x: x.x,
            y: x.y,
            zIndex: x.zIndex || 1,
            rotation: x.rotation || 0,
            scaleX: x.scaleX || 1,
            scaleY: x.scaleY || 1,
            width,
            height,

            options: opts,
            //  width: `${x?.type?.width || 50}px`,
            // height: `${x?.type?.height || 50}px`,
            extras: {
                options: x.icon?.metadata?.options || {},
                devicePlaceholder: x.devicePlaceholder,
                rotation: x.rotation || 0,
                zIndex: x.zIndex || 1,
                scaleX: x.scaleX != undefined ? x.scaleX : 1,
                scaleY: x.scaleY != undefined ? x.scaleY : 1,
                // showTotalizer: x.showTotalizer || false,
                ports: x?.icon?.metadata?.ports?.map((y) => ({ ...y, id: y.key })) || [],
                // iconString: x.type?.name,
                icon: x.icon, //HMIIcons[x.type?.name],
                // ports: x?.type?.ports?.map((y) => ({ ...y, id: y.key })) || []
            },
            type: 'hmi-node',

        }
    })
    // setNodes(nodes);

    //Map new info into nodes

    //return map
}