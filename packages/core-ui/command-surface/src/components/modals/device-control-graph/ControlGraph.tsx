import { FormControl } from "@hexhive/ui";
import { Checkbox, Dialog, DialogTitle, Box, FormControlLabel, DialogContent, Button, DialogActions } from "@mui/material";
import React, { useEffect, useState } from "react";

export const ControlGraphModal = (props: {devices: any[], selected?: any, open: boolean, onClose?: () => void, onSubmit?: (graph: any) => void}) => {
  const [graph, setGraph] = useState<{
    deviceID?: string;
    keyID?: string;
    totalize?: boolean;
  }>({});

  useEffect(() => {
    setGraph({
      ...props.selected,
      deviceID: props.selected?.dataDevice?.id,
      keyID: props.selected?.dataKey?.id,
      totalize: props.selected?.total
    })
  }, [props.selected])

  const onSubmit = () => {
    props.onSubmit?.(graph);
  };
  return (
    <Dialog
      fullWidth
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle>Add graph to report</DialogTitle>
      <DialogContent>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <div style={{marginTop: '9px'}} />
          <FormControl
            value={graph.deviceID}
            onChange={(value) => setGraph({ ...graph, deviceID: value })}
            options={props.devices || []}
            labelKey="name"
            placeholder="Select device"
          />
          <div style={{marginTop: '9px'}} />
          <FormControl
            value={graph.keyID}
            onChange={(value) => setGraph({ ...graph, keyID: value })}
            options={
              props.devices?.find((item) => item.id == graph.deviceID)?.type
                .state || []
            }
            labelKey="key"
            placeholder="Select key"
          />
          <FormControlLabel label="Totalise" control={<Checkbox checked={graph.totalize} onChange={(e) => setGraph({...graph, totalize: e.target.checked})} />} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
        <Button variant="contained" onClick={onSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};