import { useEffect, useMemo, useState } from 'react'
import './App.css'
import qs from 'qs'
import { useNodesInitialized, useReactFlow, useOnViewportChange, useStoreApi } from 'reactflow';
import { SchematicViewer } from '@hive-command/schematic-viewer'
import { useRemoteComponents } from '@hive-command/remote-components'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import useResizeAware from 'react-resize-aware';

function App() {

  const [resizeListener, sizes] = useResizeAware();

  const location = useLocation();

  const query = useMemo(() => {
    return qs.parse(location.hash?.replace('#', ''), {ignoreQueryPrefix: true})
    // return qs.parse(location.search, {ignoreQueryPrefix: true})
  }, [location.hash])



  const [ project, setProject ] = useState<any>(null);
  const [ page, setPage ] = useState<any>(null);

  const [ loading, setLoading ] = useState(false);

  const [ pageReady, setPageReady ] = useState(false)

  const [items, setItems] = useState<any[]>([]);

  const { getPack } = useRemoteComponents()
  
  const { fitView, fitBounds } = useReactFlow()
  const store = useStoreApi();


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
    setLoading(true);
    setPageReady(false);

    console.log("QUERY IX CHANGED", query?.ix);

    try{
      let ix = parseInt(query?.ix?.toString() || '-1')
      if(ix > -1){
        fetch(
          `/schematic/pages/${query?.ix}`
        ).then((r) => r.json()).then((result) => {
          console.log("pages", result.page)
          

          setProject(result.project)
          setPage(result.page);

          setLoading(false);

        })
      }
    }catch(e){

    }
  
  }, [JSON.stringify(query)])

  useEffect(() => {

    const { width, height } = store.getState()
    console.log("WIDTH", {width, height})
    // fitBounds({x: 0, y: 0, width: parseInt(query.width?.toString() || '0'), height: parseInt(query.height?.toString() || '0')})


  }, [page, project])

  useEffect(() => {

    const { width, height } = store.getState()
    console.log("WIDTH", {width, height})

  }, [])

  const nodesInitialized = useNodesInitialized({includeHiddenNodes: false});


  useEffect(() => {
    (window as any).fitView = fitView;
    if(nodesInitialized){
      setTimeout(() => {
        const fits = fitView?.({ minZoom: 0.1, padding: 0.2 });
        console.log("FITS", fits);
        if(fits)
          setPageReady(true);
      }, 10)
    }
  }, [page, nodesInitialized])


  return (
    <Box sx={{height: '100%', width: '100%', display: 'flex'}}>
        {resizeListener}
        {/* <div>{width}x{height}</div> */}
        {packReady && <div className='pre-loaded' style={{display: 'none'}} />}
        {(nodesInitialized || page?.nodes?.length == 0) && pageReady && !loading && packReady && items?.length > 0 && <div className='loaded' style={{display: 'none'}}/>}

        <SchematicViewer
          ratio={297/210}
          elements={items}
          nodes={page?.nodes || []}
          edges={page?.edges || []}
          info={{
            project,
            page: parseInt(query?.ix?.toString() || '0') + 1,
            pageTitle: page?.name,
          }}
            />
    </Box>
  )
}

export default App
