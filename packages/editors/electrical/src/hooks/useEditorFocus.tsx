import React, { useState } from 'react';

export const useEditorFocus = () => {
    const [ editorActive, setEditorActive ] = useState(false);

    return {
        editorActive,
        onEditorEnter: () => setEditorActive(true),
        onEditorLeave: () => setEditorActive(false)
    }
}