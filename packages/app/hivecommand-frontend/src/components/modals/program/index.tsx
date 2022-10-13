import React, { useEffect, useState } from 'react';

import { Button, Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { TextField } from '@mui/material';
import { DialogActions } from '@mui/material';

export interface ProgramModalProps {
  open: boolean;
  selected?: any;
  onSubmit?: Function;
  onClose?: Function;
}

export const ProgramModal : React.FC<ProgramModalProps> = (props) => {

  const [ program, setProgram ] = useState<{id?: string, name: string}>({name: ''})

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
        ...program
      })
    }
  }

  useEffect(() => {
    if(props.selected){
      setProgram({...props.selected})
    }
  }, [props.selected])

  return (
    <Dialog 
      fullWidth
        open={props.open}
        onClose={onClose}>
          <DialogTitle>{program.id ? "Edit" : "Create"} Program</DialogTitle>
          <DialogContent>
            <TextField 
              fullWidth
              label="Program name" 
              value={program.name} 
              onChange={(e) => setProgram({...program, name: e.target.value}) } />

          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onSubmit} variant="contained" color="primary">{program.id ? "Save": "Create"}</Button>
          </DialogActions>
     </Dialog>
  );
}
