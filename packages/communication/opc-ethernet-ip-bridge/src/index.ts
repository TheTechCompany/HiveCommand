import { Controller, Tag, TagList } from '@hive-command/ethernet-ip';

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

    const PLC = new Controller();

    let valueStore : any = {};

    const tagList = new TagList()

    if(configure){
        const app = express();

        app.use(bodyParser.json())

        app.use(express.static(path.join(__dirname, './configurator')))

        app.get('/api/tags', (req, res) => {

            const tags = PLC.tagList?.map((tag) => ({
                name: tag.name,
                children: Object.keys(tag.type.structureObj || {}).map((x) => ({name: x, type: (tag.type.structureObj as any)?.[x]}))
            }))

            res.send(tags)
        });

        app.get('/api/whitelist', (req, res) => {
            if(!listenTags) return res.send({error: "Please specify --tags in bridge startup"});

            let whitelist = JSON.parse(readFileSync(listenTags, 'utf-8')) || [];
            
            res.send(whitelist)

        })

        app.post('/api/whitelist', (req, res) => {

            if(!listenTags) return res.send({error: "Please specify --tags in bridge startup"});

            let whitelist = JSON.parse(readFileSync(listenTags, 'utf8')) || [];

            let change = {
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
                let curr_path_parts = (currentPath?.split('.') || []).length;

                if(currentPath == path){
                    node.children.push({name, children: []});
                }else if(node.name == path_parts[curr_path_parts] && node.children.length > 0) {
                    for(let i = 0; i < node.children.length; i++){
                        if(node.children[i].name == path_parts[curr_path_parts + 1]){
                            insertNode(node.children[i], path, name, currentPath ? `${currentPath}.${node.children[i].name}` : node.children[i].name)
                        }
                    }
                }
            }

            if(change.add){
                insertNode({children: whitelist}, change.path, change.name)
            }else{
                deleteNode({children: whitelist}, change.path, change.name)
            }

            writeFileSync(listenTags, JSON.stringify(whitelist), 'utf8')
        })

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, './configurator/index.html'));
        })

        app.listen(CONFIGURE_PORT, () => {
            console.log(`Configure live on ${CONFIGURE_PORT}`)
        });
    }

    let tags : ListenTag[] = [];

    if(listenTags)
        tags = JSON.parse(readFileSync(listenTags, 'utf-8'));


    const controller = await PLC.connect(host, slot || 0);


        // PLC.scan_rate = 500;
        // PLC.scan();

        const { properties } = PLC;

        console.log(`Connected to ${properties.name} @ ${host}:${slot || 0}`);

        console.log(`Found ${PLC.tagList?.length} tags`);
      

        if(listenTags){
            
            for(var i = 0; i < tags.length; i++){

                let tag = tags[i];

                let fromTagList = PLC.tagList?.find((a) => a.name == tag.name);
                let fromTagListChildren = (tag.children || []).length > 0 ? 
                    tag.children?.map((x) => ({
                        type: (fromTagList?.type.structureObj as any)[x.name], 
                        name: x.name 
                    })).filter((a) => a.type).reduce((prev, curr) => ({
                            ...prev,
                            [curr.name]: curr.type
                    }), {}) :
                    undefined;

                const enipTag = PLC.newTag(tag.name)

                try{
                    await PLC.readTag(enipTag);
                }catch(e){
                    console.error({msg: (e as any).message})
                }

                PLC.subscribe(enipTag);

                addTag(server, fromTagList?.name || '', fromTagList?.type.typeName || '', () => {
                    return enipTag.value
                }, () => {
                    console.log("Set it")
                }, fromTagListChildren)
                
                // await new Promise((resolve) => setTimeout(() => resolve(true), 200))
            }

        }else{

            for(var i = 0; i < (PLC.tagList || []).length; i++){
                let tag = (PLC.tagList || [])[i];
                let enipTag = PLC.newTag(tag.name);
               
                try{
                    await PLC.readTag(enipTag);
                }catch(e){
                    console.error({msg: (e as any).message})
                }

                PLC.subscribe(enipTag);

                addTag(server, tag.name, tag.type.typeName || '', () => {
                    return enipTag.value
                }, () => {
                    console.log("Set it")
                }, tag.type.structureObj);

                // await new Promise((resolve) => setTimeout(() => resolve(true), 200))

                // tags.push({tag: PLC.newTag(tag.name), type: tag.type, name: tag.name})
            }
        }
       
        PLC.scan_rate = 500;
        await PLC.scan();

        await server.start();


        console.log("OPCUA Server started");
}