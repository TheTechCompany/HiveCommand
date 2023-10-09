import { MouseEvent, KeyboardEvent, Ref, RefObject } from "react";
import { useViewport } from 'reactflow';

export const useViewportExtras = () => {
    const { x, y, zoom } = useViewport();

    return {
        unproject: (point: {x: number, y: number}) => ({
            x: (point.x * zoom) + x,
            y: (point.y * zoom) + y
        })
    }
}   

export interface ActiveTool {
    type: string,
    data?: any;
}

export interface OverlayProps {
    cursorPosition?: {x: number, y: number};
}

export interface Surface {
    container: RefObject<HTMLDivElement>,
    state: any
}

export interface ToolInstance {
    onClick?: (event: MouseEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    Overlay?: (props: OverlayProps) => any;
}

export type ToolFactory = (
    surface: Surface, 
    page: any, 
    onUpdate?: (page: any) => void, ...args: any[]
) => ToolInstance