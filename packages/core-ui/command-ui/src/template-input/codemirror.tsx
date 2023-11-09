import { MutableRefObject, useCallback, useEffect, useRef } from "react";
import { EditorView } from '@codemirror/view'
import { EditorState, Extension } from '@codemirror/state'
import { autocompletion } from '@codemirror/autocomplete'
import { useExtensions } from './extensions'
import { basicSetup } from 'codemirror'

export { CompletionContext, ifNotIn, completeFromList } from "@codemirror/autocomplete";
export type { Completion, CompletionResult } from "@codemirror/autocomplete";
export { Compartment, EditorState, StateField, StateEffect } from "@codemirror/state";
export type { Extension } from "@codemirror/state";
export { EditorView, Decoration, keymap, placeholder, ViewUpdate } from "@codemirror/view";
export type { DecorationSet } from "@codemirror/view";

export interface CodeMirrorProps {
    value: string;
    onChange?: (value: string) => void;

    showLineNum?: boolean;

    exposingData?: any[];
}


export const useCodeMirror = (props: CodeMirrorProps, container: MutableRefObject<HTMLDivElement | undefined>) => {

    const { value, onChange } = props;

    const viewRef = useRef<EditorView>();

    const isTypingRef = useRef(0);
    const showLineNum = props.showLineNum ?? true;
  
    const handleChange = useCallback(
        (state: EditorState) => {
          window.clearTimeout(isTypingRef.current);
          isTypingRef.current = window.setTimeout(() => (isTypingRef.current = 0), 100);
          onChange?.(state.doc.toString());
        },
        [onChange]
      );
    //   reconfigure, isFocus

    
      const { extensions, isFocus, reconfigure } = useExtensions({
        ...props,
        showLineNum,
        onChange: handleChange,
        exposingData: props.exposingData
      });
      
      useEffect(() => reconfigure(viewRef.current), [reconfigure]);
      useEffect(() => {
        const view = viewRef.current;
        /**
         * will trigger in 2 cases
         * 1. switch to the same type of comp
         * 2. change the current comp's value by dispatchChangeValueAction
         */
        if (!view || (!isTypingRef.current && value !== view.state.doc.toString())) {
          const state = EditorState.create({ doc: value, extensions });
          if (view) {
            view.setState(state);
          } else {
            viewRef.current = new EditorView({ state, parent: container.current });
          }

        }
        console.log("Setting up code view")

      }, [container, value, extensions]);
    
    //   useClickCompNameEffect(viewRef.current, value, props.codeType, props.exposingData);
    
      useEffect(() => {
        viewRef?.current?.focus()
        return () => {
          viewRef.current?.destroy();
        };
      }, []);
    
      return { view: viewRef.current, isFocus };  
}