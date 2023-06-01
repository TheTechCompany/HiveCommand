import { Table, TableHead, TableRow, TableBody, TableCell, Box, Tabs, Tab, Checkbox } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { TagTable } from './tag-table';
import { TypeTable } from './type-table';
import { Document } from '@allenbradley/l5x'
import Papa from 'papaparse'
import { DataTypes } from '@hive-command/scripting';

export const ImportView = (
    props: { 
        file: any, 
        importMap: any,
        tags?: {
            id: string;
            name: string;
        }[]
        types?: {
            id: string;
            name: string;
            fields?: {
                id: string
                name: string
                type: string
            }[]
        }[];
       
        onChange: (importMap: any) => void 
    }) => {


    const [view, setView] = useState<'tags' | 'types'>('tags')

    const [tags, setTags] = useState<any[]>([])
    const [types, setTypes] = useState<any[]>([])

    const [importTags, setImportTags] = useState<{name: string}[]>([]); //tags to import
    const [importTypes, setImportTypes] = useState<{name: string}[]>([]); //fields of types to import

    console.log({importTags})

    // useEffect(() => {
        
    //     const importTypes = props.types?.map((type) => {
    //         return type.fields.map((x) => ({name: `${type.name}.${x.name}`}) )
    //     }).reduce((prev, curr) => prev.concat(curr), []);
        
    //     setImportTypes(importTypes);

    // }, [props.types])

    // useEffect(() => {
    //     console.log(props.tags)
    //     const importTags = (props.tags || []).map((tag) => {
    //         return {name: tag.name}
    //     })

    //     setImportTags(importTags);

    // }, [props.tags])

    useEffect(() => {

        const ext = props.file?.name.split('.').pop().toLowerCase();

        if (ext === 'l5x') {
            // console.log(binaryStr)

            let parse = new Document(props.file.content);

            let types = [];

            const convertType = (type: string, dimensions?: number) => {
                let returnValue: string;

                switch(type){
                    case 'REAL':
                    case 'DINT':
                    case 'INT':
                    case 'SINT':
                        returnValue = DataTypes.Number;
                        break;
                    case 'BOOL':
                        returnValue = DataTypes.Boolean;
                        break;
                    case 'STRING':
                        returnValue = DataTypes.String;
                        break;
                    default:
                        returnValue = type;
                        break;
                }

                return dimensions ? returnValue + '[]' : returnValue;
            }

            let tags = parse.find('Tag').map((tag) => {
                let struct = tag.findOne('Structure');

                if (struct && types.find((a) => a.name === struct?._dom.attributes.DataType) == null) {
                    let struct_params = struct?._dom?.elements

                    types.push({
                        name: struct._dom.attributes.DataType,
                        fields: struct_params?.map((x) => ({
                            name: x.attributes.Name,
                            type: convertType(x.attributes.DataType,  x.attributes.Dimensions)
                        }))
                    })
                }

                return {
                    name: tag._dom.attributes.Name,
                    type: convertType(tag._dom.attributes.DataType, tag._dom.attributes.Dimensions),
                }
            })

            setTypes(types);
            setTags(tags);



            let dataTypes = parse.find('DataType').map((x) => {
                return {
                    name: x._dom.attributes.Name,
                    params: x.find('Member').map((x) => ({ name: x._dom.attributes.Name, type: x._dom.attributes.DataType, externalAccess: x._dom.attributes.ExternalAccess }))
                }
            })

            let addOns = parse.find('AddOnInstructionDefinition').map((addon) => {
                //Check for aliased LocalTag/Parameter
                return {
                    name: addon._dom.attributes.Name,
                    params: addon.find('Parameter')?.map((x) => ({ name: x._dom.attributes.Name, type: x._dom.attributes.DataType, externalAccess: x._dom.attributes.ExternalAccess }))
                }
            })

            console.log({
                // tags: tags.map((tag) => {
                //     return {
                //         name: tag._dom.attributes.Name,
                //         type: tag._dom.attributes.DataType,
                //         externalAccess: tag._dom.attributes.ExternalAccess,
                //         fields: (dataTypes.concat(addOns)).find((a) => a.name === tag._dom.attributes.DataType)?.params
                //     }
                // }), 
                dataTypes: dataTypes,
                addOns: addOns
            })
            // setFile(parse)
        } else if (ext === 'csv') {
            let parse = Papa.parse(props.file.content, { header: true });
            console.log({ parse })
            // setFile(parse)

        } else {

        }

    }, [props.file])

    useEffect(() => {
        let imTypes = importTypes.reduce((prev, curr) => {
            if(!curr) return prev;
            let parts = curr?.name?.split('.')

            let type = types.find((a) => a.name == parts?.[0])
            if(!type) return prev;

            return {
                ...prev,
                [parts[0]]: {
                    ...prev[parts[0]],
                    [parts[1]]: type.fields.find((a) => a.name == parts[1]).type
                }
            }
        }, {})

        props.onChange({
            tags: importTags.map((importTag) => tags.find((a) => a.name === importTag.name)).filter((a) => a != undefined),
            types: Object.keys(imTypes).map((k) => ({name: k, fields: Object.keys(imTypes[k]).map((typeK) => ({name: typeK, type: imTypes[k][typeK] }) )}))
        })
    }, [tags, types, importTags, importTypes])

    return (
        <Box>
            <Box sx={{ bgcolor: 'secondary.main', marginBottom: '6px' }}>
                <Tabs
                    value={view}
                    onChange={(e, value) => setView(value)}
                >
                    <Tab value={'tags'} label="Tags" />
                    <Tab value={'types'} label="Types" />
                </Tabs>
            </Box>
            {view == 'tags' ? (
                <TagTable 
                    tags={tags} 
                    types={types}
                    currentTags={props.tags}
                    currentTypes={props.types}
                    importTags={importTags}
                    importTypes={importTypes}
                    onImportTagChanged={(tag) => {
                        setImportTags((importTags) => {
                            let tags = importTags.slice();
                            let ix = importTags.findIndex((a) => a.name == tag)

                            if(ix > -1){
                                tags.splice(ix, 1);
                            }else{
                                tags.push({name: tag})
                            }
                            return tags;
                        })
                    }} />
            ) : (
                <TypeTable
                    types={types}
                    currentTypes={props.types}
                    importTypes={importTypes}
                    onImportTypeChanged={(type, on) => {
                        setImportTypes((importTypes) => {
                            let types = importTypes.slice();
                            let ix = importTypes.findIndex((a) => a.name == type)

                            if (on && ix < 0) {
                                types.push({ name: type })
                            } else if (!on && on !== null && ix > -1) {
                                types.splice(ix, 1)
                            }

                            if (on == null && ix > -1) {
                                types.splice(ix, 1)
                            } else if(on == null && ix < 0){
                                types.push({ name: type })
                            }

                            return types;
                        })
                    }} />
            )}

        </Box>
    )
}