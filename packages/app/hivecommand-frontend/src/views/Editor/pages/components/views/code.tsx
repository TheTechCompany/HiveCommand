import { useMutation, gql } from '@apollo/client';
import { FileEditor } from '../../../../../components/file-editor';
import React from 'react';

export const Code = (props: any) => {

    return (
        <FileEditor
            code={props.code}
            files={props.files}
            onChange={(e) => {
                
                if(e){
                    props.onChange?.(e)
                }

            }}
            />
    )
}