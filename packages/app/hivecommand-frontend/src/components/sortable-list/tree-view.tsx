import React, { useContext, useMemo, useState } from 'react'
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem, { TreeItemContentProps, TreeItemProps, useTreeItem } from '@mui/lab/TreeItem';
import { Box, Collapse, IconButton, ListItemButton, Paper, Typography } from '@mui/material';
import { KeyboardSensor, DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Add, DragIndicator } from '@mui/icons-material';
import clsx from 'clsx';

export interface SortableListProps {
    items?: { id: string, children?: any[] }[],
    getLabel?: (item: any, ix: string) => any;
    onReorderItems?: (id: string, newIx: number, parent?: string) => void,
    onItemClick?: (item: any) => void,
    onItemAdd?: (parent: string) => void,
    children?: ((item: any, ix: number) => JSX.Element) | any

}

export const TreeViewContext = React.createContext<{
    offsetLeft?: number;
    addItem?: (parent: string) => void
    expanded?: string[];
    toggleExpanded?: (id: string) => void;
    defaultCollapseIcon?: JSX.Element;
    defaultExpandIcon?: JSX.Element;
}>({

});

export const TreeViewProvider = TreeViewContext.Provider;


const reduceItems = (items: any[], depth: number) => {
    return items?.reduce((prev, curr) => {
        curr.depth = depth;
        return prev.concat([curr, ...reduceItems(curr.children || [], depth + 1)])
    }, [])
}

const indentationWidth = 17;

export function removeChildrenOf(
    items: any[],
    ids: any[]
) {
    const excludeParentIds = [...ids];

    return items.filter((item) => {
        if (item.parent?.id && excludeParentIds.includes(item.parent?.id)) {
            if (item.children.length) {
                excludeParentIds.push(item.id);
            }
            return false;
        }

        return true;
    });
}

