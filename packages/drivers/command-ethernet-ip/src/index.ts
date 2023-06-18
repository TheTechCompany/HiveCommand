
import { BaseCommandDriver, DriverOptions, DriverSubscription } from '@hive-command/drivers-base';
import { CIP, ControllerManager, ManagedController, Structure, Tag, Types } from '@hive-command/ethernet-ip'
import { Observable } from 'threads/observable';

interface ENIPTag {
    name: string, 
    tag: Tag | null,
    children?: ENIPTag[]
    isArray?: boolean

    type?: any,
    getter?: () => any,
    setter?: (value: any) => void
}
export default class EthernetIPDriver extends BaseCommandDriver {

    private controllerManager: ControllerManager = new ControllerManager();

    private controller: ManagedController;

    private _tags: { [key: string]: Tag | null } = {};

    private commandTags : ENIPTag[] = [];

    constructor(options: DriverOptions) {
        super(options);

        this.controller = this.controllerManager.addController(
            this.options.configuration?.host,
            this.options.configuration?.slot,
            this.options.configuration?.rpi,
            this.options.configuration?.connected
        )

        this.controller.on('Connected', () => {
            console.log("PLC connected...")
        })

        this.controller.on('Disconnected', () => {
            console.log("PLC disconnected...")
        })

        this.controller.on('Error', (e) => {
            console.error(e);
        })

        // this.controller.PLC.ta
        console.log(this.options)
    }

    async start() {
        try {
            await this.controller.connect()
        } catch (e) {
            console.error("Error starting driver", e);
        }
    }

    subscribe(tags: { name: string; alias?: string; }[]): Observable<{ [key: string]: any }> {

        return new Observable((observer) => {

            Promise.all(tags.map(async (tag) => {

                const plcTag = await this.addTag(tag.name) 

                if(!plcTag) return;

                //Observe for array changes here too
                plcTag?.tag?.on('Initialized', (data: { value: Structure | Tag }) => {
                    observer.next({ [tag.name]: data.value });
                })

                plcTag?.tag?.on('Changed', (data: { value: Tag | Structure }) => {
                    observer.next({ [tag.name]: data.value });
                })

            }))

        })
    }

    async read(tag: { name: string; alias?: string; }) {
        let plcTag = await this.addTag(tag.name)
        
        if (!plcTag) throw new Error(`Couldn't add tag ${tag.name}`)

        if(plcTag.tag){
            await this.controller.PLC?.readTag(plcTag.tag);
        }else if((plcTag.children || []).length > 0){
            await Promise.all((plcTag.children || []).map(async (x: any) => {
                await this.controller.PLC?.readTag(x.tag)
            }))
        }

        return plcTag?.getter?.() //tag.value;
    }

    private async writeTag(tag: Tag){
        try{
            await this.controller.PLC?.writeTag(tag);
        }catch(e){
            console.log(tag.name, tag.value, e)
        }
    }

    async write(tag: string, value: any) {
        let plcTag = await this.addTag(tag);
        
        // this.controller.PLC?.readTag()
        if (!plcTag) throw new Error(`Couldn't add tag ${tag}`)

        if (Array.isArray(value)) {
            await Promise.all(value.map(async (idx_value, ix) => {
                // let type = fromTagList?.type. ? Types[fromTagList?.type.typeName] : undefined

                let t =  plcTag.children?.find((a) => a.name == `${ix}`)?.tag 
//                new Tag(`${tag}[${ix}]`, null, plcTag.tag?.type as any)
                if(t){
                    t.value = idx_value;
                    await this.writeTag(t);
                }

                // this.controller.PLC?.writeTag(t).catch((err) => console.error({ err, type: fromTagList?.type.typeName, value, idx_value }))
            }))
        } else {
            if (typeof(value) == 'object') {

                await Promise.all(Object.keys(value).map(async (valueKey) => {
                    let tag = plcTag.children?.find((a) => a.name == valueKey)?.tag
                    if(!tag) return;
                    tag.value = value[valueKey]
                    
                    await this.writeTag(tag)
                }))
              
                // this.controller.PLC?.writeTag(tag).catch((err) => console.error({ err }));

            } else if (plcTag.tag) {
                plcTag.tag.value = value;
                
                await this.writeTag(plcTag.tag);

                // this.controller.PLC?.writeTag(rootTag).catch((err) => console.error({ err }));

            }
        }

        // plcTag.tag.value = value;
        console.log("Writing tag", tag, value);
        // await this.controller.PLC?.writeTag(plcTag)
    }


    private async addTag(tagName: string) : Promise<ENIPTag> {

        //Check for tag in internal store before recreating
        let existingTag = this.commandTags.find((a) => a.name == tagName)
        if(existingTag){
            return existingTag
        }

        //Get tag from PLC
        let tag = this.controller.PLC?.tagList?.find((a) => a.name == tagName)

        if (!tag) throw new Error("Couldn't add tag" + tagName)

        //Unwrap and rewrap potential structureObj so we can default the type to "STRING"
        //May be unecessary keeping for posterity as at 12-06-23
        let tagKeys = Object.keys(tag?.type.structureObj || {}).length > 0 ?
            Object.keys(tag.type?.structureObj || {}).map((key) => ({
                name: key,
                type: (tag?.type?.structureObj as any)?.[key] || "STRING"
            })).reduce((prev, curr) => ({ ...prev, [curr.name]: curr.type }), {}) :
            undefined;

        //Get correct tag type from PLC
        const isArray = tag.type.arrayDims > 0 && tag.type.typeName !== "BIT_STRING";
        let arraySize = 0; //await this.controller.PLC?.getTagArraySize(tagName)
                // let arraySize = 0;

        let rootTag: Tag | null = null;

        let childTags : ENIPTag[] = [];

        if (tagKeys) {
            //Tag is likely a struct
            childTags = [];

            Object.keys(tagKeys).forEach((key) => {

                let type: CIP.DataTypes.Types = CIP.DataTypes.Types[(((tagKeys || {}) as any)[key] || 'DINT') as keyof typeof CIP.DataTypes.Types];

                childTags.push({ name: key, tag: this.controller.addTag(`${tag?.name}.${key}`, tag?.program, type) }) //, null, false, type, 10) })
            })
        } else {
            //Tag is either a scalar or array
            rootTag = this.controller.addTag(tagName, tag.program)

            if (isArray) {
                //Tag is an array
                arraySize = await this.controller.PLC?.getTagArraySize(rootTag)

                childTags = [];

                for (var idx = 0; idx < arraySize; idx++) {
                    childTags.push({ name: `${idx}`, type: rootTag?.type, tag: this.controller.addTag(`${tag.name}[${idx}]`, tag.program, Types[rootTag?.type as any] as any ) })
                }

                rootTag = null;

            }

        }

        return {
            name: tag.name,
            isArray,
            tag: rootTag,
            children: childTags.length > 0 ? childTags : undefined,
            getter: () => {
                if(childTags.length > 0){
                    return isArray ? childTags.sort((a,b) => a.name.localeCompare(b.name)).map((x) => x.tag?.value) : childTags.reduce((prev, curr) => ({...prev, [curr.name]: curr.tag?.value}), {})
                }
                return rootTag?.value
            }
        }
        // this.tags.push({ key: tag.name, isArray, tag: rootTag, children: childTags.length > 0 ? childTags : undefined })

        //Add tag to PLC

    }

}