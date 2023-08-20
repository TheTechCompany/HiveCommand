import { nanoid } from "nanoid";
import { Ref, useState } from "react"
import { useReactFlow } from 'reactflow';
import { useEditorContext } from "../context";

export const SymbolTool = (flowWrapper: any, page: any) => {

    // const [ startPoin, setStartPoint ] = useState<any>(null)

    const { project } = useReactFlow();

    const { selectedSymbol, symbolRotation, onUpdatePage } = useEditorContext();

    const onClick = (e: MouseEvent) => {

        if(!selectedSymbol) return;

        const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
        const symbolPosition =  project({
            x: (e.clientX || 0) - (wrapperBounds?.x || 0),
            y: (e.clientY || 0) - (wrapperBounds?.y || 0)
        })
        

        let n = (page?.nodes || []).slice();
        n.push({
            id: nanoid(),
            position: {
                x: symbolPosition.x,
                y: symbolPosition.y,
               
            },
            data: { 
                symbol: selectedSymbol.name, 
                rotation: symbolRotation,
                width: selectedSymbol.component?.metadata?.width, 
                height: selectedSymbol.component?.metadata?.height 
            },
            type: 'electricalSymbol'
        })

        console.log("Add", n)

        onUpdatePage?.({
            ...page,
            nodes: n
        }, "onClick")
       

    }

    

    return {
        onClick
    }
}