import { useRemoteComponents } from "../../hooks/remote-components";

export interface HMICanvasNode {
    id: string;
    x: number;
    y: number;
    options: any;
    scaleX: number;
    scaleY: number;
    rotation: number;
    type: string;
    icon: any;
}

export const registerNodes = async (nodes: HMICanvasNode[], templatePacks?: any[], getPack?: any, functions?: any[]) => {

    //Fetch node component packs


    const nodesParsed = await Promise.all(nodes.map(async (node) => {

        const [packId, templateName] = (node.type || '').split(':')
        const url = templatePacks.find((a) => a.id == packId)?.url;

        if (url) {
            let base = url.split('/');
            let [url_slug] = base.splice(base.length - 1, 1)
            base = base.join('/');

            const pack = await getPack(packId, `${base}/`, url_slug)

            return {
                ...node,
                icon: pack.find((a) => a.name == templateName)?.component
            }
        }

        return { ...node, icon: undefined };
        // return pack

    }))

    return nodesParsed.map((x) => {
        let width = x?.icon?.metadata?.width //|| x.type.width ? x.type.width : 50;
        let height = x?.icon?.metadata?.height //|| x.type.height ? x.type.height : 50;


        let opts = Object.keys(x.options || {}).map((key) => {
            if(x.options[key]?.fn){
                return {key, value: functions?.find((a) => a.id == x.options[key]?.fn)?.fn?.bind(this, x.options[key]?.args)}
            }
            return {key, value: x.options[key]}
        }).reduce((prev, curr) => ({...prev, [curr.key]: curr.value}), {})

        return {
            id: x.id,
            x: x.x,
            y: x.y,
            width,
            height,

            options: opts,
            //  width: `${x?.type?.width || 50}px`,
            // height: `${x?.type?.height || 50}px`,
            extras: {
                options: x.icon?.metadata?.options || {},
                // devicePlaceholder: x.devicePlaceholder,
                rotation: x.rotation || 0,
                scaleX: x.scaleX != undefined ? x.scaleX : 1,
                scaleY: x.scaleY != undefined ? x.scaleY : 1,
                // showTotalizer: x.showTotalizer || false,
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