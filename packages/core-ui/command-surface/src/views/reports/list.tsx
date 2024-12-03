import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemButton, Tooltip, Typography } from "@mui/material";
import React, { useContext, useMemo, useState } from "react";
import { DeviceControlContext } from "../../context";
import { useParams } from "react-router-dom";
import moment from 'moment';
import { Add, Download } from "@mui/icons-material";
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

    const [ downloading, setDownloading ] = useState<number[]>([]);

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

  
    const download = async (url: string, reportName?: string, startDate?: Date, endDate?: Date) => {
        if(activePage)
        return await fetch(url).then((r) => r.blob()).then((data) => {
            saveAs(data, `${reportName}-${moment(startDate).format('DD/MM/YYYY')}-${moment(endDate).format('DD/MM/YYYY')}.xlsx`)
        })

        // return client?.downloadReport?.(activePage, startDate, endDate).then(async (data) => {
        //     // const res = await fetch(`data:application/vnd.ms-excel;base64,${data.downloadDeviceReports?.xlsx}`)
        //     // const blob = await res.blob()
        //     saveAs(baseToBlob(data.data.downloadDeviceReports?.xlsx?.replace(/\r\n/g, '')), `${moment(startDate).format('DD/MM/YYYY')}-${moment(endDate).format('DD/MM/YYYY')}.xlsx`)
        // });
    }

    const periods = useMemo(() => {




        return (activeReport?.instances || [])?.slice()?.sort((a, b) => new Date(a.startDate)?.getTime() - new Date(b.startDate)?.getTime());



        // const recurring = activeReport?.recurring;

        // const startPeriod = moment(activeReport?.startDate);
        // const nextPeriod = activeReport?.endDate || moment.duration(...(activeReport?.reportLength?.split(' ') || []))

        // if(recurring){

        //     console.log(moment(activeReport?.reportLength))
        //     const duration = moment.duration(...(activeReport?.reportLength?.split(' ') || []))

        //     const periods = Math.floor(
        //         moment().diff(moment(startPeriod), 'seconds') / duration.as('seconds')
        //     )
            
        //     console.log({periods, duration});

        //      return Array.from(Array(periods)).map((p, ix) => {
        //          return {
        //             startDate: moment(startPeriod).add(ix * duration.as('seconds'), 'seconds'),
        //             endDate: moment(startPeriod).add((ix + 1) * duration.as('seconds'), 'seconds')
        //          }
        //     })
        // }else{
        //     return [{startDate: startPeriod, endDate: nextPeriod}]
        // }

    }, [activeReport])


    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            <List sx={{overflow: 'auto', flex: 1}}>
                {periods.map((p, ix) => (
                    <ListItem secondaryAction={
                        p.done ? <IconButton onClick={() => {
                            setDownloading([...downloading, ix])
                            download(p.url, activeReport?.name, p.startDate, p.endDate).then(() => {
                                setDownloading(downloading.filter((a) => a != ix))
                            }).catch((err) => {
                                setDownloading(downloading.filter((a) => a != ix))
                            })
                        }} size="small">
                            {downloading.indexOf(ix) > -1  ? <CircularProgress sx={{width: '20px'}} size="small" /> : <Download fontSize="inherit"/>}
                        </IconButton> : <Tooltip title="Processing report"><CircularProgress sx={{width: '20px'}} size="small" /></Tooltip>
                    }>
                        <ListItemButton sx={{display: 'flex', alignItems: 'flex-start', flexDirection: "column"}}>
                            <span>{moment.utc(p.startDate).format('DD/MM/YYYY')} - {moment.utc(p.endDate).format('DD/MM/YYYY')}</span>
                            <span style={{fontSize: '12px'}}>Created: {moment.utc(p.createdAt).format('DD/MM/YYYY')}</span>
                        </ListItemButton>
                    </ListItem>
                ))}
                {!activeReport?.recurring && (<ListItem onClick={() => {
                    if(activeReport) client?.createReportInstance?.(activeReport?.id)
                }} disablePadding>
                    <ListItemButton sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Add sx={{marginRight: '12px'}} />Create revision</ListItemButton>
                </ListItem>)}
            </List>
 
        </Box>
    );
}