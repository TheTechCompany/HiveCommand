import { nanoid } from "nanoid";
import { Ref, useState } from "react"
import { useReactFlow } from 'reactflow';
import { useEditorContext } from "../context";


export const BoxToolProps = {
    width: 'Number',
    height: 'Number'
}

const BaseBoxTool = (flowWrapper?: any, page?: any, border?: any) => {
   // const [ startPoin, setStartPoint ] = useState<any>(null)

   const { project } = useReactFlow();

   const {  onUpdatePage } = useEditorContext();

   const [ startPoint, setStartPoint ] = useState<any>(null);

   const onClick = (e: MouseEvent) => {

       const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
       const symbolPosition =  project({
           x: (e.clientX || 0) - (wrapperBounds?.x || 0),
           y: (e.clientY || 0) - (wrapperBounds?.y || 0)
       })
       

    if(!startPoint){
       setStartPoint(symbolPosition);
    }else{

        console.log(startPoint, symbolPosition)

       let n = (page?.nodes || []).slice();
       n.push({
           id: nanoid(),
           position: {
               x: startPoint.x,
               y: startPoint.y
           },
           data: { 
               border: border, 
               width: Math.abs(startPoint.x - symbolPosition.x), //selectedSymbol.component?.metadata?.width, 
               height: Math.abs(startPoint.y - symbolPosition.y) //selectedSymbol.component?.metadata?.height 
           },
           type: 'box'
       })


       onUpdatePage?.({
           ...page,
           nodes: n
       }, "onClick")

       setStartPoint(null);
    }


   }


   

   return {
       onClick
   }
}

export const BoxTool = (flowWrapper: any, page: any) => {
    return BaseBoxTool(flowWrapper, page, '1px solid black');
}


export const BoxOutlineTool = (flowWrapper: any, page: any) => {
   return BaseBoxTool(flowWrapper, page, '1px dashed black');
}