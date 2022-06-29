import { TextInput, Text, Button } from "grommet"
import React, { useContext } from "react"
import { Box } from '@mui/material'
import { DeviceControlContext } from "../context";

export const ControlVariable = () => {

    const { program : {variables = []} } = useContext(DeviceControlContext);
    
    const renderVariableInput = (variable: {id: string, type: string, name: string}) => {
        switch(variable.type){
            case 'Number':
                return (<TextInput type={"number"} />)
            default:
                return null;
        }
    }

    return (
        <Box>
            <Text>Variables</Text>
            {variables.map((variable) => (
                <Box >
                    <Box>
                        <Text size="small">
                            {variable.name}
                        </Text>
                    </Box>
                    <Box> 
                        {renderVariableInput(variable)}
                    </Box>
                </Box>
            ))}
        </Box>
    )
}