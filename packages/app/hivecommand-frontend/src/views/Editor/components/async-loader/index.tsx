import { useEffect, useState } from 'react'

//  import { createRemoteComponent } from "@paciolan/remote-component/dist/createRemoteComponent";
//  import { createRequires } from "@paciolan/remote-component/dist/createRequires";


import { Loader, useRemote } from './loader';
// import { requireAsync } from './load';
// import * as requirejs from 'requirejs'

// import button from "https://jspm.dev/react-button"

// import {JsPmLoader} from './Loader'

// const requires = createRequires(() => ({
//     react: require('react'),
//     // './container': 'https://cdn.jsdelivr.net/gh/Metamorphic-Studios/react-container@master/dist-es6/container.js'
// }))

// const RemoteComponent = createRemoteComponent({requires})

// const url = "https://cdn.jsdelivr.net/gh/Metamorphic-Studios/react-container@master/dist-es6/index.js" //"https://raw.githubusercontent.com/Paciolan/remote-component/master/examples/remote-components/HelloWorld.js"; // prettier-ignore


const url = "https://raw.githubusercontent.com/TheTechCompany/hive-command-elements/master/dist/";

export const AsyncLoader = () => {
    // const [Component, setComponent] = useState<any>();

    const {Component, componentList} = useRemote(url, 'index.js');

    useEffect(() => {

        // Loader(url, 'tank.js').then((data) => {
        //     console.log({data: (data as any).Tank()})
        //     setComponent((data as any).Tank)
        // })

        // requireAsync('react-button').then((data) => {
        //     console.log("Button", {data})
        // })


        // script(['https://ga.jspm.io/npm:es-module-shims@0.10.1/dist/es-module-shims.min.js', 'https://ga.jspm.io/npm:systemjs@6.8.3/dist/s.js'], () => {
        //     console.log("React button");
        //     // System.import('https://cdn.jsdeliver.net/npm/registerjs');
            
        //     // requirejs.config({
        //     //     paths: { button: 'https://unpkg.com/react-button' }
        //     // });
        //     // requirejs(['button'], (data) => {
        //     //     console.log({data})
        //     // })

        //     // (globalThis as any).System.config({
        //     //     packages: {
        //     //         'https://cdn.jsdelivr.net/npm/react-button/+esm': {
        //     //             format: 'esm'
        //     //         }
        //     //     }
        //     // })
        //     // (globalThis as any).System.import('https://cdn.jsdelivr.net/npm/react-button/+esm').then((button) => {
        //     //     console.log({button})
        //     // })
        // })
        // resolve('react', {}, (err, result) => {
        //     console.log({err, result})
        //     // (global as any).System.config({
        //     //     packages: {

        //     //     }
        //     // })
        //     // (global as any).System.import('https://cdn.jsdelivr.net/npm/react-button').then((Component) => {
        //     //     console.log({Component})
        //     // })
        // })
    }, [])

    // const HelloWorld = props => <RemoteComponent url={url} {...props} />;

    console.log({Component, componentList})

    const RemoteComponent = Component[componentList[1]] || (() => <div>loading...</div>);
    return (
        <div>
            {Component && <RemoteComponent />}
            {/* <HelloWorld /> */}
    {/* <JsPmLoader 
        // module="https://jspm.dev/npm:react-analog-clock"
        // module="https://ga.system.jspm.io/npm:react-analog-clock@2.1.0/lib/index.js"
        module="https://unpkg.com/npm:react-json-view" 
        props={{} }>
             <p>Loading remote component...</p>
           </JsPmLoader> */}
           
        </div>
    )
}