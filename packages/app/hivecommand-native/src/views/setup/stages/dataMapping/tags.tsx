import { Box, IconButton, Checkbox, TextField, InputAdornment, Collapse, Typography, Button } from '@mui/material';
import { ExpandMore, ChevronRight, Javascript } from '@mui/icons-material'
import { ScriptEditorModal } from '../../modals/script-editor'
import React, { useContext, useMemo, useState } from 'react';
import { SetupContext } from '../../context';
import { OPCUAServerItem } from '../opcuaServer';

export const TagView = () => {

    const { state, setState, globalState, setGlobalState } = useContext(SetupContext);

    
    const [deviceExpanded, setDeviceExpanded] = useState<any[]>([]);
    const [editItem, setEditItem] = useState<any | null>();

    const controlLayout = globalState?.controlLayout;

    const deviceMap = useMemo(() => {
        return (globalState?.deviceMap || []).reduce((prev: any, curr: any) => ({
            ...prev,
            [curr.path]: curr.tag
        }), {})
    }, [globalState?.deviceMap])

    const tags = useMemo(() => (controlLayout?.tags || []).map((x: any) => {

        let type = controlLayout?.types.find((a) => a.name === x.type);
        let hasChildren = (type?.fields || []).length > 0;

        return {
            id: x.id,
            name: x.name,
            type: !type ? x.type : type.name,
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
    }), [controlLayout?.tags || [], controlLayout?.types || []])


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



    const updateMap = (path: string, tag: string) => {
        let deviceMap = globalState?.deviceMap?.slice() || [];


        let ix = deviceMap.map((map: any) => map.path).indexOf(path);

        if (ix < 0) {
            deviceMap.push({ path, tag });
        } else {
            deviceMap[ix].tag = tag;
        }

        // setMapping(deviceMap)
        setGlobalState?.((state) => ({ ...state, deviceMap }))
    }

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
        <Box>
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
            {tags.slice()?.sort((a, b) => a.name?.localeCompare(b.name)).map((tag: any) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>

                        {tag.children?.length > 0 ? (
                            <IconButton sx={{ marginRight: '6px' }} size="small" onClick={() => {
                                let exists = deviceExpanded.indexOf(tag.id) > -1
                                setDeviceExpanded(exists ? deviceExpanded.filter((a) => a != tag.id) : deviceExpanded.concat([tag.id]))
                            }}>
                                {deviceExpanded.indexOf(tag.id) > -1 ? <ExpandMore /> : <ChevronRight />}
                            </IconButton>
                        ) : (
                            <Box sx={{ width: 40, height: 40 }} />
                        )}
                        <Box sx={{ flex: 1 }}>
                            <Checkbox
                                sx={{ padding: 0, paddingRight: '6px' }}
                                disabled
                                indeterminate={!(globalState?.deviceMap?.filter((a: any) => a.path.indexOf(tag.name) > -1).length == tag.children?.length) && (globalState?.deviceMap || []).filter((a: any) => a.path.indexOf(tag.name) > -1).length > 0}
                                checked={globalState?.deviceMap?.filter((a: any) => a.path.indexOf(tag.name) > -1).length == (tag.children?.length > 0 ? tag.children?.length : 1)}
                                size="small" />
                            {tag.name} - {tag.type}
                        </Box>

                        {!(tag.children.length > 0) && (
                            <TextField
                                disabled={Boolean(deviceMap?.[tag.name]?.match(/script:\/\/([.\s\S]+)/))}
                                sx={{ flex: 1, paddingRight: '0' }}
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
                                }} />
                        )}
                    </Box>
                    <Collapse in={deviceExpanded.indexOf(tag.id) > -1}>
                        <Box sx={{marginLeft: '35px'}}>
                            <Button sx={{fontSize: "12px", textTransform: 'none'}} size="small">Use template</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {tag.children?.map((child: any) => {
                                const path = `${tag.name ? tag.name + '.' : ''}${child.name}`

                                return <Box sx={{ display: 'flex', paddingLeft: '40px', alignItems: 'center' }}>
                                    <Typography sx={{ flex: 1 }}>{child.name}</Typography>
                                    <TextField
                                        disabled={Boolean(deviceMap?.[path]?.match(/script:\/\/([.\s\S]+)/))}
                                        sx={{ flex: 1, paddingRight: '0' }}
                                        value={deviceMap?.[path]?.match(/script:\/\/([.\s\S]+)/) ? "script" : deviceMap?.[path]}
                                        onChange={(e) => {
                                            updateMap(path, e.target.value)
                                        }}
                                        size="small"
                                        InputProps={{
                                            endAdornment: (<InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => {
                                                        console.log({ child })
                                                        setEditItem({
                                                            ...child,
                                                            path
                                                        })
                                                    }}
                                                    size="small">
                                                    <Javascript />
                                                </IconButton>
                                            </InputAdornment>)
                                        }} />

                                </Box>
                            })}
                        </Box>
                    </Collapse>
                </Box>
            ))}
        </Box>
    )
}