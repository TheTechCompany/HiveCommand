import { nanoid } from "nanoid";
import { Ref, useState } from "react"
import { useReactFlow } from 'reactflow';
import { useEditorContext } from "../context";

export const TextToolProps = {
    text: 'String',
    fontSize: 'Number'
}

const BaseTextTool = (flowWrapper?: any, page?: any) => {
   // const [ startPoin, setStartPoint ] = useState<any>(null)

   const { project } = useReactFlow();

   const {  onUpdatePage } = useEditorContext();

   const [ text, setText ] = useState<any>(null);

   const onClick = (e: MouseEvent) => {

       const wrapperBounds = flowWrapper?.current?.getBoundingClientRect()
       const symbolPosition =  project({
           x: (e.clientX || 0) - (wrapperBounds?.x || 0),
           y: (e.clientY || 0) - (wrapperBounds?.y || 0)
       })
       


    // if(!startPoint){
    //    setStartPoint(symbolPosition);

    // }else{

    //     console.log(startPoint, symbolPosition)

       let n = (page?.nodes || []).slice();
       n.push({
           id: nanoid(),
           position: {
               x: symbolPosition.x,
               y: symbolPosition.y
           },
           data: { 
               text: 'Text'
           },
           type: 'text'
       })


       onUpdatePage?.({
           ...page,
           nodes: n
       }, "onClick")

    //    setStartPoint(null);
    // }


   }


   

   return {
       onClick
   }
}

export const TextTool = (flowWrapper: any, page: any) => {
    return BaseTextTool(flowWrapper, page);
}
