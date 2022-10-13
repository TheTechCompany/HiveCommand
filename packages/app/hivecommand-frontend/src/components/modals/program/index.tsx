import React, { useEffect, useState } from 'react';

import { TextInput } from 'grommet';
import { BaseModal } from '../base';
import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';

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
        open={props.open}
        onClose={onClose}
        onSubmit={onSubmit}
        title="Edit Program">
          <DialogTitle>{program.id ? "Edit" : "Create"} Program</DialogTitle>
          <TextInput placeholder="Program name" value={program.name} onChange={(e) => setProgram({...program, name: e.target.value}) } />
     </Dialog>
  );
}
