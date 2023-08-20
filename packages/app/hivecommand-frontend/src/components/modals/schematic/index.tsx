import React, { useEffect, useState } from 'react';

import { Box, Button, Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { TextField } from '@mui/material';
import { DialogActions } from '@mui/material';

export interface SchematicModalProps {
  open: boolean;
  selected?: any;
  onSubmit?: Function;
  onClose?: Function;
}

export const SchematicModal : React.FC<SchematicModalProps> = (props) => {

  const [ schematic, setSchematic ] = useState<{id?: string, name: string}>({name: ''})

  // const [ name, setName ] = React.useState<string>('');

  // useEff
  const onClose = () => {
    if(props.onClose){
      props.onClose();
    }
  }

  const onSubmit = () => {
    if(props.onSubmit){
      props.onSubmit({
        ...schematic
      })
    }
  }

  useEffect(() => {
    if(props.selected){
      setSchematic({...props.selected})
    }
  }, [props.selected])

  return (
    <Dialog 
      fullWidth
        open={props.open}
        onClose={onClose}>
          <DialogTitle>{schematic.id ? "Edit" : "Create"} Schematic</DialogTitle>
          <DialogContent>
            <Box sx={{padding: '6px'}}>
              <TextField 
                fullWidth
                size="small"
                label="Schematic name" 
                value={schematic.name} 
                onChange={(e) => setSchematic({...schematic, name: e.target.value}) } />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onSubmit} variant="contained" color="primary">{schematic.id ? "Save": "Create"}</Button>
          </DialogActions>
     </Dialog>
  );
}
