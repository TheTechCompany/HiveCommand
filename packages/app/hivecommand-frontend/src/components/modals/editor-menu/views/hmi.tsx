import { FormInput } from '@hexhive/ui';
import { Box, Checkbox, FormControlLabel, TextField } from '@mui/material'
import React from 'react'
import { useMenuContext } from '../context';

export const HMIView = () => {

    const {item, setItem} = useMenuContext();

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <TextField 
                fullWidth
                value={item?.name || ''}
                onChange={(e) => {
                    setItem({...item, name: e.target.value})
                }}
                size="small"
                label="HMI View Name" />

            <FormControlLabel 
                control={
                    <Checkbox 
                        checked={item.localHomepage} 
                        onChange={(e) => {
                            setItem({
                                ...item,
                                localHomepage: e.target.checked
                            })
                        }} />
                } 
                label="Local Homepage" />
            <FormControlLabel 
                control={
                    <Checkbox 
                        checked={item.remoteHomepage}
                        onChange={(e) => {
                            setItem({
                                ...item,
                                remoteHomepage: e.target.checked
                            })
                        }}
                        />
                } 
                label="Remote Homepage" />
        </Box>
    )
}