import React, { useEffect, useState } from 'react';

import { Box, Button, Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { TextField } from '@mui/material';
import { DialogActions } from '@mui/material';

export interface ProgramModalProps {
  open: boolean;
  selected?: any;
  onSubmit?: Function;
  onClose?: Function;
  onDelete?: () => void;
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

  const onDelete = () => {
    props.onDelete?.();
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
    }else{
      setProgram({name: ''})
    }
  }, [props.selected])

  return (
    <Dialog 
      fullWidth
        open={props.open}
        onClose={onClose}>
          <DialogTitle>{program.id ? "Edit" : "Create"} Program</DialogTitle>
          <DialogContent>
            <Box sx={{padding: '6px'}}>
              <TextField 
                fullWidth
                size="small"
                label="Program name" 
                value={program.name} 
                onChange={(e) => setProgram({...program, name: e.target.value}) } />
            </Box>
          </DialogContent>
          <DialogActions sx={{display: 'flex', alignItems: 'center', justifyContent: props.selected?.id ? 'space-between' : "flex-end"}}>
            {props.selected?.id && <Button color="error" onClick={onDelete}>Delete</Button>}
            <Box sx={{display: 'flex'}}>
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={onSubmit} variant="contained" color="primary">{program.id ? "Save": "Create"}</Button>
            </Box>
          </DialogActions>
     </Dialog>
  );
}
