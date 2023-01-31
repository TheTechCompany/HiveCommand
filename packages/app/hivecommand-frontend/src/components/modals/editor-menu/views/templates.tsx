import React, { useContext } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material'
import { CommandEditorContext } from '../../../../views/Editor/context';
import { useMenuContext } from '../context';
import { string } from 'mathjs';

export const TemplateView = () => {

    const { item, setItem } = useMenuContext();
    const { deviceTypes } = useContext(CommandEditorContext)

    console.log({item})
    // const deviceType = deviceTypes //?.find((a) => a.id == item?.type) || { tagPrefix: '' }

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <TextField
                sx={{marginBottom: '12px'}}
                value={item.name}
                onChange={(e) => setItem({...item, name: e.target.value})}
                size="small"
                label="Name" />

            <Autocomplete
                // disablePortal
                options={deviceTypes?.slice()?.sort((a, b) => a.name.localeCompare(b.name))}
                value={deviceTypes.find((a) => a.id == item.extends)}

                onChange={(event, newValue) => {
                    if(typeof(newValue) === 'string') return;
                    setItem({...item, extends: newValue?.id});
                    // updateState(label, newValue.id)
                    // if(!newValue){
                    //     updateState(label, null)
                    // }else{
                    //     setFunctionArgs(newValue);
                    //     setFunctionOpt(label)
                    // }
                }}
                getOptionLabel={(option) => typeof (option) == "string" ? option : option.name}
                // isOptionEqualToValue={(option, value) => option.id == value.id}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        label={"Extends"}
                    />
                }
                // value={value || ''}
                // onChange={(e) => {
                //     updateState(label, e.target.value)
                // }}
                size="small"
            // label={label} />
            />
        </Box>
    )
}