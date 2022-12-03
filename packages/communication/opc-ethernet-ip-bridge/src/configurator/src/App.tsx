import { useEffect, useMemo, useState } from 'react'
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material'

import './App.css'
import { ConfiguratorProvider } from './context';
import { TagView } from './views/tags';
import { TemplateView } from './views/templates';
import { Routes, Route, useNavigate } from 'react-router-dom';

export interface Tag {
  name: string,
  type?: string,
  children?: Tag[]
}

export interface Template {
  name: string,
  children?: Template[]
}

export interface NestedTree {
  [key: string]: string | NestedTree
}

function App() {

  const navigate = useNavigate();

  const [ templates, setTemplates ] = useState<Template[]>([
    {
      name: 'Valve',
      children: [
        {
          name: 'IOFault',
        },
        {
          name: 'Eng',
        }
      ]
    }
  ]);

  const [tags, setTags] = useState<Tag[]>([
    {
      name: 'tag1',
      children: [
        {name: 'value'}
      ]
    },
    {
      name: 'AV101',
      type: 'Valve',
      children: [
        {name: 'Eng'},
        {name: 'IOFault'}
      ]
    }
  ]);

  const [ whitelistTags, setWhitelistTags ] = useState<Tag[]>([
    {
      name: 'tag1',
      children: [
        {name: 'value'}
      ]
    }
  ])

  const [ whitelistTemplates, setWhitelistTemplates ] = useState<Template[]>([
    {
      name: 'Valve',
      children: [
        {name: 'IOFault'}
      ]
    }
  ])

  const insertNode = (node: any, path: string | undefined, name: string, currentPath?: string) => {

    let path_parts = ([undefined] as any).concat(path ? path.split('.') : []);
    let curr_path_parts = (currentPath?.split('.') || []).length;

    if(currentPath == path){
        node.children.push({name, children: []});
    }else if(node.name == path_parts[curr_path_parts] && node.children.length > 0) {
        for(let i = 0; i < node.children.length; i++){
            if(node.children[i].name == path_parts[curr_path_parts + 1]){
                insertNode(node.children[i], path, name, currentPath ? `${currentPath}.${node.children[i].name}` : node.children[i].name)
            }
        }
    }
}

  const tagExists = (path: string, whitelist: (Tag | Template)[], cwd?: string) => {
    let parts = path.split('.');
    let curr_idx = (cwd?.split('.') || []).length;

    let curr_part = parts[curr_idx];

    let exists = false;

    console.log(path, cwd)

    if(cwd == path){
      exists = true;
      return true;
    }else if(whitelist.length > 0){
      for(var i = 0; i < whitelist.length; i++){
        console.log({whitelist: whitelist[i]})
        let children = 'children' in whitelist[i] ? (whitelist[i] as any).children  : Object.keys((whitelist[i]as any).structure || {}).map((a) => ({name: a}))
        let ret = tagExists(path, children || [], cwd ? `${cwd}.${whitelist[i].name}` : whitelist[i].name)
        if(ret)
          exists = true;
      }
    }
    return exists;
  
  }

  let reduceFunc = (original: any, next: Tag) : any => {
    return {
      ...original,
      [next.name]: (next.children || []).length > 0 ? next.children?.reduce(reduceFunc, {}) : next.type
    }
  }

  const tagMap = useMemo(() => {
    // let whitelistFilter =
    let tagsMapping = tags.reduce(reduceFunc, {});

    return tagsMapping
  }, [whitelistTags, tags ])

  const _whitelistTemplates = useMemo(() => {
    return templates.filter((a) =>  whitelistTemplates.map((x) => x.name).indexOf(a.name) > -1 ).map((template) => {
      let whitelist = whitelistTemplates.find((a) => a.name == template.name);

      let whitelistKeys = whitelist?.children?.map((x) => x.name)

      return {
        ...template,
        children: template.children?.filter((a) => (whitelistKeys || []).indexOf(a.name) > -1)
      }
    })
  }, [whitelistTemplates, templates])

  const templateExists = (path: string, whitelist: Template[], cwd?: string) => {
    let parts = path.split('.');
    let curr_idx = (cwd?.split('.') || []).length;

    let curr_part = parts[curr_idx];

    let exists = false;

    console.log(path);

    const root = parts[0];

    let rootNode = tags.find((a) => a.name === root);
    let template = _whitelistTemplates.find((a) => rootNode?.type == a.name);


    parts.splice(0, 1)

    let struct = template?.children?.reduce((prev, curr) => ({...prev, [curr.name]: ''}), {})

    return template != undefined && (parts.length == 0 || parts.reduce((o, i) => o[i], struct as any) != null )
    


    console.log({rootNode, template})
    // if(cwd == path){
    //   exists = true;
    //   return true;
    // }else if(whitelist.length > 0){
    //   for(var i = 0; i < whitelist.length; i++){

    //     let pwd = cwd ? `${cwd}.${whitelist[i]}`

    //     let struct = Object.key
    //     let ret = tagExists(path, whitelist[i].children || [], cwd ? `${cwd}.${whitelist[i].name}` : whitelist[i].name)
    //     if(ret)
    //       exists = true;
    //   }
    // }
    // return exists;
    return false;
  
  }

  const getWhitelist = () => {
    return fetch('http://localhost:8020/api/whitelist').then((r) => r.json())
  }

  const getTags = () => {
    return fetch('http://localhost:8020/api/tags').then((r) => r.json())
  }

  const getTemplates = () => {
    return fetch('http://localhost:8020/api/templates').then((r) => r.json());
  }

  const updateTags = (type: string, add: boolean, path: string | undefined, name: string) => {
    return fetch('/api/whitelist', {
      method: "POST",
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        type,
        add: add,
        path,
        name
      })
    }).then((r) => r.json()).then(() => {
      getWhitelist().then((whitelist) => {
        setWhitelistTags(whitelist.tags)
        setWhitelistTemplates(whitelist.templates)
      })
      getTemplates().then((templates) => {
        setTemplates(templates)
      })
    });
  }

  useEffect(() => {
    getTemplates().then((templates) => {
      setTemplates(templates)
    })
    getTags().then((tags) => {
      setTags(tags)
    })
    getWhitelist().then((whitelist) => {
      setWhitelistTags(whitelist.tags)
      setWhitelistTemplates(whitelist.templates)

    })
  }, [])

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <ConfiguratorProvider value={{
        whitelist: {
          tags: whitelistTags,
          templates: whitelistTemplates 
        },
        tags,
        templates,
        tagExists,
        templateExists,
        updateTags
      }}>
      <Paper sx={{display: 'flex', marginBottom: '12px', background: 'gray', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '6px'}}>
        <Typography>ENIP Configurator</Typography>
        <Tabs onChange={(evt, value) => navigate(value)}>
          <Tab value={""} label="Tags"></Tab>
          <Tab value={"templates"} label="Templates"></Tab>
        </Tabs>
      </Paper>
      <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Routes>
          <Route path="" element={<TagView />} />
          <Route path="templates" element={<TemplateView />} />
        </Routes>
      </Box>
      </ConfiguratorProvider>
    </Box>
  )
}

export default App
