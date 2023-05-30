import { TreeItem, TreeView, useTreeItem } from '@mui/lab';
import { Box, Button, Checkbox, Collapse, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import React, { forwardRef, useContext, useEffect, useMemo, useState } from 'react'
import { SetupContext } from '../context';
import { ChevronRight, Javascript, ExpandMore } from '@mui/icons-material';
import axios from 'axios';
import clsx from 'clsx';
import { hasOPCChildren, ScriptEditorModal } from '../modals/script-editor';
import { DataTypes } from '@hive-command/scripting';

export interface OPCUAServerItem {
    id: string;
    name: string;
    type?: keyof typeof DataTypes,
    isArray?: boolean;
    path?: string;
    children?: OPCUAServerItem[]
}
export const OPCUAServerStage = () => {

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);


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
        // scanOPCUA()
        // setOPCUA([{id: '101', path: '/Test', name: 'Test', type: 'Boolean'}, {id: '102', path: '/Test2', name: 'Test2', type: DataTypes.Number, isArray: true}] as any)
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
        return items.slice()?.sort((a, b) => a.name?.localeCompare(b.name)).map((item) => (
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

                        // console.log(item.path, globalState?.subscriptionMap?.map((x) => x.path))

                        return ( (globalState?.subscriptionMap || []).map((x) => x.path === (item.path || '') ) ).findIndex((a) => a === true) > -1 || ((children.filter((x: any) => isChecked(x)).length > 0 && children.filter((x: any) => isChecked(x)).length == children.length))
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
                                                 updateSubscriptionMap(x.path, `${parent ? parent + '.' : ''}${x.name}`.replace(/[ -]/g, '_'))
        
                                                 console.log("Update", x.path, x.children);

                                            }

                                        }else if(direction == 'remove' && isChecked(x)){
                                            updateSubscriptionMap(x.path, `${parent ? parent + '.' : ''}${x.name}`.replace(/[ -]/g, '_'))
                                        }

                                        if(hasOPCChildren(x)) updateRec(x.children || [], `${parent ? parent + '.' : ''}${x.name}`)
                                    })
                                } 

                                if(!item.path) return;

                                if(hasOPCChildren(item)){
                                    console.log("Update rec for", item)
                                    updateRec(item.children || [], item.name)
                                }else{
                                    console.log(`${parent?.parentPath ? parent.parentPath + '.' : ''}${item.name}`.replace(/[ -]/g, '_'))
                                    updateSubscriptionMap(item.path, `${parent?.parentPath ? parent.parentPath + '.' : ''}${item.name}`.replace(/[ -]/g, '_'))
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
                {item.children ? renderTree(item.children, edit, {...item, parentPath: parent?.parentPath ? `${parent.parentPath}.${item.name}` : item.name}) : undefined}
            </TreeItem>
        ))
    }





    // const deviceTree = useMemo(() => {
    //     return renderTree(devices, true)
    // }, [devices]);

    const isChecked = (item: any) => {
        const children = item.children || [];

        // console.log(item.path, globalState?.subscriptionMap?.map((x) => x.path))

        return ( (globalState?.subscriptionMap || []).map((x) => x.path === (item.path || '') ) ).findIndex((a) => a === true) > -1 || ((children.filter((x: any) => isChecked(x)).length > 0 && children.filter((x: any) => isChecked(x)).length == children.length))
  

        // return (globalState?.subscriptionMap || []).map((x) => x.path).indexOf(item.path) > -1 || (item.children?.filter((x: any) => isChecked(x)).length > 0 && item.children?.filter((x: any) => isChecked(x)).length == item.children.length)
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
            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
                        <TreeView
                            sx={{flex: 1, '.MuiTreeItem-content': {padding: 0}}}
                            defaultCollapseIcon={<ExpandMore />}
                            defaultExpandIcon={<ChevronRight />}>
                            
                            {renderTree(opcua)}

                        </TreeView>
                    </Box>

        </Box>
    )
}