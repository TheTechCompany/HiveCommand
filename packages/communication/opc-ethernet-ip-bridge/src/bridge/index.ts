
import { CIP, Controller, ControllerManager, ManagedController, Tag } from '@hive-command/ethernet-ip';
import OPCUAServer from '@hive-command/opcua-server'
import { configureServer } from './configure-server';
import { EventEmitter } from 'events'
import { readFileSync } from 'fs';
import { addTag, TAG_TYPE } from '../opc-server';

export interface BridgeOptions {
    host: string,
    slot?: number,
    listenTags?: string,
    configure?: boolean
}

export interface PLCTag extends EventEmitter {
    id: number,
    name: string,
    type: {
        code: number,
        sintPos: number | null,
        typeName: 'BIT_STRING' | 'DINT' | 'BOOL' | 'TIMER' | 'REAL' | 'STRING',
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

export interface EthernetTag {
    key: string,
    tag: Tag | null,
    isArray?: boolean,
    children?: EthernetTag[]
}

export class EthernetIPBridge {


    private options: BridgeOptions;

    private server: OPCUAServer;

    private controllerManager: ControllerManager = new ControllerManager();

    private controller: ManagedController;

    private listenTags: ListenTag[] = [];
    private listenTemplates: ListenTemplate[] = [];

    private tagList: any[] = [];

    private tags : EthernetTag[] = [];

    private childTags : {key: string, tag: Tag | null}[] = [];

    constructor(options: BridgeOptions) {
        this.options = options;

        this.server = new OPCUAServer({
            productName: 'Ethernet IP - OPCUA Bridge'
        })

        this.writeTag = this.writeTag.bind(this);

        this.controller = this.controllerManager.addController(this.options.host, this.options.slot, 500, false);

        this.controller.on('Disconnected', this.onControllerDisconnected.bind(this))
        this.controller.on('Error', this.onControllerError.bind(this));

        if (this.options.listenTags) {
            let tagBundle = JSON.parse(readFileSync(this.options.listenTags, 'utf-8')) || {};
            this.listenTags = tagBundle?.tags || [];
            this.listenTemplates = tagBundle?.templates || [];
        }
    }

    private onControllerDisconnected(){
        console.error('ENIP Controller disconnected');
    }

    private onControllerError(e: any) {
        console.error("Controller level error: ", e)
    }

    private async connectController() {
        try {
            await this.controller.connect();
        } catch (e) {
            console.error(e);
            console.debug('Retrying ENIP connection in 60 seconds...');
            await new Promise((resolve) => setTimeout(() => resolve(true), 60 * 1000));
            await this.connectController();
        }
    }

    private async disconnectController(){
        try{

            await this.controller.disconnect()

        }catch(e){
            console.error(e);
        }
    }

    private async writeTag(tag: Tag, attempt: number = 0){
        console.log("Writing tag", tag.name)
        try{
            if(attempt < 5){
                await this.controller.PLC?.writeTag(tag)
                console.log("Wrote tag", tag.name)
            }else{
                console.error("Tried 5 times to write", tag.name)
            }
            //Fake a failure here to test
        }catch(e){
            console.error(e)
            console.debug('Retrying in 1 second...');

            await new Promise((resolve) => setTimeout(() => resolve(true), 1 * 1000));

            //Reconnection POC
            // await this.disconnectController();
            // console.log("Disconnected...")

            // await new Promise((resolve) => setTimeout(() => resolve(true), 1 * 1000));

            // this.controllerManager = new ControllerManager();

            // this.controller = this.controllerManager.addController(this.options.host, this.options.slot, 500, false);

            // await new Promise((resolve) => setTimeout(() => resolve(true), 1 * 1000));

            // await this.connectController();
            // console.log("Connected...")

            // await new Promise((resolve) => setTimeout(() => resolve(true), 1 * 1000));

            // await this.initTags();
            // console.log("Tags init...")


            await this.writeTag(tag, attempt + 1);
        }
    }

    async initTags(){
        this.tags = [];

        if(this.options.listenTags){
            for(var i = 0; i< this.listenTags.length; i++){

                let tag = this.listenTags[i];

                //Lookup tag in existing tagList to make dataTypes and sizes match
                let fromTagList = this.tagList?.find((a) => a.name == tag.name);
                let fromTagListChildren = (tag.children || []).length > 0 ?
                    tag.children?.map((x) => ({
                        type: (fromTagList?.type.structureObj as any)?.[x.name] || "STRING",
                        name: x.name
                    })).reduce((prev, curr) => ({
                        ...prev,
                        [curr.name]: curr.type
                    }), {}) :
                    undefined;
                
                let isArray = fromTagList.type.arrayDims > 0 && fromTagList.type.typeName !== "BIT_STRING";    
                let arraySize = 0;

                let rootTag: Tag | null = null;

                let childTags = [];

                if (fromTagListChildren) {

                    //Create child tag list from children object

                    childTags = [];

                    if (fromTagListChildren) {
                        Object.keys(fromTagListChildren).forEach((key) => {

                            let type: CIP.DataTypes.Types = CIP.DataTypes.Types[(((fromTagListChildren || {}) as any)[key] || 'DINT') as keyof typeof CIP.DataTypes.Types];

                            childTags.push({ key: key, tag: this.controller.addTag(`${tag.name}.${key}`, null, type) }) //, null, false, type, 10) })
                        })
                    }
                } else {
                    //Create read value from rootTag if array get more specific
                    rootTag = this.controller.addTag(tag.name)

                    if (isArray) {
                        arraySize = await this.controller.PLC?.getTagArraySize(rootTag)

                        childTags = [];
                        for (var idx = 0; idx < arraySize; idx++) {
                            childTags.push({ key: `${idx}`, tag: this.controller.addTag(`${tag.name}[${idx}]`) })
                        }

                        rootTag = null;
                    }
                }

                this.tags.push({ key: tag.name, isArray, tag: rootTag, children: childTags.length > 0 ? childTags : undefined })
            }

        }else{
            for (var i = 0; i < (this.tagList || []).length; i++) {
                let tag = this.tagList[i]
                
                let enipTag = this.controller.addTag(tag.name);
                let childTags : EthernetTag[] = [];

                if (tag.type.structureObj) {
                    Object.keys(tag.type.structureObj).forEach((key) => {
                        

                        childTags.push({ key: key, tag: this.controller.addTag(`${tag.name}.${key}`) })
                    })
                }

                this.tags.push({key: tag.name, tag: enipTag, children: childTags.length > 0 ? childTags : undefined});

            }
        }
    }

    async start() {
        await this.server.start();

        await this.connectController();

        if (this.options.configure && this.controller.PLC) {
            configureServer(this.controller.PLC, this.options.listenTags);
        }


        this.tagList = this.controller.PLC?.tagList?.filter((a) => a.name.indexOf('__') !== 0) || []

        const { listenTemplates, tagList } = this;

        const { properties } = this.controller.PLC || {};

        console.log(`Connected to ${properties?.name} @ ${this.options.host}:${this.options.slot || 0}`);

        console.log(`Found ${this.tagList?.length} tags`);

        await this.initTags();

        if (this.options.listenTags) {
            //Tags have been specified in a tag json file

            for (var i = 0; i < listenTemplates.length; i++) {
                let template = listenTemplates[i];

                let templateKeys = template.children?.map((x) => x.name);

                console.log(`Adding ${this.controller.PLC?.tagList?.filter((a) => a.type.typeName == template.name).length} tags for ${template.name}`)

                this.listenTags = this.listenTags.concat((tagList || []).filter((a) => a.type.typeName == template.name).map((tag) => {
                    return {
                        ...tag,
                        children: template.children?.filter((a) => (templateKeys || []).indexOf(a.name) > -1)
                    }
                }));

            }

            for (var i = 0; i < this.listenTags.length; i++) {

                let tag = this.listenTags[i];

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

                if (!fromTagList?.type.typeName) continue;

                const typeKey = fromTagList.type.typeName as keyof typeof TAG_TYPE;

                const { tag: rootTag, isArray, children } = this.tags.find((a) => a.key === tag.name) || {};

                addTag(this.server, fromTagList?.name || '', TAG_TYPE[typeKey], (key) => {
                    // console.log("Reading ENIP value @ ", Date.now(), enipTag?.value);
                    if (key) {
                        return children?.find((a) => a.key === key)?.tag?.value
                    } else if (!key && children) {
                        return children?.sort((a: any, b: any) => a.key - b.key).map((x) => x.tag?.value)
                    }
                    return rootTag?.value
                }, (value, key) => {
                    if (Array.isArray(value)) {
                        value.map((idx_value, ix) => {
                            // let type = fromTagList?.type. ? Types[fromTagList?.type.typeName] : undefined
                            let t = new Tag(`${tag.name}[${ix}]`, null, fromTagList?.type.code)
                            t.value = idx_value;

                            this.writeTag(t);

                            // this.controller.PLC?.writeTag(t).catch((err) => console.error({ err, type: fromTagList?.type.typeName, value, idx_value }))
                        })
                    } else {
                        if (key) {
                            // if(!enipTag?.value) enipTag.value = {};
                            let tag = children?.find((a) => a.key === key)?.tag
                            if (!tag) return;
                            tag.value = value;

                            this.writeTag(tag);
                            // this.controller.PLC?.writeTag(tag).catch((err) => console.error({ err }));

                        } else if (rootTag) {
                            rootTag.value = value;
                            
                            this.writeTag(rootTag);

                            // this.controller.PLC?.writeTag(rootTag).catch((err) => console.error({ err }));

                        }
                    }

                }, fromTagListChildren, undefined, isArray)

            }

        } else {
            //Tags have not been explicitly set, show all

            for (var i = 0; i < (tagList || []).length; i++) {
                let tag = (tagList || [])[i];

                let { tag: enipTag, children = [] } = this.tags.find((a) => a.key === tag.name) || {};

                if (!tag.type.typeName) continue;

                const typeKey = tag.type.typeName as keyof typeof TAG_TYPE;
      

                addTag(this.server, tag.name, TAG_TYPE[typeKey], () => {
                    return enipTag?.value
                }, (value, key) => {
                    if (enipTag && key) {
                        // if(!enipTag?.value) enipTag.value = {};
                        // (enipTag.value as any)[key] = value.value;

                        let tag = children.find((a) => a.key === key)?.tag
                        if (!tag) return;
                        tag.value = value;

                        this.writeTag(tag);
                        // this.controller.PLC?.writeTag(tag).catch((err) => console.error({ err }));

                    } else if (enipTag) {
                        enipTag.value = value;

                        this.writeTag(enipTag);
                        // this.controller.PLC?.writeTag(enipTag).catch((err) => console.error({ err }));
                    }

                }, tag.type.structureObj);

         
            }
        }

        console.log("OPCUA Server started");
    }




}