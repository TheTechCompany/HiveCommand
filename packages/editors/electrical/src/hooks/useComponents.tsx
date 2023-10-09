import { useEffect, useState } from "react"
import { RemoteComponent, useRemoteComponents } from '@hive-command/remote-components'

export const useComponents = () => {

    const { getPack } = useRemoteComponents();
    
    const [ items, setItems ] = useState<RemoteComponent[]>([]);
    
    useEffect(() => {
        getPack('github-01', 'https://raw.githubusercontent.com/TheTechCompany/hive-command-electrical-symbols/main/dist/components/', 'index.js').then((pack) => {
            setItems((pack || []))
        })
    }, [])

    return items;
}