import { Box } from '@mui/material';
import React, { useEffect, useMemo, useRef } from 'react';
import { transpile, ModuleKind, JsxEmit, ScriptTarget } from 'typescript';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary'
import path from 'path';

const PreviewComponent = (props: any) => {
    const { mainId, files } = props;

    const { resetBoundary } = useErrorBoundary();

    const { Component } = useMemo(() => {
        try{
            resetBoundary()
            return Loader(files, mainId)
        }catch(e){
            console.log(e)
            return {}
        }
    }, [files, mainId])

    return <Component />
}

export const Preview = (props: any) => {
    const { mainId, files } = props;

    const ref = useRef<ErrorBoundary>(null);

    useEffect(() => {
        
        ref.current?.resetErrorBoundary()

    }, [files, mainId])

    const Component = useMemo(() => {
        return (
            <ErrorBoundary ref={ref} fallbackRender={() => (<div>Something went wrong compiling preview</div>)} >
                <PreviewComponent {...props} />
            </ErrorBoundary>
        )
    }, [files, mainId])

    return (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dfdfdf' }}>
            <Box sx={{ background: "#fff" }}>
                {Component}
            </Box>
        </Box>
    )

}

const baseRequirements: any = {
    react: require('react'),
    '@mui/material': require('@mui/material'),
    '@mui/x-date-pickers': require('@mui/x-date-pickers'),
    '@mui/icons-material': require('@mui/icons-material'),
    '@hexhive/ui': require('@hexhive/ui')
}

const Loader = (files: { id: string, path: string, content: string }[], mainId: string): any => {

    let requirementFetch: any[] = [];
    // const _initialRequire = (name: string) => {
    //     console.log({name, baseRequirements})
    //     if (!(name in baseRequirements)) {

    //         requirementFetch.push((async () => {
    //             const m_name = name;
    //             const m = await Loader(base_url, name.substring(2, name.length) + '.js')

    //             baseRequirements[m_name] = m
    //         })())
    //     }
    // }

    const file = files.find((a) => a.id == mainId);

    const _requires = (name: string) => {

        if (!(name in baseRequirements)) {
            const filePath = file?.path;
            if(filePath){
                console.log("Missing", name,  path.join(filePath, '../', name))
                const fileId = files.find((file) => file.path.split('.')?.[0] == path.join(filePath, '../', name).split('.')?.[0])?.id;
                if(fileId)
                return Loader(files, fileId)
            }
        }
        return baseRequirements[name]
    }

    if(file?.content){
        // const data = await fetch(url)
        const stringFunc = transpile(file?.content, { kind: ModuleKind.CommonJS, jsx: JsxEmit.React, target: ScriptTarget.ES5 })

        console.log(stringFunc, files, mainId)

        const exports = {};
        const module = { exports };
        const func = new Function("require", "module", "exports", stringFunc);
        // func(_initialRequire, module, exports);

        // await Promise.all(requirementFetch);

        func(_requires, module, exports);

        console.log(module.exports)

        return module.exports;
    }
}