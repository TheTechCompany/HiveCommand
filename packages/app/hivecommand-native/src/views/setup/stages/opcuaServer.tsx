import { TreeItem, TreeView, useTreeItem } from '@mui/lab';
import { Box, Button, Checkbox, Collapse, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import React, { forwardRef, useContext, useEffect, useMemo, useState } from 'react'
import { SetupContext } from '../context';
import { ChevronRight, Javascript, ExpandMore } from '@mui/icons-material';
import axios from 'axios';
import clsx from 'clsx';
import { hasOPCChildren, ScriptEditorModal } from '../modals/script-editor';

export interface OPCUAServerItem {
    id: string;
    name: string;
    type?: string;
    isArray?: boolean;
    path?: string;
    children?: OPCUAServerItem[]
}
export const OPCUAServerStage = () => {

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);

    const controlLayout = globalState?.controlLayout;

    const [ mapping, setMapping ] = useState<{path: string, tag: string}[]>([]);

    const [ opcua, setOPCUA ] = useState<OPCUAServerItem[]>([
        {
            id: '101',
            name: 'Device',
            path: '/Device',
            children: [
                {
                    id: '102',
                    name: 'Open',
                    isArray: true,
                    path: '/Device/Open',
                    type: 'Boolean'
                },
                {
                    id: '103',
                    name: "Closed",
                    path: '/Device/Closed',
                    type: 'Boolean'
                }
            ]
        },
        {
            id: '108',
            name: 'Variable',
            path: '/Variable',
            type: 'Boolean',
            isArray: true
        }
    ]);

    const [deviceExpanded, setDeviceExpanded] = useState<any[]>([]);

    const [ editItem, setEditItem ] = useState<any | null>();

    const scanOPCUA = () => {
        return axios.get(`http://localhost:${8484}/${state.opcuaServer}/tree`).then((r) => r.data).then((data) => {
            if(data.results){
                setOPCUA(data.results || [])
            }else{
                console.log({data})
            }
        })
    }

    useEffect(() => {
        scanOPCUA()
    }, [])

    const updateMap = (path: string, tag: string) => {
        let deviceMap = globalState?.deviceMap?.slice() || [];


        let ix = deviceMap.map((map: any) => map.path).indexOf(path);

        if(ix < 0){
            deviceMap.push({path, tag});
        }else{
            deviceMap[ix].tag = tag;
        }

        // setMapping(deviceMap)
        setGlobalState?.((state) => ({...state, deviceMap}))
    }

    const updateSubscriptionMap = (path: string, tag: string) => {
        
        setGlobalState?.((state) => {
            // 'subscriptionMap', subscriptionMap
            let subscriptionMap = state?.subscriptionMap?.slice() || [];

            let ix = subscriptionMap.map((x) => x.path).indexOf(path)

            if(ix < 0){
                subscriptionMap.push({path, tag})
            }else{
                subscriptionMap.splice(ix, 1)
            }

            return {
                ...state,
                subscriptionMap
            }
        })
    }

    const deviceMap = useMemo(() => {
        return (globalState?.deviceMap || []).reduce((prev: any, curr: any) => ({
            ...prev,
            [curr.path]: curr.tag
        }), {})
    }, [globalState?.deviceMap])


    const renderTree = (items: OPCUAServerItem[], edit?: boolean, parent?: any) => {
        return items.map((item) => (
            <TreeItem 
                ContentComponent={forwardRef((props, ref) => {

                    const [ path, setPath ] = useState('');

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

                    const isChecked = (item: OPCUAServerItem) : boolean => {
                        const children = item.children || [];

                        return (globalState?.subscriptionMap || []).map((x) => x.path).indexOf(item.path || '') > -1 || (children.filter((x: any) => isChecked(x)).length > 0 && children.filter((x: any) => isChecked(x)).length == children.length)
                    }

                    const isInDeterminate = (item: OPCUAServerItem) : boolean => {
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
                        sx={{display: 'flex', alignItems: 'center'}}
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

                                        if(direction == 'create' && !isChecked(x)){
                                            //!x.children || x.children.length == 0)
                                            console.log({x})
                                            if(x.path && (!x.children || x.children.length == 0 || x.type)){
                                                 updateSubscriptionMap(x.path, `${parent ? parent + '.' : ''}${x.name}`)
        
                                                 console.log("Update", x.path, x.children);

                                            }

                                        }else if(direction == 'remove' && isChecked(x)){
                                            updateSubscriptionMap(x.path, `${parent ? parent + '.' : ''}${x.name}`)
                                        }

                                        if(hasOPCChildren(x)) updateRec(x.children || [], `${parent ? parent + '.' : ''}${x.name}`)
                                    })
                                } 

                                if(!item.path) return;

                                if(hasOPCChildren(item)){
                                    console.log("Update rec for", item)
                                    updateRec(item.children || [], item.name)
                                }else{
                                    updateSubscriptionMap(item.path, `${parent?.name ? parent.name + '.' : ''}${item.name}`)
                                }

                                console.log({subs: globalState?.subscriptionMap})
                            }}
                            // disabled
                            // checked={globalState.subscriptionMap?.indexOf(item.path) > -1}
                            
                            indeterminate={indeterminate}
                            checked={checked}
                            // indeterminate={mapping?.filter((a: any) => a.path.indexOf(item.name) > -1).length > 0}
                            // checked={mapping?.filter((a: any) => a.path.indexOf(item.name) > -1).length == item.children?.length}
                            size="small" />
                        {/* {parent ? <Checkbox disableFocusRipple size='small' /> : null} */}
                        <Typography sx={{flex: 1}}>{item.name} {item.type ? `- ${item.type}${item.isArray ? `[]` : ''}` : ''}</Typography>
                       
                    </Box>)
                })}
                nodeId={item.id} 
                label={item.name}>
                {item.children ? renderTree(item.children, edit, item) : undefined}
            </TreeItem>
        ))
    }



    const tags = useMemo(() => (controlLayout?.tags || []).map((x: any) => {
        let type = controlLayout?.types.find((a) => a.name === x.type);
        let hasChildren = (type?.fields || []).length > 0;

            return {
                id: x.id,
                name: x.name,
                type: !type && x.type,
                children: hasChildren ? type?.fields.map((typeField) => ({
                    id: `${x.id}.${typeField.name}`, 
                    name: typeField.name, type: typeField.type
                })) : []
                // (x.type?.state)?.map((y: any) => ({
                //     id: `${x.id}.${y.key}`,
                //     name: y.key,
                //     type: y.type
                // }))
            }
        })
    , [controlLayout?.tags || []])


    const opcuaTree = useMemo(() => {
        return renderTree(opcua)
    }, [opcua])

    // const deviceTree = useMemo(() => {
    //     return renderTree(devices, true)
    // }, [devices]);

    const isChecked = (item: any) => {
        return (globalState?.subscriptionMap || []).map((x) => x.path).indexOf(item.path) > -1 || (item.children?.filter((x: any) => isChecked(x)).length > 0 && item.children?.filter((x: any) => isChecked(x)).length == item.children.length)
    }

    const isInDeterminate = (item: any) => {
        return item.children?.length > 0 ? (item.children?.filter((x: any) => isInDeterminate(x) || isChecked(x)).length > 0 && item.children?.filter((x: any) => isChecked(x)).length != item.children.length) : false
    }

    const filterMap = (arr: OPCUAServerItem[]) : OPCUAServerItem[]=> {
        //Take array and filter
        let filterArr = arr.filter((a) => isInDeterminate(a) || isChecked(a))

        //Map remainder and pass children back through
        return filterArr.map((x) => ({
            ...x,
            children: x.children ? filterMap(x.children) : undefined
        }))
    }

    return (
        <Box sx={{flex: 1, marginTop: '24px', display: 'flex', flexDirection: 'column',  paddingLeft: '6px', paddingRight: '6px'}}>
            <ScriptEditorModal
                open={Boolean(editItem)}
                selected={deviceMap?.[editItem?.path]?.match(/script:\/\/([.\s\S]+)/)?.[1]}
                onClose={() => {
                    setEditItem(null);
                }}
                onSubmit={(code) => {

                    updateMap(editItem.path, `script://${code}`)

                    setEditItem(null);
                }}
                dataType={editItem?.type}
                deviceValues={filterMap(opcua)}
                />
            <Box sx={{display: 'flex',marginBottom: '6px', alignItems: 'center'}}>
                <Box sx={{display: 'flex', marginRight: '6px', flex: 1}}>
                <TextField 
                    value={state.opcuaServer || ''}
                    onChange={(e) => setState('opcuaServer', e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">opc.tcp://</InputAdornment>
                    }}
                    label="OPCUA Server Endpoint"  
                    fullWidth 
                    size="small"/>
                </Box>
                <Button 
                    onClick={scanOPCUA}
                    variant='contained'>Scan Server</Button>
            </Box>
            
            <Divider />
            <Box sx={{flex: 1, position: 'relative'}}>
                <Box sx={{flex: 1, display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
                        <TreeView
                            sx={{flex: 1, '.MuiTreeItem-content': {padding: 0}}}
                            defaultCollapseIcon={<ExpandMore />}
                            defaultExpandIcon={<ChevronRight />}>
                            
                            {renderTree(opcua)}

                        </TreeView>
                    </Box>
                    <Divider sx={{marginLeft: '6px', marginRight: '6px'}} orientation='vertical' />
                    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
                        <Box>
                            {tags.map((tag: any) => (
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                      
                                        {tag.children?.length > 0 ? (
                                            <IconButton sx={{marginRight: '6px'}} size="small" onClick={() => {
                                                let exists = deviceExpanded.indexOf(tag.id) > -1
                                                setDeviceExpanded(exists ? deviceExpanded.filter((a) => a != tag.id) : deviceExpanded.concat([tag.id]))
                                            }}>
                                                {deviceExpanded.indexOf(tag.id) > -1 ? <ExpandMore /> : <ChevronRight />}
                                            </IconButton> 
                                        ) : (
                                            <Box sx={{width: 40, height: 40}} />
                                        )}
                                        <Box sx={{flex: 1}}>
                                            <Checkbox 
                                                sx={{padding: 0, paddingRight: '6px'}}
                                                disabled
                                                indeterminate={!(globalState?.deviceMap?.filter((a: any) => a.path.indexOf(tag.name) > -1).length == tag.children?.length) && (globalState?.deviceMap || []).filter((a: any) => a.path.indexOf(tag.name) > -1).length > 0}
                                                checked={globalState?.deviceMap?.filter((a: any) => a.path.indexOf(tag.name) > -1).length == tag.children?.length}
                                                size="small" />
                                            {tag.name}
                                        </Box>

                                        {!(tag.children.length > 0) && (
                                            <TextField 
                                                disabled={Boolean(deviceMap?.[tag.name]?.match(/script:\/\/([.\s\S]+)/))}
                                                sx={{flex: 1, paddingRight: '0'}}
                                                value={deviceMap?.[tag.name]?.match(/script:\/\/([.\s\S]+)/) ? "script" : deviceMap?.[tag.name]} 
                                                onChange={(e) => {
                                                    updateMap(tag.name, e.target.value)
                                                }}
                                                size="small"
                                                InputProps={{
                                                    endAdornment: (<InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => {
                                                                setEditItem({
                                                                    ...tag,
                                                                    path: tag.name
                                                                })
                                                            }}
                                                            size="small">
                                                            <Javascript />
                                                        </IconButton>
                                                    </InputAdornment>)
                                                }}     />
                                        )}
                                    </Box>
                                    <Collapse in={deviceExpanded.indexOf(tag.id) > -1}>
                                        <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                            {tag.children?.map((child: any) => {
                                                const path =  `${tag.name ? tag.name + '.' : ''}${child.name}`

                                                return <Box sx={{display: 'flex', paddingLeft: '40px', alignItems: 'center'}}>
                                                    <Typography sx={{flex: 1}}>{child.name}</Typography>
                                                    <TextField 
                                                        disabled={Boolean(deviceMap?.[path]?.match(/script:\/\/([.\s\S]+)/))}
                                                        sx={{flex: 1, paddingRight: '0'}}
                                                        value={deviceMap?.[path]?.match(/script:\/\/([.\s\S]+)/) ? "script" : deviceMap?.[path]} 
                                                        onChange={(e) => {
                                                            updateMap(path, e.target.value)
                                                        }}
                                                        size="small"
                                                        InputProps={{
                                                            endAdornment: (<InputAdornment position="end">
                                                                <IconButton
                                                                    onClick={() => {
                                                                        console.log({child})
                                                                        setEditItem({
                                                                            ...child,
                                                                            path
                                                                        })
                                                                    }}
                                                                    size="small">
                                                                    <Javascript />
                                                                </IconButton>
                                                            </InputAdornment>)
                                                        }}     />
                                                  
                                                </Box>
                                        })}
                                        </Box>
                                    </Collapse>
                                </Box>
                            ))}
                        </Box>
                        {/* <TreeView
                            sx={{flex: 1, '.MuiTreeItem-content': {padding: 0}}}
                            defaultCollapseIcon={<ExpandMore />}
                            defaultExpandIcon={<ChevronRight />}
                            >
                            {renderTree(tags, true)}
                        </TreeView> */}
                    </Box>
                </Box>
            </Box>

        </Box>
    )
}