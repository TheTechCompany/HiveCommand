import React, { useState } from 'react';

export const useEditorPosition = () : [{x: number, y: number} | null, any, boolean, any] => {
    const [ editorActive, setEditorActive ] = useState(false);

    const [ cursorPosition, setCursorPosition ] = useState<{x: number, y: number} | null>(null);


    return [ editorActive ? cursorPosition : null, setCursorPosition, editorActive, setEditorActive]
}