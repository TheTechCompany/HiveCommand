import React, { useEffect, useState } from 'react';

import { Box, Button, Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { TextField } from '@mui/material';
import { DialogActions } from '@mui/material';

export interface FunctionModalProps {
  open: boolean;
  selected?: any;
  onSubmit?: Function;
  onClose?: Function;
}

export const FunctionModal : React.FC<FunctionModalProps> = (props) => {

  const [ fd, setFunction ] = useState<{id?: string, name: string}>({name: ''})

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
        ...fd
      })
    }
  }

  useEffect(() => {
    if(props.selected){
      setFunction({...props.selected})
    }
  }, [props.selected])

  return (
    <Dialog 
      fullWidth
        open={props.open}
        onClose={onClose}>
          <DialogTitle>{fd.id ? "Edit" : "Create"} Function</DialogTitle>
          <DialogContent>
            <Box sx={{padding: '6px'}}>
              <TextField 
                fullWidth
                size="small"
                label="Function name" 
                value={fd.name} 
                onChange={(e) => setFunction({...fd, name: e.target.value}) } />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onSubmit} variant="contained" color="primary">{fd.id ? "Save": "Create"}</Button>
          </DialogActions>
     </Dialog>
  );
}