export const TreeViewSortableList: React.FC<SortableListProps> = (props) => {


    const [expanded, setExpanded] = useState<any[]>([]);

    const [offsetLeft, setOffsetLeft] = useState(0)

    const [activeId, setActiveId] = useState<{id: string} | null>(null);


    const flattenedTree = useMemo(() => reduceItems(props.items || [], 0), [props.items])

    const flatList = useMemo(() => {

        const collapsedItems = flattenedTree.reduce(
            (acc, { children, id }) =>
                (expanded.indexOf(id) < 0 && children?.length > 0) ? [...acc, id] : acc,
            []
        );

        let ids = activeId ? [activeId?.id, ...collapsedItems] : collapsedItems;

        return removeChildrenOf(flattenedTree, ids)
        // .filter((a) => {
        //     return ids.indexOf(a.parentId) > -1 || ids.indexOf(a.id) > -1
        // })

    }, [flattenedTree, activeId?.id, expanded]);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        let activeElem = flattenedTree.find((a) => a.id == active.id)
        let overElem = flattenedTree?.[flattenedTree.findIndex((a) => a.id == over?.id) - 1];

        let offsetX = activeElem?.depth + Math.floor(offsetLeft / indentationWidth);


        let overDepth = overElem?.depth;

        let isChild = offsetX > overDepth;
        let isSibling = offsetX == overDepth

        console.log({ parent: overElem?.id, isChild, isSibling })

        if (active.id !== overElem.id) {

            const oldIndex = props.items?.findIndex((a) => a.id == active.id);

            let items = flattenedTree?.filter((a) => {
                if (isChild) {
                    return a.parent?.id == overElem?.id
                } else {
                    return a?.parent?.id == overElem?.parent?.id
                }
            });

            console.log({ flattenedTree, items })

            const newIndex = items?.findIndex((a) => a.id == overElem.id);

            console.log(newIndex + 1, isChild ? overElem?.id : isSibling ? overElem?.parent?.id : null)


            props?.onReorderItems?.(active.id, newIndex + 1, isChild ? overElem?.id : isSibling ? overElem?.parent?.id : null);

        }

        setActiveId(null);
    }

    const handleDragStart = (event: any) => {
        const { active, over } = event;

        setActiveId(active);
    }

    const renderItem = (item: any, ix: string) => {
        return (
            <>
                <SortableTreeItem
                    hasChildren={item.children?.length > 0}
                    label={props.getLabel?.(item, ix)}
                    onClick={() => {
                        props.onItemClick?.(item)

                    }}
                    nodeId={item.id}>

                    {item.children?.filter((a) => flatList.findIndex((b) => a.id == b.id) > -1).map((child, new_ix) => renderItem(child, ix + '.' + (new_ix + 1)))}

                </SortableTreeItem>
            </>
        )

    }

    return (
        <TreeViewProvider value={{
            addItem: props.onItemAdd,
            offsetLeft,
            expanded,
            toggleExpanded: (id) => {
                let exp = expanded.slice();
                let ix = exp.indexOf(id);
                if (ix > -1) {
                    exp.splice(ix, 1);
                } else {
                    exp.push(id)
                }
                setExpanded(exp)
            },
            defaultCollapseIcon: <ExpandMoreIcon fontSize='inherit' />,
            defaultExpandIcon: <ChevronRightIcon fontSize='inherit' />
        }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragMove={(e) => {

                    let offsetX = Math.floor(e.delta.x / indentationWidth);


                    let activeDepth = flattenedTree.find((a) => a.id == e.active?.id)?.depth;
                    let overDepth = flattenedTree?.[flattenedTree.findIndex((a) => a.id == e.over?.id) - 1]?.depth;


                    if (activeDepth + offsetX < overDepth &&
                        activeDepth + offsetX > overDepth - 1
                    ) {
                        setOffsetLeft(e.delta.x)
                    }

                    if (activeDepth + offsetX < overDepth) {

                        setOffsetLeft((overDepth - activeDepth) * indentationWidth)

                    }

                    if (activeDepth + offsetX > overDepth) {

                        setOffsetLeft(((overDepth - activeDepth) + 1) * indentationWidth)
                    }

                }}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={(flatList || []).map((x) => x.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Box>
                        {/* onNodeSelect={(event, nodeIds) => {
                        props.onItemClick?.(props.items?.find((a) => a.id == nodeIds))
                    }}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                > */}
                        {props.items?.map((item, ix) => renderItem(item, `${ix + 1}`))}
                        {/* <SortableTreeItem nodeId="1" label="Applications">
                        <SortableTreeItem nodeId="2" label="Calendar" />
                    </SortableTreeItem>
                    <SortableTreeItem nodeId="5" label="Documents">
                        <SortableTreeItem nodeId="10" label="OSS" />
                        <SortableTreeItem nodeId="6" label="MUI">
                            <SortableTreeItem nodeId="8" label="index.js" />
                        </SortableTreeItem>
                    </SortableTreeItem> */}
                    </Box>

                    <DragOverlay>
                        {activeId && (
                            <Paper>
                                <IconButton sx={{ marginLeft: '6px', paddingLeft: 0, paddingRight: 0, borderRadius: '6px' }} size="small">
                                    <DragIndicator fontSize='inherit' />
                                </IconButton>

                                {flatList?.find((a) => a.id === activeId?.id)?.label} -
                                {flatList?.find((a) => a.id === activeId?.id)?.name}
                            </Paper>
                            // <SortableTreeItem
                            //     label={props.getLabel?.(activeId, '0')}
                            //     nodeId={activeId.id} />
                        )}
                    </DragOverlay>
                </SortableContext>
            </DndContext>
        </TreeViewProvider>
    )
}


const SortableTreeItem = React.forwardRef(function CustomContent(
    props: any,
    ref,
) {
    const { label } = props;
    // const {
    //     classes,
    //     className,
    //     label,
    //     nodeId,
    //     icon: iconProp,
    //     expansionIcon,
    //     displayIcon,
    // } = props;


    const { offsetLeft, expanded = [], toggleExpanded, addItem, defaultCollapseIcon, defaultExpandIcon } = useContext(TreeViewContext)

    const { transform, transition, setNodeRef, listeners, attributes, isOver, isDragging } = useSortable({ id: props?.nodeId, animateLayoutChanges: ({ wasDragging, isDragging }) => wasDragging || isDragging ? false : true });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }

    let itemStyle = isDragging ? {
        opacity: 0,
        height: 0
    } : {}

    let indicatorStyle = isDragging ? {
        // borderRadius: '50%',
        height: '0px',
        opacity: 1,
        borderBottom: '1px solid #2389ff',
        backgroundColor: '#ffffff',
        width: '100%'
    } : {}

    // const {
    //     disabled,
    //     expanded,
    //     selected,
    //     focused,
    //     handleExpansion,
    //     handleSelection,
    //     preventSelection,
    // } = useTreeItem(nodeId);

    const icon = props.hasChildren && (expanded.indexOf(props.nodeId) > -1 ? defaultCollapseIcon : defaultExpandIcon) //expansionIcon //iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // preventSelection(event);
    };

    const handleExpansionClick = (
    ) => {
        toggleExpanded?.(props.nodeId)
        // handleExpansion(event);
    };

    const handleSelectionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        // handleSelection(event);
    };

    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <>
            <Box ref={setNodeRef} style={style}  {...attributes} sx={{
                // position: 'relative',
                display: 'flex',
                flexDirection: 'column',

                '& > *': {
                    ...itemStyle
                },
                '& .indicator': {
                    ...indicatorStyle
                },
            }}>
                <Box sx={{
                    display: 'flex',
                    '&  .add-icon': { display: 'none' },
                    '&:hover  .add-icon': { display: 'flex' },
                    height: '30px',
                    alignItems: 'center'
                }}>

                    <Paper
                        style={{ display: 'flex', borderRadius: 0, flex: 1, alignItems: 'center' }}
                        // className={clsx(className, classes.root, {
                        //     [classes.expanded]: expanded,
                        //     [classes.selected]: selected,
                        //     [classes.focused]: focused,
                        //     [classes.disabled]: disabled,
                        // })}

                        onMouseDown={props.onClick}
                        ref={ref as React.Ref<HTMLDivElement>}
                    >

                        <IconButton {...listeners} sx={{ marginLeft: '6px', paddingLeft: 0, paddingRight: 0, borderRadius: '6px' }} size="small">
                            <DragIndicator fontSize='inherit' />
                        </IconButton>

                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
                        {icon ? (<IconButton size="small" onClick={handleExpansionClick} >
                            {/* className={classes.iconContainer} */}
                            {icon}
                        </IconButton>) : null}
                        <ListItemButton sx={{ flex: 1, padding: 0, paddingLeft: '6px' }}>
                            <Typography
                                onClick={handleSelectionClick}
                                component="div"
                                style={{ flex: 1 }}
                            // className={classes.label}
                            >
                                {label}
                            </Typography>
                        </ListItemButton>

                        <IconButton onClick={() => addItem?.(props.nodeId)} className='add-icon' size='small'>
                            <Add fontSize='inherit' />
                        </IconButton>
                    </Paper>
                </Box>

                <div style={{ transform: `translateX(${Math.floor((offsetLeft || 0) / indentationWidth) * indentationWidth}px)` }} className="indicator" />

            </Box>
            <Collapse sx={{
                marginLeft: `${indentationWidth}px`,
                ...itemStyle
            }} in={expanded.indexOf(props.nodeId) > -1}>
                {props.children}
            </Collapse>
        </>
    );
});
