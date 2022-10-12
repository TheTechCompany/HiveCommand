import { useEffect, useMemo, useRef, useState } from "react";

export const Loader = async (base_url: string, start: string) => {
    let url = base_url + start;

    console.log("Load ", {url})

    let baseRequirements = {
        react: require('react'),
        ['@mui/material']: require('@mui/material')
    }

    let requirementFetch : any[] = [];
    const _initialRequire = (name: string) => {
        if(!(name in baseRequirements)){
            // console.log("Init Loader")
            requirementFetch.push((async () => {
                const m_name = name;
                const m = await Loader(base_url, name.substring(2, name.length) + '.js')
                // console.log({m_name, m})
                baseRequirements[m_name] = m
            })())
            // const module = await Loader(base_url, name.substring(2, name.length) + '.js')
            // baseRequirements[name] = module;
        }
    }

    const _requires = (name: string) => {
        // console.log({name, baseRequirements})

        if(!(name in baseRequirements)){
            // console.log("Loader", name, baseRequirements)
            // return await Loader(base_url, name.substring(2, name.length) + '.js')
        }
        return baseRequirements[name]
    }

    const data = await fetch(url)
    const stringFunc = await data.text()

    const exports = {};
    const module = { exports };
    const func = new Function("require", "module", "exports", stringFunc);
    func(_initialRequire, module, exports);

    await Promise.all(requirementFetch)
    // console.log("Fetched", requirementFetch)

    func(_requires, module, exports);

    return module.exports;
}

export const useRemote = (base_url: string, url : string) => {

    const [RComponent, setComponent] = useState<any>(null)
    
    const [componentList, setComponentList] = useState<any[]>([]);

    const RemoteComponent = useRef<any>(null);

    useEffect(() => {
        Loader(base_url, `${url}?now=${Date.now()}`).then((data) => {
            console.log({data});

            setComponentList(Object.keys(data));

            RemoteComponent.current = (data as any) //.Tank;
            setComponent((data as any));
        })
    }, [base_url, url])
    
    // console.log(RemoteComponent.current instanceof Function, {RemoteComponent: RemoteComponent.current}, typeof(RemoteComponent.current))

    return {
        Component: RemoteComponent.current || {}, //(props) => RemoteComponent.current instanceof Function ? <RemoteComponent.current {...props} /> : null,
        componentList
    }
}