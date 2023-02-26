import { useEffect, useMemo, useRef, useState } from "react";

export interface RemoteComponent {
    name: string;
    component: JSX.Element;
}

export type RemoteComponentCache = [packs: { [key: string]: RemoteComponent[] }, setPacks: (packs: { [key: string]: RemoteComponent[] }) => void]

export const baseRequirements : {[key: string]: any } = {
    react: require('react'),
    '@mui/material': require('@mui/material'),
    '@mui/x-date-pickers': require('@mui/x-date-pickers'),
    '@mui/icons-material': require('@mui/icons-material'),
    '@hexhive/ui': require('@hexhive/ui')
}

export const Loader = async (base_url: string, start: string) => {
    let url = base_url + start;

    let requirementFetch: any[] = [];
    const _initialRequire = (name: string) => {
        if (!(name in baseRequirements)) {

            requirementFetch.push((async () => {
                const m_name = name;
                const m = await Loader(base_url, name.substring(2, name.length) + '.js')

                baseRequirements[m_name] = m
            })())
        }
    }

    const _requires = (name: string) => {

        if (!(name in baseRequirements)) {

        }
        return baseRequirements[name]
    }

    const data = await fetch(url)
    const stringFunc = await data.text()


    const exports = {};
    const module = { exports };
    const func = new Function("require", "module", "exports", stringFunc);
    func(_initialRequire, module, exports);

    await Promise.all(requirementFetch);

    func(_requires, module, exports);

    return module.exports;
}


export const useRemoteComponents = (cache?: RemoteComponentCache) => {

    const [packs, setPacks] = cache ? cache : useState<{ [key: string]: RemoteComponent[] }>({});

    const lock = useRef<any>({})

    const getPack = async (id: string, base_url: string, url: string) => {

        if (packs[id] || lock.current[id]) {

            if (lock.current[id] instanceof Promise) {
                let data = await lock.current[id]
                return Object.keys(data).map((x) => ({ name: x, component: data[x] }));

            } else {
                return packs[id];
            }
        } else {

            try {
                let loader = Loader(base_url, `${url}?now=${Date.now()}`)
                lock.current[id] = loader;

                const data: any = await loader

                setPacks({
                    ...packs,
                    [id]: Object.keys(data).map((x) => ({ name: x, component: data[x] }))
                })

                lock.current[id] = undefined;

                return Object.keys(data).map((x) => ({ name: x, component: data[x] }))
            } catch (e) {
                console.log({ e, base_url, url })
                lock.current[id] = undefined;

            }
        }
    }

    // console.log(RemoteComponent.current instanceof Function, {RemoteComponent: RemoteComponent.current}, typeof(RemoteComponent.current))

    return {
        getPack
    }
}