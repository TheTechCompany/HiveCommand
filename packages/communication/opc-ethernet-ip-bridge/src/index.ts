import { ControllerManager, ManagedController, Tag, TagList } from '@hive-command/ethernet-ip';

import EventEmitter from 'events'

import express from 'express'
import bodyParser from 'body-parser'

import OPCUAServer from '@hive-command/opcua-server'
import { addTag } from './opc-server';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';

export interface PLCTag extends EventEmitter {
    id: number,
    name: string,
    type: {
        code: number,
        sintPos: number | null,
        typeName: 'DINT' | 'BOOL' | 'TIMER' | 'REAL' | 'STRING',
        structure: boolean,
        arrayDims: number,
        reserved: boolean
    }
}

export interface ListenTag {
    name: string,
    children?: ListenTag[]
}

export interface ListenTemplate {
    name: string,
    children?: ListenTemplate[]
}

const READ_BUFFER_TIME = 200;
const CONFIGURE_PORT = 8020;

export interface BridgeOptions {
    host: string,
    slot?: number,
    listenTags?: string,
    configure?: boolean
}

export const EthernetIPBridge = async (options: BridgeOptions) => {

    const { host, slot, listenTags, configure } = options;

    const server = new OPCUAServer({
        productName: 'Ethernet IP - OPCUA Bridge'
    });

    const manager = new ControllerManager();

    const controller : ManagedController = manager.addController(host, slot)

    await server.start();

    if(configure){
        const app = express();

        app.use(bodyParser.json())

        app.use(express.static(path.join(__dirname, './configurator')))

        app.get('/api/tags', (req, res) => {

            //Check if tag already covered by template rule ?

            const tags = controller.PLC?.tagList?.map((tag) => ({
                name: tag.name,
                type: tag.type.typeName,
                children: (tag.type.structureObj && tag.type.typeName !== "STRING") ? Object.keys(tag.type.structureObj || {}).map((x) => ({name: x, type: (tag.type.structureObj as any)?.[x]})) : []
            }));

            res.send(tags)
        });

        app.get('/api/templates', (req, res) => {
            const templates = Object.keys(controller.PLC?.templateList || {}).map((templateKey) => {
                let template = controller.PLC?.templateList?.[templateKey];
                
                return {
                    name: template?._name,
                    children: template?._members
                }
            })
            res.send(templates)
        })

        app.get('/api/whitelist', (req, res) => {

            //Parse whitelist into tags by including templates

            if(!listenTags) return res.send({error: "Please specify --tags in bridge startup"});

            let {tags, templates} = JSON.parse(readFileSync(listenTags, 'utf-8')) || {tags: [], templates: []};
            
            res.send({tags, templates})

        })

        app.post('/api/whitelist', (req, res) => {

            if(!listenTags) return res.send({error: "Please specify --tags in bridge startup"});

            let {tags, templates} = JSON.parse(readFileSync(listenTags, 'utf8')) || {tags: [], templates: []};

            if(!tags) tags = [];
            if(!templates) templates = [];

            let change = {
                type: req.body.type, //tag | template
                add: req.body.add, //add or remove from whitelist
                path: req.body.path, //name.child.child
                name: req.body.name
            }

            
            const deleteNode = (node: any, path: string | undefined, name: string, currentPath?: string) => {
                let path_parts = ([undefined] as any).concat( path ? path.split('.') : [] );
                let curr_path_parts = (currentPath?.split('.') || []).length;

                if(currentPath == path){
                    node.children = node.children.filter((a: any) => a.name != name)
                }else if(node.name == path_parts[curr_path_parts] && node.children.length > 0){
                    for(let i = 0; i < node.children.length; i++){
                        if(node.children[i].name == path_parts[curr_path_parts + 1]){
                            deleteNode(node.children[i], path, name, currentPath ? `${currentPath}.${node.children[i].name}` : node.children[i].name);
                        }
                    }
                }
            }
          
            const insertNode = (node: any, path: string | undefined, name: string, currentPath?: string) => {

                let path_parts = ([undefined] as any).concat(path ? path.split('.') : []);
                let curr_path_parts = (currentPath?.split('.') || [])?.length;

                if(currentPath == path){
                    if(node.children?.map((x: any) => x.name).indexOf(name) < 0){
                        node.children?.push({name, children: []});
                    }
                }else if(node.name == path_parts[curr_path_parts] && node.children.length > 0) {
                    for(let i = 0; i < node?.children?.length; i++){
                        if(node.children[i].name == path_parts[curr_path_parts + 1]){
                            insertNode(node.children[i], path, name, currentPath ? `${currentPath}.${node.children[i].name}` : node.children[i].name)
                        }
                    }
                }
            }

            
            if(change.add){
                insertNode({children: change.type == 'tag' ? tags : templates}, change.path, change.name)
            }else{
                deleteNode({children: change.type == 'tag' ? tags : templates}, change.path, change.name)
            }

            writeFileSync(listenTags, JSON.stringify({tags, templates}), 'utf8')

            res.send({success: true})
        })

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, './configurator/index.html'));
        })

        app.listen(CONFIGURE_PORT, () => {
            console.log(`Configure live on ${CONFIGURE_PORT}`)
        });
    }

    let tags : ListenTag[] = [];
    let templates : ListenTemplate[] = [];

    if(listenTags){
        let tagBundle = JSON.parse(readFileSync(listenTags, 'utf-8')) || {};
        tags = tagBundle?.tags || [];
        templates = tagBundle?.templates || [];
    }


    await controller.connect();
    
    const tagList = controller.PLC?.tagList || []

        // PLC.scan_rate = 500;
        // PLC.scan();

        const { properties } = controller.PLC || {};

        console.log(`Connected to ${properties?.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${tagList?.length} tags`);
      

        if(listenTags){

            for(var i = 0; i < templates.length; i++){
                let template = templates[i];

                let templateKeys = template.children?.map((x) => x.name);

                console.log(`Adding ${controller.PLC?.tagList?.filter((a) => a.type.typeName == template.name).length} tags for ${template.name}`)

                tags = tags.concat( (controller.PLC?.tagList || []).filter((a) => a.type.typeName == template.name).map((tag) => {
                    return {
                        ...tag,
                        children: template.children?.filter((a) => (templateKeys || []).indexOf(a.name) > -1)
                    }
                }) );


            }
            
            for(var i = 0; i < tags.length; i++){

                let tag = tags[i];

                let fromTagList = tagList?.find((a) => a.name == tag.name);
                let fromTagListChildren = (tag.children || []).length > 0 ? 
                    tag.children?.map((x) => ({
                        type: (fromTagList?.type.structureObj as any)?.[x.name] || "STRING", 
                        name: x.name 
                    })).reduce((prev, curr) => ({
                            ...prev,
                            [curr.name]: curr.type
                    }), {}) :
                    undefined;

                const enipTag = controller.addTag(tag.name)

                // try{
                //     await PLC.readTag(enipTag);
                // }catch(e){
                //     console.error({msg: (e as any).message})
                // }

                // PLC.subscribe(enipTag);

                addTag(server, fromTagList?.name || '', fromTagList?.type.typeName || '', () => {
                    return enipTag?.value
                }, (value, key) => {
                    if(enipTag && key){
                        if(!enipTag?.value) enipTag.value = {};
                        (enipTag.value as any)[key] = value;
                    }else if(enipTag){
                        enipTag.value = value;
                    }

                    controller.PLC?.writeTag(enipTag);
                    
                    console.log("Set it")
                }, fromTagListChildren)
                
                // await new Promise((resolve) => setTimeout(() => resolve(true), 200))
            }

        }else{

            for(var i = 0; i < (tagList || []).length; i++){
                let tag = (tagList || [])[i];
                let enipTag = controller.addTag(tag.name);
               
                // try{
                //     await PLC.readTag(enipTag);
                // }catch(e){
                //     console.error({msg: (e as any).message})
                // }

                // PLC.subscribe(enipTag);

                addTag(server, tag.name, tag.type.typeName || '', () => {
                    return enipTag?.value
                }, (value, key) => {
                    if(enipTag && key){
                        if(!enipTag?.value) enipTag.value = {};
                        (enipTag.value as any)[key] = value;
                    }else if(enipTag){
                        enipTag.value = value;
                    }

                    controller.PLC?.writeTag(enipTag);

                    console.log("Set it")
                    
                }, tag.type.structureObj);

                // await new Promise((resolve) => setTimeout(() => resolve(true), 200))

                // tags.push({tag: PLC.newTag(tag.name), type: tag.type, name: tag.name})
            }
        }
       
        // PLC.scan_rate = 500;
        // await PLC.scan();



        console.log("OPCUA Server started");
}