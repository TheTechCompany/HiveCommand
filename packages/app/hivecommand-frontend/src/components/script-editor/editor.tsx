import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import * as monaco from 'monaco-editor';
import { styled } from '@mui/material';
import { IDisposable } from 'monaco-editor';

// // @ts-ignore
// self.MonacoEnvironment = {
// 	getWorkerUrl: function (_moduleId: any, label: string) {
// 		if (label === 'json') {
// 			return './json.worker.bundle.js';
// 		}
// 		if (label === 'css' || label === 'scss' || label === 'less') {
// 			return './css.worker.bundle.js';
// 		}
// 		if (label === 'html' || label === 'handlebars' || label === 'razor') {
// 			return './html.worker.bundle.js';
// 		}
// 		if (label === 'typescript' || label === 'javascript') {
// 			return './ts.worker.bundle.js';
// 		}
// 		return './editor.worker.bundle.js';
// 	}
// };

export interface ValueStoreItem {
    name: string;
    type?: string;
    children?: ValueStoreItem[];
}

export interface EditorProps {
    value: string;
    onChange?: (value: string) => void;

    // valueStore?: ValueStoreItem[]
    // variables?: HMIVariable[],
    // actions?: {name: string, type: string, args: {name: string, type: string}[]}[]

    className?: string;

    extraLib?: string | {path: string, content: string}[];
    defaultValue?: string;
}

export const Editor: React.FC<EditorProps> = (props) => {
	const divEl = useRef<HTMLDivElement>(null);

	const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

    const [ workingValue, setWorkingValue ] = useState<any>(null);
    
    const subscription = useRef<IDisposable>();
    const preventTriggerChangeEvent = useRef<boolean>(false);

    const extraLib = props.extraLib ? 
        typeof(props.extraLib) == 'string' ? `
            type DeepPartial<T> = {
                [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
            };
            ${props.extraLib}
        ` : props.extraLib.concat([{path: 'ts:base.d.ts', content: ` type DeepPartial<T> = {
            [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
        };` }]) : ''

    const loadLibs = () => {
        if(typeof(extraLib) == 'string'){
            var libUri = "ts:filename/facts.d.ts";

            let model = monaco.editor.getModel(monaco.Uri.parse(libUri));

            if(model){
                model.setValue(extraLib)
            }else{
                monaco.editor.createModel(extraLib, "typescript", monaco.Uri.parse(libUri));
            }
        
        }else{


            extraLib.map((lib) => {

                let model = monaco.editor.getModel(monaco.Uri.parse(`${lib.path}`));

                if(model){
                model.setValue(lib.content || '')
                }else{
                monaco.editor.createModel(lib.content, "typescript", monaco.Uri.parse(`${lib.path}`));
                }
                

            })
        }
    }

    const onChange = useCallback((value: string) => {
        if(props.value != value) {

                if(preventTriggerChangeEvent.current) return;
                props.onChange?.(value)
        }

    }, [props.value])

    useEffect(() => {
        // setWorkingValue(props.value)

        subscription.current?.dispose();
        subscription.current = editor.current?.onDidChangeModelContent((e) => {
            setTimeout(() => onChange?.(editor.current?.getModel()?.getValue()), 1);
        })
    }, [props.value])

	useEffect(() => {
		if (divEl.current) {

            // compiler options
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2016,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                jsx: monaco.languages.typescript.JsxEmit.Preserve
                // typeRoots: ["node_modules/@types"]
            });


            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false
            })

            loadLibs()

            //LIBS

            var modelLib = "ts:filename/libs.d.ts";

            let libModel = monaco.editor.getModel(monaco.Uri.parse(modelLib));
    
            if(libModel){
                libModel.setValue(`
              declare module "@mui/material";
              declare module "@mui/x-date-pickers";
              declare module "@mui/icons-material";
              declare module "@hexhive/ui";
              `)
            }else{
              monaco.editor.createModel( `
              declare module "@mui/material";
              declare module "@mui/icons-material";
              `, "typescript", monaco.Uri.parse(modelLib));
            }
            //ENDLIBS

            let mainModel = monaco.editor.getModel(monaco.Uri.parse("file:///main.tsx"));

            if(mainModel){ 
                mainModel.setValue(props.defaultValue || '')
            }else{
                mainModel = monaco.editor.createModel(props.defaultValue, "typescript", monaco.Uri.parse("file:///main.tsx"));
            }


			editor.current = monaco.editor.create(divEl.current, {
                model: mainModel,

                automaticLayout: true,

                // wordWrap: 'on',
                // automaticLayout: true,
                // minimap: {
                //     enabled: false
                // },
                // scrollbar: {
                //     vertical: 'auto'
                // },
                // showFoldingControls: 'never',
                // lineNumbers: 'off',
                // su
                // theme: 'vs-dark'
				// language: 'typescript',
			});

            subscription.current = editor.current.onDidChangeModelContent((e) => {
                setTimeout(() => onChange?.(editor.current?.getModel()?.getValue()), 1);
            })


		}
		return () => {
			editor.current.dispose();
            editor.current = null;
		};
	}, []);

    useEffect(() => {
        let model = monaco.editor.getModel(monaco.Uri.parse('file:///main.tsx'));

        if(model && model.getValue() !== props.value){
            preventTriggerChangeEvent.current = true;

            if(props.value) model.setValue(props.value);
              
            preventTriggerChangeEvent.current = false;
        }
    }, [props.value]);

    useEffect(() => {
        loadLibs()
    }, [extraLib])

	return <div className={props.className} style={{display: 'flex', width: '100%'}} ref={divEl}></div>;
};
