import { Box, IconButton, ListItem, ListItemButton } from "@mui/material";
import { DragIndicator, MoreVert } from '@mui/icons-material'
import { useSortable } from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities';

export const PageItem = (props: any) => {
    const { transform, transition, setNodeRef, listeners, attributes } = useSortable({ id: props.page?.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ListItem 
            disablePadding
            secondaryAction={(
                <IconButton onClick={props.onEdit} sx={{opacity: 0}} className="edit-button" size="small">
                    <MoreVert fontSize="inherit" />
                </IconButton>
            )}
            sx={{
                '&:hover .edit-button': {opacity: 1}, 
                background: props.selected ? '#dfdfdf' : undefined
            }} >
                <ListItemButton
                    onClick={(e) => {
                        console.log("Button click")
                        props.onSelectPage?.(props.page)

                    }}
                    >
                <DragIndicator {...listeners} sx={{marginRight: '6px', cursor: 'pointer'}} fontSize="inherit" />
                <Box 
                sx={{fontSize: '12px', flex: 1}}>
                    {props.page?.name}
                </Box>
                </ListItemButton>
             
            </ListItem>
        </div>
    )
}