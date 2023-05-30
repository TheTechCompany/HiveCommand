import { TreeItem, TreeView, useTreeItem } from '@mui/lab';
import { Box, Checkbox, Collapse, Divider, IconButton, InputAdornment, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { forwardRef, useContext, useMemo, useState } from 'react';
import { OPCUAServerItem } from '../opcuaServer';
import { SetupContext } from '../../context';
import clsx from 'clsx';
import { hasOPCChildren } from '../../modals/script-editor';
import { TagView } from './tags';
import { TemplateView } from './templates';
import { TypeView } from './types';


export const DataMappingStage = () => {

    const [ view, setView ] = useState('tags');


    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);

    const controlLayout = globalState?.controlLayout;



    const updateSubscriptionMap = (path: string, tag: string) => {

        setGlobalState?.((state) => {
            // 'subscriptionMap', subscriptionMap
            let subscriptionMap = state?.subscriptionMap?.slice() || [];

            let ix = subscriptionMap.map((x) => x.path).indexOf(path)

            if (ix < 0) {
                subscriptionMap.push({ path, tag })
            } else {
                subscriptionMap.splice(ix, 1)
            }

            return {
                ...state,
                subscriptionMap
            }
        })
    }



    const renderTree = (items: OPCUAServerItem[], edit?: boolean, parent?: any) => {
        return items.slice()?.sort((a, b) => a.name?.localeCompare(b.name)).map((item) => (
            <TreeItem
                ContentComponent={forwardRef((props, ref) => {

                    const [path, setPath] = useState('');

                    const {
                        classes,
                        className,
                        label,
                        nodeId,
                        icon: iconProp,
                        expansionIcon,
                        displayIcon,
                    } = props;

                    const {
                        disabled,
                        expanded,
                        selected,
                        focused,
                        handleExpansion,
                        handleSelection,
                        preventSelection,
                    } = useTreeItem(nodeId);

                    const icon = iconProp || expansionIcon || displayIcon;

                    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                        preventSelection(event);
                    };

                    const handleExpansionClick = (
                        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
                    ) => {
                        handleExpansion(event);
                    };

                    const handleSelectionClick = (
                        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
                    ) => {
                        handleSelection(event);
                    };

                    // console.log({item})

                    const isChecked = (item: OPCUAServerItem): boolean => {
                        const children = item.children || [];

                        // console.log(item.path, globalState?.subscriptionMap?.map((x) => x.path))

                        return ((globalState?.subscriptionMap || []).map((x) => x.path === (item.path || ''))).findIndex((a) => a === true) > -1 || ((children.filter((x: any) => isChecked(x)).length > 0 && children.filter((x: any) => isChecked(x)).length == children.length))
                    }

                    const isInDeterminate = (item: OPCUAServerItem): boolean => {
                        const children = item.children || [];

                        return children.length > 0 ? (children.filter((x: any) => isInDeterminate(x) || isChecked(x)).length > 0 && children.filter((x: any) => isChecked(x)).length != children.length) : false
                    }

                    const checked = isChecked(item)
                    const indeterminate = isInDeterminate(item)

                    return (<Box
                        key={`${parent?.name ? parent.name + '.' : ''}${item.name}`}

                        onMouseDown={handleMouseDown}

                        className={clsx(className, classes.root, {
                            [classes.expanded]: expanded,
                            [classes.selected]: selected,
                            [classes.focused]: focused,
                            [classes.disabled]: disabled,
                        })}
                        sx={{ display: 'flex', alignItems: 'center' }}
                        ref={ref as any}>
                        <div onClick={handleExpansionClick} className={classes.iconContainer}>
                            {icon}
                        </div>
                        <Checkbox
                            // disabled={item.children?.length > 0}
                            onChange={(e) => {

                                let direction = e.target.checked ? 'create' : 'remove';

                                const updateRec = (arr: any[], parent?: string) => {
                                    arr.forEach((x) => {

                                        if (direction == 'create' && !isChecked(x)) {
                                            //!x.children || x.children.length == 0)
                                            console.log({ x })
                                            if (x.path && (!x.children || x.children.length == 0 || x.type)) {
                                                updateSubscriptionMap(x.path, `${parent ? parent + '.' : ''}${x.name}`.replace(/[ -]/g, '_'))

                                                console.log("Update", x.path, x.children);

                                            }

                                        } else if (direction == 'remove' && isChecked(x)) {
                                            updateSubscriptionMap(x.path, `${parent ? parent + '.' : ''}${x.name}`.replace(/[ -]/g, '_'))
                                        }

                                        if (hasOPCChildren(x)) updateRec(x.children || [], `${parent ? parent + '.' : ''}${x.name}`)
                                    })
                                }

                                if (!item.path) return;

                                if (hasOPCChildren(item)) {
                                    console.log("Update rec for", item)
                                    updateRec(item.children || [], item.name)
                                } else {
                                    console.log(`${parent?.parentPath ? parent.parentPath + '.' : ''}${item.name}`.replace(/[ -]/g, '_'))
                                    updateSubscriptionMap(item.path, `${parent?.parentPath ? parent.parentPath + '.' : ''}${item.name}`.replace(/[ -]/g, '_'))
                                }

                                console.log({ subs: globalState?.subscriptionMap })
                            }}
                            // disabled
                            // checked={globalState.subscriptionMap?.indexOf(item.path) > -1}

                            indeterminate={indeterminate}
                            checked={checked}
                            // indeterminate={mapping?.filter((a: any) => a.path.indexOf(item.name) > -1).length > 0}
                            // checked={mapping?.filter((a: any) => a.path.indexOf(item.name) > -1).length == item.children?.length}
                            size="small" />
                        {/* {parent ? <Checkbox disableFocusRipple size='small' /> : null} */}
                        <Typography sx={{ flex: 1 }}>{item.name} {item.type ? `- ${item.type}${item.isArray ? `[]` : ''}` : ''}</Typography>

                    </Box>)
                })}
                nodeId={item.id}
                label={item.name}>
                {item.children ? renderTree(item.children, edit, { ...item, parentPath: parent?.parentPath ? `${parent.parentPath}.${item.name}` : item.name }) : undefined}
            </TreeItem>
        ))
    }




    const renderView = () => {
        switch(view){
            case 'tags':
                return <TagView />
            case 'types':
                return <TypeView />
            case 'templates':
                return <TemplateView />
            default: return null;
        }
    }

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{bgcolor: 'primary.main', marginTop: '6px'}}>
                <Tabs
                    onChange={(e, value) => setView(value)}
                    value={view}>
                    <Tab value={'tags'} label="Tags" />
                    <Tab value={'types'} label="Types" />
                    <Tab value={'templates'} label="Templates" />
                </Tabs>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {renderView()}
                {/* <TreeView
                            sx={{flex: 1, '.MuiTreeItem-content': {padding: 0}}}
                            defaultCollapseIcon={<ExpandMore />}
                            defaultExpandIcon={<ChevronRight />}
                            >
                            {renderTree(tags, true)}
                        </TreeView> */}
            </Box>
        </Box>

    )
}