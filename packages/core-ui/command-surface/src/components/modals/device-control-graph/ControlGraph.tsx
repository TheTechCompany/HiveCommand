import { FormControl } from "@hexhive/ui"
import { HMITag, HMIType } from "../../../";
import { Checkbox, Dialog, DialogTitle, Box, FormControlLabel, DialogContent, Button, DialogActions, Autocomplete, TextField, Divider, Tabs, Tab } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { unit as mathUnit } from 'mathjs';
import { UnitEditor } from "./tabs/units";
import { ConditionBuilder } from "./tabs/conditions";

export const ControlGraphModal = (props: {tags: HMITag[], types: HMIType[], selected?: any, open: boolean, onClose?: () => void, onSubmit?: (graph: any) => void}) => {
  const [ tab, setTab ] = useState('units');

  const [graph, setGraph] = useState<{
    unit?: string;
    deviceID?: string;
    keyID?: string;
    totalize?: boolean;
    timeBucket?: string;
    conditions?: any;
  }>({});

  
  useEffect(() => {
    console.log(props.selected)
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

  console.log({subkeyOptions, graph, types: props.types, tags: props.tags});

  
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

          <FormControlLabel label="Totalise" control={<Checkbox checked={graph.totalize || false} onChange={(e) => setGraph({...graph, totalize: e.target.checked})} />} />

          <Box sx={{bgcolor: 'secondary.main', marginBottom: '12px'}}>
            <Tabs onChange={(e, value) => setTab(value)}>
              <Tab value="units" label="Units" />
              <Tab value="conditions" label="Conditions" />
            </Tabs>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            {tab == 'units' ? (
              <UnitEditor graph={graph} onChange={(e) => setGraph(e)} />
            ) : (
              <ConditionBuilder 
                types={props.types} 
                tags={props.tags}
                conditions={graph.conditions}
                onChange={(conditions) => setGraph({...graph, conditions})}  
                />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
        <Button variant="contained" onClick={onSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};
