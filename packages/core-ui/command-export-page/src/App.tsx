import { useEffect, useState } from 'react'
import './App.css'
import qs from 'qs'
import { SchematicViewer } from '@hive-command/schematic-viewer'
import { useRemoteComponents } from '@hive-command/remote-components'

function App() {

  const query = qs.parse(window.location.hash?.replace('#', ''), {ignoreQueryPrefix: true});

  const [ page, setPage ] = useState<any>(null);

  const [ pageReady, setPageReady ] = useState(false)

  const [items, setItems] = useState<any[]>([]);

  const { getPack } = useRemoteComponents()

  const [ packReady, setPackReady ] = useState(false);

    useEffect(() => {
        setPackReady(false);

        getPack('github-01', 'https://raw.githubusercontent.com/TheTechCompany/hive-command-electrical-symbols/main/dist/components/', 'index.js').then((pack) => {
            setItems((pack || []))
  
            setPackReady(true);

            console.log({ pack })
        })

    }, [])

  useEffect(() => {
    setPageReady(false);

    fetch(
      `/schematic/pages/${query?.ix}`
    ).then((r) => r.json()).then((result) => {
      console.log("pages", result.page)
      
      // setTimeout(() => setPageReady(true), 500);
      setPageReady(true);

      setPage(result.page);
    })
  }, [query])


  return (
    <>
      {pageReady != null && packReady != null && items?.length > 0 && <div className='loaded' style={{display: 'none'}}/>}
      
      <SchematicViewer
        ratio={297/210}
        elements={items}
        nodes={page?.nodes || []}
        edges={page?.edges || []}
          />
    </>
  )
}

export default App
