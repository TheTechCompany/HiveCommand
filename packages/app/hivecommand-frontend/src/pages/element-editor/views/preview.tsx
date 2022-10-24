import { InfiniteCanvas } from "@hexhive/ui"
import { useContext } from "react";
import { HMINodeFactory } from "@hive-command/canvas-nodes";
import { ElementEditorContext } from "../context";
import { CanvasStyle } from "../../../style";
import * as HMIIcons from '../../../assets/hmi-elements'

export const PreviewView = () => {

    const { editDevice } = useContext(ElementEditorContext);
    
    return (

        <InfiniteCanvas 
        factories={[HMINodeFactory(false)]}
        nodes={[
            {
                id: 'editor-node',
                type: "hmi-node",
                x: 500,
                y: 200,
                width: `${editDevice?.width || 50}px`,
                height: `${editDevice?.height || 50}px`,
                // width: `${x?.type?.width || 50}px`,
                // height: `${x?.type?.height || 50}px`,
                extras: {
                
                    // options: props.deviceValues.find((a) => a?.devicePlaceholder?.name == x?.devicePlaceholder?.name)?.values,
                    // configuration: props.deviceValues.find((a) => a?.devicePlaceholder?.name == x?.devicePlaceholder?.name)?.conf.reduce((prev,curr) => ({...prev, [curr.conf.key]: curr.value}), {}),
                    ports: (editDevice?.ports || []).map((x) => ({...x, id: x.key})),
                    rotation: editDevice?.rotation || 0,
                    scaleX: editDevice?.scaleX || 1,
                    scaleY: editDevice?.scaleY || 1,
                    // color: x.type == 'BallValve' || x.type == "DiaphragmValve" ? (props.deviceValues.find((a) => a.devicePlaceholder.name == x.devicePlaceholder.name)?.values == "false" ? '0deg' : '60deg') : '0deg',
                    // devicePlaceholder: x.devicePlaceholder,
                    iconString: editDevice?.name,
                    icon: editDevice.Component //HMIIcons[editDevice?.name],
                },
            }
        ]}
        style={CanvasStyle} />
    )
}