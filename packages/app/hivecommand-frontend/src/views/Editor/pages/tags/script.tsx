import { Editor } from '../../../../components/script-editor/editor';
import React from 'react';
import { buildSchema } from 'graphql';

console.log(buildSchema('type AV101 { id: ID }'))


export const ScriptTagEditor = () => {
    return (
        <Editor value={`
type AV101 {
    name: [String]
    open: [Boolean]
}

type AV201 {
    name: String
}
        `} />
    )
}