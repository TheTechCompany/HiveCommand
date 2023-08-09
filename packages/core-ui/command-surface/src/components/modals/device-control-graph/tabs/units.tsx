import { Box, TextField } from '@mui/material';
import React, { useMemo } from 'react';
import { unit as mathUnit } from 'mathjs';

export const UnitEditor = (props) => {

    const graphError = useMemo(() => {
        try{
          if(props.graph.unit) return (mathUnit(props.graph.unit).units.length < 2)
          return false;
        }catch(e){
          console.log({error: e})
          return true;
        }
      }, [props.graph.unit])
    
      const timeBucketError = useMemo(() => {
        try{
          if(props.graph.timeBucket) return (mathUnit(props.graph.timeBucket).to('seconds') == null)
          return false;
        }catch(e){
          console.log({error: e})
          return true;
        }
      }, [props.graph.timeBucket])

      
    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <TextField 
                sx={{marginBottom: '12px'}}
                size="small"
                label="Units" 
                error={graphError}
                value={props.graph.unit} 
                onChange={(e) => props.onChange?.({...props.graph, unit: e.target.value })} />

            <TextField 
                sx={{marginBottom: '12px'}}
                size="small"
                label="Time bucket"
                error={timeBucketError}
                value={props.graph.timeBucket}
                onChange={(e) => props.onChange?.({ ...props.graph, timeBucket: e.target.value })} />
        
        </Box>
    )
}