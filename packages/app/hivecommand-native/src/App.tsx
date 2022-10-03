import { HexHiveTheme } from '@hexhive/styles';
import './App.css';
import { ThemeProvider, Box } from '@mui/material';
// import { readTextFile, writeTextFile } from '@tauri-apps/api/fs'
import { CommandSurface } from '@hive-command/command-surface';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'


const API_URL = localStorage.getItem('HEXHIVE_API');

// const authServer = process.env.REACT_APP_API
//   ? `${process.env.REACT_APP_API}`
//   : "http://localhost:7000";

  const URL = `${process.env.NODE_ENV === 'production'
    ? `${API_URL || process.env.REACT_APP_API}/graphql`
    : "http://localhost:7000/graphql"}`;
    
  // const splitLink = split(

  //   ({ query }) => {
  
  //     const definition = getMainDefinition(query);
  
  //     return (
  
  //       definition.kind === 'OperationDefinition' &&
  
  //       definition.operation === 'subscription'
  
  //     );
  
  //   },
  //   //Subscriptions
  //   // new ApolloLink((operation) => {

  //   //   let uri = URL;

  //   //   const linkConfig = {
  //   //     options: {},
  //   //     credentials: 'include',
  //   //     headers: {
  //   //       'Content-Type': 'application/json'
  //   //     },
  //   //   };

  //   //   return new Observable((observer) => {
  //   //     const context = operation.getContext();

  //   //     const contextHeaders = context.headers;
  //   //     const contextConfig = {
  //   //       http: context.http,
  //   //       options: context.fetchOptions,
  //   //       credentials: context.credentials,
  //   //       headers: contextHeaders,
  //   //     };
        
  //   //        //uses fallback, link, and then context to build options
  //   //     const { options, body } = selectHttpOptionsAndBody(
  //   //       operation,
  //   //       fallbackHttpConfig,
  //   //       linkConfig,
  //   //       contextConfig,
  //   //     );

  //   //     console.log({options});

  //   //     fetch(uri, {
  //   //       method: "POST",
  //   //       credentials: 'include', 
  //   //       headers: {'Content-Type': 'application/json'},
  //   //       ...options,
  //   //       body: serializeFetchParameter(body, 'Payload')
  //   //     }).then((r) => {
  //   //       return r.body
  //   //     }).then(async (body) => {
  //   //       let reader = body?.getReader()

  //   //       let done, value;
  //   //       while(!done){
  //   //         ({done, value} = await reader?.read());

  //   //         let strValue = new TextDecoder().decode(value)
  //   //         console.log({strValue})
  //   //         let parsed = strValue.toString()?.match(/data: (.+)/)?.[1];

  //   //         console.log({parsed})
  //   //         observer.next(JSON.parse(parsed || '{}'));
  //   //       }
  //   //     })

  //   //   })

  //   //   // uri: URL,
  //   //   // fetch: async (url, options) => {

  //   //   //   const result = await fetch(url, {
  //   //   //     ...options,
  //   //   //     credentials: 'include'
  //   //   //   });

  //   //   //   const reader = result.body.getReader();

  //   //   //   let done, value;

  //   //   //   while(!done){
  //   //   //       ({value, done} = await reader.read());
                  
  //   //   //       console.log( new TextDecoder().decode(value) );
  //   //   //   }

  //   //   //   console.log({result})
  //   //   //   return result;
      
  //   // }),
  //   //Base
  //   new HttpLink({
  //     uri: URL,
  //     credentials: 'include'
  //   }),
  // );
const client = new ApolloClient({
  uri: URL,
  // ink: splitLink,
  cache: new InMemoryCache(),
  credentials: "include",
});


// console.log((window as any).__TAURI__);

function App() {

  // const [ conf, setConf ] = useState<{
  //   ready: boolean;
  // }>({ready: false})

  // useEffect(() => {
  //   readTextFile(CONF_FILE).then((confText: any) => {

  //     if(confText){
  //       setConf(JSON.parse(confText))
  //     }

  //   })
  // }, []) 

  // const renderView = () => {
  //   if(!conf.ready){
  //     return (
  //       <SetupView onConfChange={(conf: any) => setConf(conf)} />
  //     )
  //   }else{
  //       return (
  //         <InfiniteCanvas />
  //       ) 
  //   }
  // }

  return (
    <LocalizationProvider 
    dateAdapter={AdapterMoment}>
      <Router>
        <ApolloProvider client={client}>
          <ThemeProvider theme={HexHiveTheme}>
            <Box style={{height: '100vh', width: '100vw', display: 'flex'}}>
              <CommandSurface />
            </Box>
          </ThemeProvider>
        </ApolloProvider>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
