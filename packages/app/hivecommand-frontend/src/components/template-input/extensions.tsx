import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { autocompletion, closeCompletion, moveCompletionSelection, acceptCompletion, CompletionContext, CompletionSource } from "@codemirror/autocomplete";
import { Compartment, CompletionResult, EditorState, EditorView, Extension, StateEffect, ViewUpdate } from "./codemirror";
import { Prec } from "@codemirror/state";
import { basicSetup } from 'codemirror'
import { bracketMatching, syntaxTree } from '@codemirror/language'
import { keymap } from '@codemirror/view';

const compartments: Compartment[] = [];

export const useExtensions = (props: any) => {
    const autocompletionExtension = useAutocompletionExtension(props);
    const [focusExtension, isFocus] = useFocusExtension(props.onFocus);
    const changeExtension = useChangeExtension(props.onChange);
    // const bracketMatch = 

    const rawExtensions = useMemo(
        () => [
            changeExtension,
            EditorView.lineWrapping,
            autocompletionExtension,
            focusExtension,
            bracketMatching()
        ],
        [
            changeExtension,
            EditorView.lineWrapping,
            autocompletionExtension,
            focusExtension,
        ]
    );

    const extensions = useMemo(() => {
        // auto build global Compartments
        for (let i = compartments.length; i < rawExtensions.length; ++i) {
          compartments.push(new Compartment());
        }
        return rawExtensions.map((e, i) => compartments[i].of(e));
    }, [rawExtensions]);

    const reconfigure = useCallback(
        (view?: EditorView) => {
          if (view) {
            const effects: StateEffect<unknown>[] = [];
            rawExtensions.forEach((e, i) => {
              if (compartments[i].get(view.state) !== e) {
                // log.log("reconfigure", i);
                effects.push(compartments[i].reconfigure(e));
              }
            });
            if (effects.length > 0) {
              view.dispatch({ effects });
            }
          }
        },
        [rawExtensions]
    );

    return {
        extensions: extensions,
        isFocus,
        reconfigure
    }

}

const keyMapExtensions = Prec.highest(
    keymap.of([
      // {key: "Ctrl-Space", run: startCompletion},

      { key: "Escape", run: closeCompletion },
      { key: "ArrowDown", run: moveCompletionSelection(true) },
      { key: "Ctrl-n", run: moveCompletionSelection(true) },
      { key: "ArrowUp", run: moveCompletionSelection(false) },
      { key: "Ctrl-p", run: moveCompletionSelection(false) },
      { key: "PageDown", run: moveCompletionSelection(true, "page") },
      { key: "PageUp", run: moveCompletionSelection(false, "page") },
      { key: "Tab", run: acceptCompletion },
      { key: "Enter", run: acceptCompletion },
    ])
);


export function useChangeExtension(
    onChange?: (state: EditorState) => void,
    extraOnChange?: (state: EditorState) => void
  ): Extension {
    const onChangeRef = useRef<(state: EditorState) => void>();
    onChangeRef.current = extraOnChange
      ? (state: EditorState) => {
          onChange?.(state);
          extraOnChange(state);
        }
      : onChange;
    return useMemo(() => {
      const onUpdate = (update: ViewUpdate) => {
        // log.log("update:", update);
        if (update.docChanged) {
          onChangeRef.current?.(update.state);
        }
      };
      return EditorView.updateListener.of(onUpdate);
    }, []);
}

export function useFocusExtension(onFocus?: (focused: boolean) => void): [Extension, boolean] {
    const [isFocus, setFocus] = useState(false);
    const onFocusRef = useRef<(focused: boolean) => void>();
    onFocusRef.current = onFocus;
    const ext = useMemo(
      () =>
        EditorView.updateListener.of((update) => {
          if (update.focusChanged) {
            const focused = update.view.hasFocus;
            setFocus(focused);
            onFocusRef.current?.(focused);
            // log.log("FocusChanged: ", update.view.hasFocus);
            if (!focused) {
            
                //   closeCompletion(update.view); // close completion on blur
            }
          }
        }),
      []
    );
    return [ext, isFocus];
  }
  

export function getDataInfo(data: Record<string, unknown>, path: string) {
    let currentData: any = data;
    let offset: number = 0;
    for (let i = 0; i < path.length; ++i) {
      switch (path[i]) {
        case ".":
        case "[":
        case "]":
          if (offset < i) {
            currentData = currentData[path.slice(offset, i).trim()];
            if (!currentData || typeof currentData !== "object") {
              return;
            }
          }
          offset = i + 1;
          if (path[i] === "." && Array.isArray(currentData)) {
            return;
          }
          if (path[i] === "[" && !Array.isArray(currentData)) {
            return;
          }
          break;
      }
    }
    return [currentData, offset, path.slice(offset)];
  }
  
