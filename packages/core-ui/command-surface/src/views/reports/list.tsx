import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemButton, Typography } from "@mui/material";
import React, { useContext, useMemo, useState } from "react";
import { DeviceControlContext } from "../../context";
import { useParams } from "react-router-dom";
import moment from 'moment';
import { Download } from "@mui/icons-material";
import {saveAs} from 'file-saver'

const baseToBlob = (base64String, contentType = '') => {
    console.log(base64String)
    const byteCharacters : any = atob(base64String);
    const byteArrays: any[]= [];

    for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
    }

    const byteArray = new Uint8Array(byteArrays);
    return new Blob([byteArray], { type: contentType });
}

export const ReportList = () => {

    const { activePage } = useParams();

    const { client, activeProgram, reports } = useContext(DeviceControlContext);

    const activeReport = reports?.find((a) => a.id == activePage);

    const [ downloading, setDownloading ] = useState<string[]>([]);

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays : any[] = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray : any = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
          
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

  
    const download = async (startDate: Date, endDate: Date) => {
        if(activePage)
        return client?.downloadReport?.(activePage, startDate, endDate).then(async (data) => {
            // const res = await fetch(`data:application/vnd.ms-excel;base64,${data.downloadDeviceReports?.xlsx}`)
            // const blob = await res.blob()
            saveAs(baseToBlob(data.data.downloadDeviceReports?.xlsx?.replace(/\r\n/g, '')), `${moment(startDate).format('DD/MM/YYYY')}-${moment(endDate).format('DD/MM/YYYY')}.xlsx`)
        });
    }

    const periods = useMemo(() => {

        const recurring = activeReport?.recurring;

        const startPeriod = moment(activeReport?.startDate);
        const nextPeriod = activeReport?.endDate || moment.duration(...(activeReport?.reportLength?.split(' ') || []))

        if(recurring){

            console.log(moment(activeReport?.reportLength))
            const duration = moment.duration(...(activeReport?.reportLength?.split(' ') || []))

            const periods = Math.floor(
                moment().diff(moment(startPeriod), 'seconds') / duration.as('seconds')
            )
            
            console.log({periods, duration});

             return Array.from(Array(periods)).map((p, ix) => {
                 return {
                    startDate: moment(startPeriod).add(ix * duration.as('seconds'), 'seconds'),
                    endDate: moment(startPeriod).add((ix + 1) * duration.as('seconds'), 'seconds')
                 }
            })
        }else{
            return [{startDate: startPeriod, endDate: nextPeriod}]
        }

    }, [activeReport])

    console.log({periods});

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <List sx={{flex: 1}}>
                {periods.map((p, ix) => (
                    <ListItem secondaryAction={
                        <IconButton onClick={() => {
                            setDownloading([...downloading, ix])
                            download(p.startDate, p.endDate).then(() => {
                                setDownloading(downloading.filter((a) => a != ix))
                            }).catch((err) => {
                                setDownloading(downloading.filter((a) => a != ix))
                            })
                        }} size="small">
                            {downloading.indexOf(ix) > -1  ? <CircularProgress size="small" /> : <Download fontSize="inherit"/>}
                        </IconButton>
                    }>
                        <ListItemButton>
                            {moment(p.startDate).format('DD/MM/YYYY')} - {moment(p.endDate).format('DD/MM/YYYY')}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
 
        </Box>
    );
}