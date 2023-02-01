import { useEffect, useState } from 'react'

//  import { createRemoteComponent } from "@paciolan/remote-component/dist/createRemoteComponent";
//  import { createRequires } from "@paciolan/remote-component/dist/createRequires";


import { Loader, useRemote } from './loader';
// import { requireAsync } from './load';

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