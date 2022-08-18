import { CodeEditor } from "@hexhive/ui"
import { Box } from "@mui/material"
import { useContext, useState } from "react";
import AceEditor from "react-ace";
import { ElementEditorContext } from "../context";

export const CodeView = () => {
    const { editDevice } = useContext(ElementEditorContext);
    
    // const [ code, setCode ] = useState('')

    return (
        <Box sx={{flex: 1, display: 'flex'}}>
            
            <AceEditor
                width="100%"
                height="100%"
                onChange={(code) => {
                    console.log({code})
                    // setCode(code)
                }}
                mode='javascript'
                theme='monokai'
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 4,
                }}
                value={editDevice?.code}/>
        </Box>
    )
}