import React, { useRef, useEffect, useMemo } from 'react';
import * as monaco from 'monaco-editor';
import { getOPCType } from '.';
import { HMIVariable } from '../../views/Editor/pages/controls/context';
import { styled } from '@mui/material';

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

    extraLib?: string;
    defaultValue?: string;
}

export const Editor: React.FC<EditorProps> = (props) => {
	const divEl = useRef<HTMLDivElement>(null);

	const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

    // const deviceValueMap = useMemo(() => {

    //     const printJson =  (elem: ValueStoreItem) => {

    //         if(elem.name.match('[-=.\/:]') != null) return '';
            
    //         return elem.children && elem.children.length > 0 ? 
    //             `${elem.name}: { ${elem.children.map(printJson).join('\n')} }` : 
    //             `${elem.name}: ${getOPCType(elem.type)};`
    //     }
        

    //     //TODO add readonly fields
    //     let inf = `interface ValueStore {
    //         ${(props.valueStore || [])?.map(printJson).join(';\n')}
    //     }`
    //     return inf;

    // }, [props.valueStore])

    // console.log(props.variables)

    // const variableMap = useMemo(() => {
        
    //     const printJson = (elem: HMIVariable) => {
    //         return `${elem.name}: ${elem.type}`;
    //     }

    //     let inf = `interface VariableStore {
    //         ${(props.variables || [])?.map(printJson).join(';\n')}
    //     }`
    //     return inf;
    // }, [props.variables])
    
    const extraLib = `
        type DeepPartial<T> = {
            [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
        };
        ${props.extraLib}
    `
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

            var libUri = "ts:filename/facts.d.ts";
            monaco.languages.typescript.javascriptDefaults.addExtraLib(extraLib, libUri);
            // When resolving definitions and references, the editor will try to use created models.
            // Creating a model for the library allows "peek definition/references" commands to work with the library.
            let model = monaco.editor.getModel(monaco.Uri.parse(libUri));

            if(model){
              model.setValue(extraLib)
            }else{
              monaco.editor.createModel(extraLib, "typescript", monaco.Uri.parse(libUri));
            }

            let mainModel = monaco.editor.getModel(monaco.Uri.parse("file:///main.tsx"));

            if(mainModel){ 
                mainModel.setValue(props.defaultValue)
            }else{
                mainModel = monaco.editor.createModel(props.defaultValue, "typescript", monaco.Uri.parse("file:///main.tsx"));
            }


			editor.current = monaco.editor.create(divEl.current, {
                model: mainModel,

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

            editor.current.onDidChangeModelContent((e) => {
                props.onChange?.(editor.current.getValue())
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
            model.setValue(props.value);
        }
    }, [props.value]);

    useEffect(() => {
        var libUri = "ts:filename/facts.d.ts";

        let model = monaco.editor.getModel(monaco.Uri.parse(libUri));

        if(model){
          model.setValue(extraLib)
        }else{
          monaco.editor.createModel(extraLib, "typescript", monaco.Uri.parse(libUri));
        }
        
    }, [extraLib])

	return <div className={props.className} style={{display: 'flex', height: '100%', width: '100%'}} ref={divEl}></div>;
};
