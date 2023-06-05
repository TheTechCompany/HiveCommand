import { Box, IconButton, Paper, Tabs, TextField, Typography } from '@mui/material';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useQuery, gql} from '@apollo/client';
import { Editor } from '../../../../components/script-editor/editor'
import { TreeItem, TreeView, useTreeItem } from '@mui/lab';
import { resolveTree } from './utils';
import { ChevronRight, ExpandMore, MenuOpen } from '@mui/icons-material'
import { ComponentProperties } from './views/properties';
import { Code } from './views/code';
import clsx from 'clsx';
import { TreeItems } from './TreeItemContent';
import { ComponentFileModal } from 'app/hivecommand-frontend/src/components/modals/component-file';
import { useMutation } from '@apollo/client';
import { debounce } from 'lodash';
import { Preview } from './views/preview';

export * from './list';

export const Components = (props: any) => {

    const [ modalOpen, openModal ] = useState(false);

    const [ previewOpen, openPreview ] = useState(false);

    const [ view, setView ] = useState('properties');

    const [ code, _setCode ] = useState<{content: string, path: string} | null>(null);

    const { data } = useQuery(gql`
        query GetComponentInfo ($program: ID, $component: ID){
            commandPrograms(where: {id: $program}){

                components (where: {id: $component}){
                    id
                    name
                    description

                    main {
                        id
                    }

                    properties {
                        key
                        type {
                            id
                            name
                        }
                        scalar
                    }

                    files {
                        id
                        path
                        content
                    }

                }
            }
        }
    `, {
        variables: {
            program: props.activeProgram,
            component: props.component
        }
    })

    console.log({
        activeProgram: props.activeProgram,
        component: props.component
    })

    const [ createComponentFile ] = useMutation(gql`
        mutation CreateComponentFile($program: ID, $component: ID, $path: String){
            createCommandProgramComponentFile(program: $program, component: $component, path: $path){
                id
            }
        }
    `, {
        refetchQueries: ['GetComponentInfo']
    })


    const [ updateComponentFile ] = useMutation(gql`
        mutation UpdateComponentFile ($program: ID, $component: ID, $id: ID, $content: String){
            updateCommandProgramComponentFile(program: $program, component: $component, id: $id, content: $content){
                id
            }
        }
    `, {
        refetchQueries: ['GetComponentInfo']
    })

    const component = data?.commandPrograms?.[0]?.components?.[0]

    // const [part_files, setPartFiles] = useState([{path: 'src/index.ts', content: 'export const file = () => {}'}, {path: 'src/folder/index.ts', content: 'export const folder = () => {}'}]);

    console.log({component})

    const files = useMemo(() => {

        return resolveTree((component?.files || []).map((x) => x.path))

    }, [component?.files])

    const slowUpdate = useMemo(() => debounce(updateComponentFile, 500, {maxWait: 1000}), [updateComponentFile])

    useEffect(() => {
        // console.log({codePath})
        console.log({code, component: component?.files})
        if(code?.path && code?.content && component?.files?.find((a) => a.path === code?.path)?.content !== code?.content){
            slowUpdate({
                variables: {
                    program: props.activeProgram,
                    component: props.component,
                    content: code.content,
                    id: component?.files?.find((a) => a.path == code?.path)?.id
                }
            })
        }

        // setPartFiles((partFile) => {
        //     let p = partFile.slice()
        //     console.log({codePath, p})
        //     const ix = p.findIndex((a) => a.path == codePath)
        //     if(ix > -1){
        //         p[ix].content = code;
        //     }
        //     return p;
        // })

    }, [component?.files, code?.content, code?.path])


    const renderTree = (files: any, parent?: string) => {
        
        const items = Object.keys(files)?.sort((a, b) => a.localeCompare(b)).map((fileKey) => {
            return (
                <TreeItem 
                    label={fileKey} 
                    nodeId={`${parent? parent : ''}/${fileKey}`}>
                    {files?.[fileKey] && renderTree(files?.[fileKey], `${parent ? parent : ''}/${fileKey}`)}
                </TreeItem>
            )
        })

        return items; 
        
    }
    

    const renderView = () => {
        switch(view){
            case 'preview':
                return (
                    <Preview   
                        mainId={component?.main?.id}
                        files={component?.files || []} />
                )
            case 'properties':
                return (
                    <ComponentProperties
                        mainId={component?.main?.id}
                        component={props.component} 
                        activeProgram={props.activeProgram}
                        properties={component?.properties || []}
                        files={component?.files || []}/>
                )
            case 'code':
                return (<Code 
                            activeProgram={props.activeProgram}
                            component={props.component}
                            files={component?.files || []}
                            code={code} 
                            onChange={(e) => {

           
                               
                                setCode({content: e})

                                console.log("CHANGE", e)
                            }} />)
        }
    }

    const setCode = (codePatch: {path?: string, content?: string}) => {
        _setCode((code) => {
            let update: any = Object.assign({}, (code || {})) // {path: code.path}

            if(codePatch.path){
                update.path = codePatch?.path
            }
            update.content = codePatch.content;

            return update;
        })

        // if(code.content){
        // }
        // _setCode(update)
    }

    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column', margin: '6px'}}>

            <ComponentFileModal 
                open={modalOpen}
                onClose={() => {
                    openModal(false);
                }}
                onSubmit={(file) => {
                    createComponentFile({
                        variables: {
                            path: file.path,
                            program: props.activeProgram,
                            component: props.component
                        }
                    }).then(() => openModal(false));
                }}
                />
            <Box sx={{bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px'}}>
                <Typography>{component?.name}</Typography>
                {/* <TextField  size="small" value={component?.name || ''} label={"Name"} /> */}
                <IconButton onClick={() => openPreview(!previewOpen)}>
                    {previewOpen ? <ChevronRight /> : <MenuOpen />}
                </IconButton>
            </Box>
            <Box sx={{flex: 1, display: 'flex'}}>
                <Paper elevation={3} sx={{minWidth: '200px', userSelect: 'none'}}>
                    <TreeView
                        onNodeSelect={(e, nodeIds) => {

                            console.log("CLICK " , nodeIds)
                            switch(nodeIds){
                                case 'properties-root':
                                    setView('properties');
                                    break;
                                case 'preview-root':
                                    setView('preview');
                                    break;
                                default:
                                    setView('code');
                                    // console.log({nodeIds, part_files})
                                    let item = component?.files?.find((a) => ((a.path[0] !== '/' ? '/' : '') + a.path) === nodeIds)
                                    if(item){
                                        setCode({content: item.content, path: item.path})
                                    }
                                    break;
                            }
                            console.log(nodeIds)
                        }}
                        defaultCollapseIcon={<ExpandMore />}
                        defaultExpandIcon={<ChevronRight />}
                        >

                        <TreeItem nodeId='preview-root' label="Preview" />

                        <TreeItem nodeId='properties-root' label="Properties" />

                        <TreeItems onAdd={() => {
                            openModal(true)
                        }} nodeId='code-root' label="Code">
                            {renderTree(files)}
                        </TreeItems>
                    </TreeView>
                </Paper>
                <Box sx={{flex: 1, display: 'flex', position: 'relative'}}>
                    <Box sx={{flex: 1, display: 'flex'}}>
                        {renderView()}
                    </Box>
                    {previewOpen && (
                        <Box sx={{position: 'absolute', right: 0, display: 'flex', height: '100%', minWidth: '200px'}}>
                            <Preview   
                                mainId={component?.main?.id}
                                files={component?.files || []} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>   
    )
}