class ExposingCompletionSource {
    data?: Record<string, unknown>;

    options: {label: string, type: 'keyword'}[] = [];

    completionSource(
        context: CompletionContext
    ): CompletionResult | Promise<CompletionResult | null> | null {
        const matchPath = context.matchBefore(/(\w+(\[\s*\d+\s*\])*\.)*\w*/);
        if(!matchPath) return null

        // const info = getDataInfo(this.data, matchPath.text);

        // const [ currentData, offset ] = info;

        console.log({matchPath: matchPath.from})
        // let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
        // // if (nodeBefore.name != "BlockComment" ||
        // //     context.state.sliceDoc(nodeBefore.from, nodeBefore.from + 3) != "/**")
        // //     return null
        // let textBefore = context.state.sliceDoc(nodeBefore.from, context.pos)
        // let tagBefore = /{{\w*}}$/.exec(textBefore)
        // console.log({tagBefore, textBefore})
        // if (!tagBefore && !context.explicit) return null

        if(context.matchBefore(/\{\{\s*[\w\.]*/) === null) return null

        const matchString = context.state.doc.toString().slice(matchPath.from, matchPath.to)
        
        //AV101.op
        //AV101.open AV101.struct.on | AV101 AV101.open - object AV101.struct
        // let reduced_options = this.options.

        let dotCount = ((matchString || '').match(/\./) || []).length
        console.log(dotCount)

        let options = this.options.slice().filter((a) => {
            return (a.label?.match(/\./) || []).length === dotCount && a.label.indexOf(matchString) > -1
        });

        console.log("Matching options", matchString, this.options);

        //Start matching based on segment with reduced set
        // item1.item2.item3
        // item1 -> 
        // item2

        return {
            from: matchPath.from,
            options: options,
            filter: false,
            // validFor: ((text: string,
            //     from: number,
            //     to: number,
            //     state: EditorState) => {
            //         console.log({text, from, to, state});
            //         return (text.length % 1 == 0 && text.length % 2 != 0) ? true: false;
            //     }) || /^\w*$/,
        }
    }

    constructor(options: any[]){
        this.options = options

        this.completionSource = this.completionSource.bind(this);
    }
}
export function useCompletionSources(props: any) {
    const { language, codeType, exposingData, enableMetaCompletion } = props;
    // const context = useContext(QueryContext); // FIXME: temporarily handle, expect to delete after the backend supports eval
    
    // auto-completion for comp exposing
    const exposingSource = useMemo(() => new ExposingCompletionSource(exposingData), [exposingData]);


    // // javascript syntax auto-completion
    // const ternServer = useMemo(
    //   () => (context?.disableJSCompletion ? undefined : new TernServer()),
    //   []
    // );
    // sql syntax & meta-data auto-completion
    // const sqlSource = useMemo(() => new SQLCompletionSource(), []);
  
    
    // useEffect(() => {
    //   exposingSource.data = exposingData;
    // }, [exposingSource, exposingData]);
  

    // const sqlMetaData = useContext(MetaDataContext);
    // useEffect(() => {
    //   sqlSource.metaData = sqlMetaData;
    // }, [sqlSource, sqlMetaData]);
  
    const completionSources = useMemo(() => {
      const sources: CompletionSource[] = [];
      
      sources.push(exposingSource.completionSource);


      if (language === "css") {
        // sources.push(cssCompletionSource);
      } else {
        // sources.push(exposingSource);


        // if (ternServer) {
        //   sources.push(ternServer);
        // }
      }
    //   if (enableMetaCompletion) {
    //     sources.push(sqlSource);
    //   }
      return sources
      
    //   .map((c) => {
    //     c.setIsFunction(codeType === "Function");
    //     return c.completionSource;
    //   });
    }, [enableMetaCompletion, exposingData, language, codeType]);
    return completionSources;
}

  
export function useAutocompletionExtension(props: any) {
    const completions = useCompletionSources({
        ...props,
        exposingData: props.exposingData
    });

    return useMemo(
      () => [
        autocompletion({
          override: completions,
        //   activateOnTyping: false,

          defaultKeymap: false,
        }),
        keyMapExtensions,
      ],
      [completions]
    );
}
