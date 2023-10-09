import { FormatColorText, CheckBoxOutlineBlank, HighlightAlt, Timeline } from '@mui/icons-material'
import { ClipboardTool } from './clipboard';
import { SymbolTool, SymbolToolProps } from './symbol';
import { WireTool } from './wire';
import { BoxOutlineTool, BoxToolProps, BoxTool } from './box';
import { TextTool, TextToolProps } from './text';

export * from './wire'
export * from './symbol'
export * from './box';
export * from './text';
export * from './clipboard'
export * from './shared';

export const Tools = { 
    clipboard: ClipboardTool,
    symbol: SymbolTool, //(flowWrapper, page),
    wire: WireTool, //(flowWrapper, page),
    box: BoxTool, //(flowWrapper, page),
    boxOutline: BoxOutlineTool, //(flowWrapper, page),
    text: TextTool //(flowWrapper, page)
}; 

export const ToolMenu = () => [
    {
        id: 'text',
        icon: <FormatColorText />
    },
    {
        id: 'box',
        icon: <CheckBoxOutlineBlank />
    },
    {
        id: 'boxOutline',
        icon: <HighlightAlt />
    },
    {
        id: 'wire',
        icon: <Timeline />
    }

];


export const ToolProps = [
    {
        id: 'text',
        props: TextToolProps,
        icon: <FormatColorText />
    },
    {
        id: 'box',
        props: BoxToolProps,
        icon: <CheckBoxOutlineBlank />
    },
    {
        id: 'boxOutline',
        props: BoxToolProps,
        icon: <HighlightAlt />
    },
    {
        id: 'electricalSymbol',
        props: SymbolToolProps,
        icon: <Timeline />
    }
]