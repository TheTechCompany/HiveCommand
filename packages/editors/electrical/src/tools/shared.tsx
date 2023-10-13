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
    onKeyDown?: (event: KeyboardEvent, origin?: string) => void;
    // Overlay?: (props: OverlayProps) => any;
}

export interface ToolFactoryProps {
    surface: Surface, 
    page: any, 
    onUpdate?: (page: any) => void
    cursorPosition?: {x: number, y: number};
}

export type ToolFactory<P> = React.ForwardRefExoticComponent<ToolFactoryProps & P & React.RefAttributes<ToolInstance>>;

export type ToolOverlay = JSX.Element;