import React from 'react';
import { Autocomplete, Box, IconButton, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material'
import { gql, useMutation } from '@apollo/client';

export const ComponentProperties = (props: any) => {

    const [ createProperty ] = useMutation(gql`
        mutation CreateProperty($key: String, $scalar: String, $typeId: String) {
            createCommandProgramComponentProperty(program: "${props.activeProgram}", component: "${props.component}", key: $key, scalar: $scalar, typeId: $typeId){
                id
            }
        }
    `, {
        refetchQueries: ['GetComponentInfo']
    })
    

    const [ updateProperty ] = useMutation(gql`
        mutation UpdateProperty($id: ID, $key: String, $scalar: String, $typeId: String){
            updateCommandProgramComponentProperty(program: "${props.activeProgram}", component: "${props.component}", id: $id, key: $key, scalar: $scalar, typeId: $typeId){
                id
            }
        }
    `, {
        refetchQueries: ['GetComponentInfo']
    })

    const [ deleteProperty ] = useMutation(gql`
        mutation DeleteProperty($id: ID){
            deleteCommandProgramComponentProperty(program: "${props.activeProgram}", component: "${props.component}", id: $id){
                id
            }
        }
    `, {
        refetchQueries: ['GetComponentInfo']
    })

    const [ updateMain ] = useMutation(gql`
        mutation UpdateMainFile ($id: ID!, $mainId: String){
            updateCommandProgramComponent(program: "${props.activeProgram}", id: $id, input: { mainId: $mainId } ){
                id
            }
        }
    `, {
        refetchQueries: ['GetComponentInfo']
    })


    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{margin: '6px'}}>
                <Autocomplete
                    size="small"
                    value={props.files?.find((a) => a.id == props.mainId) || ''}
                    onChange={(e, value) => {
                        updateMain({
                            variables: {
                                id: props.component,
                                mainId: value.id
                            }
                        })
                    }}
                    options={props.files}
                    getOptionLabel={(option: any) => typeof(option) == 'string' ? option : option.path}
                    renderInput={(params) => <TextField {...params} label="Main" />}
                    />
            </Box>
            {/* <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <IconButton onClick={() => {
                    createProperty({
                        variables: {
                            key: '',
                            // scalar: ''
                        }
                    })
                }}>
                    <Add />
                </IconButton>
            </Box> */}
            <Typography>Exports</Typography>
            <Box sx={{ flex: 1, display: 'flex', padding: '6px', flexDirection: 'column' }}>
                {props?.properties?.map((prop) => {
                    return (
                        <Box sx={{display: 'flex'}}>
                            <TextField  
                                fullWidth 
                                size="small"
                                onChange={(e) => updateProperty({
                                    variables: {
                                        id: prop.id,
                                        key: e.target.value
                                    }
                                })}
                                value={prop.key} />
                            <Autocomplete
                                fullWidth
                                options={[]}
                                size="small"
                                renderInput={(params) => <TextField  {...params} />}
                                />
                        </Box>
                    )
                })}
            </Box>
        </Box> 
    )
}