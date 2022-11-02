import { Box, TextField } from "@mui/material";
import { useContext } from "react";
import { SetupContext } from "../context";

export const DiscoveryServerStage = () => {

    const { state, setState } = useContext(SetupContext);

    return (
        <Box sx={{flex: 1, display: 'flex', paddingLeft: '6px', paddingRight: '6px', alignItems: 'center'}}>
            <TextField 
                value={state.discoveryServer}
                onChange={(e) => setState({...state, discoveryServer: e.target.value})}
                size="small" 
                fullWidth 
                label="Discovery Server" 
                defaultValue={"discovery.hexhive.io"}/>

                
        </Box>
    )
}