import { gql, useQuery } from "@apollo/client";
import { ChevronLeft } from "@mui/icons-material";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { OPCUATreeView } from "../../components/opcua-treeview";

export const DeviceMapper = () => {

    const { id } = useParams();

    const { data } = useQuery(gql`
        query GetDeviceLayout ($id: ID) {
            commandDevices(where: {id: $id}){
                name

                dataLayout {
                    id
                    label
                }
            }
        }
    `, {
        variables: {
            id
        }
    })

    return (
        <Paper sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <Box sx={{bgcolor: 'secondary.main', color: 'white', padding: '6px', display: 'flex', alignItems: 'center'}}>
                <IconButton size="small" sx={{marginRight: '3px'}}>
                    <ChevronLeft fontSize="inherit" sx={{color: 'white'}} />
                </IconButton>
                <Typography>
                    Device Map : {data?.commandDevices?.[0]?.name}
                </Typography>
            </Box>
            <Box sx={{flex: 1}}>
                <OPCUATreeView items={[
                    {
                        id: 'root',
                        label: 'Root',
                        children: [
                            {
                                id: 'second',
                                label: "Second"
                            }
                        ]
                    }
                ]} />
            </Box>
        </Paper>
    )
}