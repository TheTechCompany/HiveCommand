import { Box, TextInput, Text, Button } from "grommet"
import React, { useContext } from "react"
import { MoreVertical } from 'grommet-icons'
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
        <Box 
            background="light-1"
            pad="xsmall"
            flex>
            <Text>Variables</Text>
            {variables.map((variable) => (
                <Box align="center" direction="row">
                    <Box flex>
                        <Text size="small">
                            {variable.name}
                        </Text>
                    </Box>
                    <Box flex> 
                        {renderVariableInput(variable)}
                    </Box>
                </Box>
            ))}
        </Box>
    )
}