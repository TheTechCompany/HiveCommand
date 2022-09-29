import { useEffect, useMemo, useRef, useState } from "react";

export const Loader = async (base_url: string, start: string) => {
    let url = base_url + start;

    let baseRequirements = {
        react: require('react'),
        ['@mui/material']: require('@mui/material')
    }

    let requirementFetch : any[] = [];
    const _initialRequire = (name: string) => {
        if(!(name in baseRequirements)){

            requirementFetch.push((async () => {
                const m_name = name;
                const m = await Loader(base_url, name.substring(2, name.length) + '.js')

                baseRequirements[m_name] = m
            })())
        }
    }

    const _requires = (name: string) => {

        if(!(name in baseRequirements)){

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

    func(_requires, module, exports);

    return module.exports;
}

export const useRemoteComponents = () => {

    const [ packs, setPacks ] = useState({});

    const getPack = async (id: string, base_url: string, url: string) => {
        if(packs[id]){
            return packs[id];
        }else{
            try{
                const data = await Loader(base_url, `${url}?now=${Date.now()}`)
                setPacks({
                    ...packs,
                    [id]: Object.keys(data).map((x) => ({name: x, component: data[x]}))
                })
                return Object.keys(data).map((x) => ({name: x, component: data[x]}))
            }catch(e){
                console.log({e, base_url, url})
            }
        }
    }   

    // console.log(RemoteComponent.current instanceof Function, {RemoteComponent: RemoteComponent.current}, typeof(RemoteComponent.current))

    return {
        getPack
    }
}