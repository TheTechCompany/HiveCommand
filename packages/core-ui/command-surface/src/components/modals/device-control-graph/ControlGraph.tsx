import { FormControl } from "@hexhive/ui"
import { HMITag, HMIType } from "@hive-command/interface-types";
import { Checkbox, Dialog, DialogTitle, Box, FormControlLabel, DialogContent, Button, DialogActions, Autocomplete, TextField, Divider } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { unit as mathUnit } from 'mathjs';

export const ControlGraphModal = (props: {tags: HMITag[], types: HMIType[], selected?: any, open: boolean, onClose?: () => void, onSubmit?: (graph: any) => void}) => {
  
  const [graph, setGraph] = useState<{
    unit?: string;
    deviceID?: string;
    keyID?: string;
    totalize?: boolean;
    timeBucket?: string;
    xAxisDomain?: [string, string],
    yAxisDomain?: [string, string],
  }>({});

  const customAxis = graph.xAxisDomain != undefined && graph.yAxisDomain != undefined
  
  useEffect(() => {
    setGraph({
      ...props.selected,
      deviceID: props.selected?.tag?.id,
      keyID: props.selected?.subkey?.id,
      totalize: props.selected?.total
    })
  }, [props.selected])

  const onSubmit = () => {
    props.onSubmit?.(graph);
  };

  const subkeyOptions = useMemo(() => {

    let type = props.tags?.find((a) => a.id == graph.deviceID)?.type
    return props.types?.find((a) => a.name === type)?.fields || []

  }, [graph.deviceID, props.tags, props.types])


  const graphError = useMemo(() => {
    try{
      if(graph.unit) return (mathUnit(graph.unit).units.length < 2)
      return false;
    }catch(e){
      console.log({error: e})
      return true;
    }
  }, [graph.unit])

  const timeBucketError = useMemo(() => {
    try{
      if(graph.timeBucket) return (mathUnit(graph.timeBucket).to('seconds') == null)
      return false;
    }catch(e){
      console.log({error: e})
      return true;
    }
  }, [graph.timeBucket])

  return (
    <Dialog
      fullWidth
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle>{props.selected ? 'Update' : 'Add'} graph to report</DialogTitle>
      <DialogContent>
        <Box sx={{display: 'flex', paddingTop: '12px', flexDirection: 'column'}}>
          {/* <FormControl
            value={graph.deviceID || ''}
            onChange={(value) => setGraph({ ...graph, deviceID: value })}
            options={props.tags || []}
            labelKey="name"
            placeholder="Tag"
          /> */}
          <Autocomplete
            sx={{marginBottom: '12px'}}
            onChange={(event, value) => setGraph({...graph, deviceID: value?.id}) }
            options={(props.tags || [])?.slice()?.sort((a, b) => a.name?.localeCompare(b.name)) }
            value={props.tags?.find((a) => a.id === graph.deviceID) || null}
            getOptionLabel={(option: any) => typeof(option) === 'string' ? option : option.name}
            renderInput={(params) => <TextField  {...params}  label="Tag" size="small" />}
            />
 
          {subkeyOptions.length > 0 && (
              <Autocomplete
                sx={{marginBottom: '12px'}}
              value={subkeyOptions.find((a) => a.id == graph.keyID || '') || null}
              onChange={(event, value) => setGraph({ ...graph, keyID: value?.id })}
              options={
                subkeyOptions
                // props.tags?.find((item) => item.id == graph.deviceID)?.type
                //   .state || []
              }
              getOptionLabel={(option: any) => typeof(option) === 'string' ? option : option.name}
              renderInput={(params) => <TextField {...params} label="Field" size="small" />}
            />
          )}

          <Divider sx={{marginBottom: '12px'}} />

          <TextField 
            sx={{marginBottom: '12px'}}
            size="small"
            label="Units" 
            error={graphError}
            value={graph.unit} 
            onChange={(e) => setGraph({...graph, unit: e.target.value })} />

          <TextField 
            sx={{marginBottom: '12px'}}
            size="small"
            label="Time bucket"
            error={timeBucketError}
            value={graph.timeBucket}
            onChange={(e) => setGraph({ ...graph, timeBucket: e.target.value })} />
     
          <FormControlLabel label="Totalise" control={<Checkbox checked={graph.totalize || false} onChange={(e) => setGraph({...graph, totalize: e.target.checked})} />} />

          <Divider />
          
          <FormControlLabel label="Custom Axis" control={<Checkbox checked={customAxis} onChange={(e, checked) => {
            if(checked){
               setGraph({...graph, xAxisDomain: ['0', 'auto'], yAxisDomain: ['0', 'auto']})
            }else{
              setGraph({...graph, xAxisDomain: undefined, yAxisDomain: undefined})
            }
          }}/>} />
          
          {customAxis ? (
            <Box sx={{display: 'flex', flexDirection: "column"}}>
              <Divider />
              <Box sx={{display: 'flex', marginBottom: '12px'}}>
                <TextField 
                  sx={{marginRight: '6px'}}
                  fullWidth 
                  size="small" 
                  onChange={(e) => setGraph({...graph, xAxisDomain: [ e.target.value, graph.xAxisDomain?.[1] || ''] })} 
                  value={graph.xAxisDomain?.[0] || ''} 
                  label={"X Start"} /> 
                <TextField 
                  sx={{marginLeft: '6px'}}
                  fullWidth 
                  size="small" 
                  onChange={(e) => setGraph({...graph, xAxisDomain: [ graph.xAxisDomain?.[0] || '',  e.target.value ] })} 
                  value={graph.xAxisDomain?.[1] || ''} 
                  label={"X End"} />
              </Box>
              <Box sx={{display: 'flex'}}>
                <TextField 
                  sx={{marginRight: '6px'}}
                  fullWidth 
                  size="small" 
                  onChange={(e) => setGraph({...graph, yAxisDomain: [ e.target.value, graph.yAxisDomain?.[1] || ''] })} 
                  value={graph.yAxisDomain?.[0] || ''} 
                  label={"Y Start"} /> 
                <TextField
                  sx={{marginLeft: '6px'}}
                  fullWidth
                  size="small" 
                  onChange={(e) => setGraph({...graph, yAxisDomain: [ graph.yAxisDomain?.[0] || '',  e.target.value ] })} 
                  value={graph.yAxisDomain?.[1] || ''} 
                  label={"Y End"} />
              </Box>
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
        <Button variant="contained" onClick={onSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};
