import React, { useRef, useEffect, useMemo, useState } from 'react';
import * as monaco from 'monaco-editor';
import { AutoTypings, LocalStorageCache } from 'monaco-editor-auto-typings';
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
    code?: {content: string, path: string};
    onChange?: (value: string) => void;

    // valueStore?: ValueStoreItem[]
    // variables?: HMIVariable[],
    // actions?: {name: string, type: string, args: {name: string, type: string}[]}[]

    className?: string;

    extraLib?: string;
    defaultValue?: string;

    files?: {path: string, content: string}[]
}

export const FileEditor: React.FC<EditorProps> = (props) => {
	const divEl = useRef<HTMLDivElement>(null);

	const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

    const [ path, setPath ] = useState<string>(null);

    const [ modelListener, setModelListener ] = useState<any>(null)

    
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
                esModuleInterop: true,
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

            monaco.languages.typescript.javascriptDefaults.addExtraLib(`

            `)
            // When resolving definitions and references, the editor will try to use created models.
            // Creating a model for the library allows "peek definition/references" commands to work with the library.
            let model = monaco.editor.getModel(monaco.Uri.parse(libUri));

            if(model){
              model.setValue(extraLib || '')
            }else{
              monaco.editor.createModel(extraLib, "typescript", monaco.Uri.parse(libUri));
            }

            //LIBS

            // var modelLib = "ts:filename/libs.d.ts";

            // let libModel = monaco.editor.getModel(monaco.Uri.parse(modelLib));
    
            // if(libModel){
            //     libModel.setValue(`
            //   declare module "@mui/material";
            //   declare module "@mui/x-date-pickers";
            //   declare module "@mui/icons-material";
            //   declare module "@hexhive/ui";
            //   `)
            // }else{
            //   monaco.editor.createModel( `
            //   declare module "@mui/material";
            //   declare module "@mui/icons-material";
            //   `, "typescript", monaco.Uri.parse(modelLib));
            // }
            // //ENDLIBS

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


            const materialUrl = monaco.Uri.parse('file:///node_modules/@mui/material/index.d.ts')
            const materialIconsUrl = monaco.Uri.parse('file:///node_modules/@mui/icons-material/index.d.ts')
            const reactUrl = monaco.Uri.parse('file:///node_modules/@types/react/index.d.ts')
            

            fetch('https://unpkg.com/@mui/material/index.d.ts').then((r) => r.text()).then((text) => {
                monaco.languages.typescript.javascriptDefaults.addExtraLib(text, 'file:///node_modules/@mui/material/index.d.ts');
                if(!monaco.editor.getModel(materialUrl)){
                    monaco.editor.createModel(text, 'typescript', materialUrl );
                }
            })

            fetch('https://unpkg.com/@mui/icons-material/index.d.ts').then((r) => r.text()).then((text) => {
                monaco.languages.typescript.javascriptDefaults.addExtraLib(text, 'file:///node_modules/@mui/icons-material/index.d.ts');
                if(!monaco.editor.getModel(materialIconsUrl)){
                    monaco.editor.createModel(text, 'typescript', materialIconsUrl );
                }
            })


            fetch('https://unpkg.com/@types/react/index.d.ts').then((r) => r.text()).then((text) => {
                monaco.languages.typescript.javascriptDefaults.addExtraLib(text, 'file:///node_modules/@types/react/index.d.ts');
            
                if(!monaco.editor.getModel(reactUrl)){
                    monaco.editor.createModel(text, 'typescript', reactUrl );
                }
            })

            // const autoTypings = AutoTypings.create(editor.current, {
            //     sourceCache: new LocalStorageCache(),
            //     onUpdate: (update, text) => {
            //         console.log({text})
            //     }
            // })

            // editor.current.onDid
            
            // const dispose =

             editor.current.onDidChangeModelContent((e) => {
                console.log("DISPOSED")
            
                props.onChange?.(editor.current.getModel().getValue())
            })

            // setModelListener(dispose)

		}
		return () => {
			editor.current.dispose();
            editor.current = null;
		};
	}, []);

    useEffect(() => {
        
        if(path !== props.code?.path){
            console.log("RESET BY PAtH", path, {path: props.code?.path, value: props.code?.content})
            // modelListener?.dispose()

            // editor.current.setModel(null);

        }

        const pathUri = props.code?.path ? `file://${(props.code?.path?.[0] !== '/' ? '/' : '') + props.code?.path}` : 'file:///main.tsx'
        // let model = monaco.editor.createModel(props.value, 'typescript', monaco.Uri.parse(props.path ? `file://${(props.path?.[0] !== '/' ? '/' : '') + props.path}` : 'file:///main.tsx'))

        let model = monaco.editor.getModel(monaco.Uri.parse(pathUri));

        const models = monaco.editor.getModels();
        console.log({models});
        // editor.current.setModel(model);

        // if(!model) {
        //     console.log("NEW MODEL", )
        //     model = monaco.editor.createModel(props.value, 'typescript', monaco.Uri.parse(props.path ? `file://${(props.path?.[0] !== '/' ? '/' : '') + props.path}` : 'file:///main.tsx'))
        //     editor.current.setModel(null);
        //     editor.current.setModel(model);
        // }


        // monaco.editor.
        if(model && model.getValue() !== props.code?.content){
            model.setValue(props.code?.content || '');
        }

        if(path !== props.code?.path){
            editor.current.setModel(null);

            editor.current.setModel(model);


            setPath(props.code?.path)
        }

    }, [ props.code]);

    useEffect(() => {
        var libUri = "ts:filename/facts.d.ts";

        let model = monaco.editor.getModel(monaco.Uri.parse(libUri));

        if(model){
          model.setValue(extraLib || '')
        }else{
          monaco.editor.createModel(extraLib, "typescript", monaco.Uri.parse(libUri));
        }
        
    }, [extraLib])

    useEffect(() => {

        // console.log("FILE UPDATES", {files: props.files})
        props.files.filter((a) => a.path !== props.code?.path).forEach((file) => {
            let model = monaco.editor.getModel(monaco.Uri.parse(`file://${(file.path?.[0] !== '/' ? '/' : '') + file.path}`));
            if(model){
                model.setValue(file.content || '')
            }else{
                monaco.editor.createModel(file.content, 'typescript', monaco.Uri.parse(`file://${(file.path?.[0] !== '/' ? '/' : '') + file.path}`))
            }
        })

    }, [props.files, props.code])

	return <div className={props.className} style={{display: 'flex', width: '100%'}} ref={divEl}></div>;
};
