import { forwardRef, useEffect, useMemo, useState } from 'react'
import { Box, Checkbox, TextField } from '@mui/material'
import { TreeView, TreeItem, TreeItemContentProps, useTreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material'
import clsx from 'clsx';
import './App.css'

export interface Tag {
  name: string,
  children?: Tag[]
}

function App() {

  const [search, setSearch ] = useState('');

  const [tags, setTags] = useState<Tag[]>([
    {
      name: 'tag1',
      children: [
        {name: 'value'}
      ]
    }
  ]);

  const [ whitelist, setWhitelist ] = useState<Tag[]>([
    {
      name: 'tag1',
      children: [
        {name: 'value'}
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

  const tagExists = (path: string, whitelist: Tag[], cwd?: string) => {
    let parts = path.split('.');
    let curr_idx = (cwd?.split('.') || []).length;

    let curr_part = parts[curr_idx];

    let exists = false;

    if(cwd == path){
      exists = true;
      return true;
    }else if(whitelist.length > 0){
      for(var i = 0; i < whitelist.length; i++){
        let ret = tagExists(path, whitelist[i].children || [], cwd ? `${cwd}.${whitelist[i].name}` : whitelist[i].name)
        if(ret)
          exists = true;
      }
    }
    return exists;
  
  }

  const getWhitelist = () => {
    return fetch('http://localhost:8020/api/whitelist').then((r) => r.json())
  }

  const getTags = () => {
    return fetch('http://localhost:8020/api/tags').then((r) => r.json())
  }

  const updateTags = (add: boolean, path: string | undefined, name: string) => {
    return fetch('/api/whitelist', {
      method: "POST",
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        add: add,
        path,
        name
      })
    }).then((r) => r.json()).then(() => {
      getWhitelist().then((whitelist) => {
        setWhitelist(whitelist)
      })
    });
  }

  useEffect(() => {
    getTags().then((tags) => {
      setTags(tags)
    })
    getWhitelist().then((whitelist) => {
      setWhitelist(whitelist)
    })
  }, [])

  const renderTree = (tags: any[], parent?: string) => {
    return tags.map((tag) => {
   
      const nodeId = parent ? `${parent}.${tag.name}` : tag.name;

      return (<TreeItem   
        key={parent ? `${parent}.${tag.name}` : tag.name}
        ContentComponent={forwardRef<unknown, any>((props, ref) => {
             
          const {
            classes,
            className,
            label,
            nodeId,
            icon: iconProp,
            expansionIcon,
            displayIcon,
          } = props;

          const {
            disabled,
            expanded,
            selected,
            focused,
            handleExpansion,
            handleSelection,
            preventSelection,
          } = useTreeItem(nodeId);
          
          const icon = iconProp || expansionIcon || displayIcon;

          const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            preventSelection(event);
          };
        
          const handleExpansionClick = (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
          ) => {
            handleExpansion(event);
          };
        
          const handleSelectionClick = (
            event: React.MouseEvent<HTMLDivElement, MouseEvent>,
          ) => {
            handleSelection(event);
          };

          return (<div
            className={clsx(className, classes.root, {
              [classes.expanded]: expanded,
              [classes.selected]: selected,
              [classes.focused]: focused,
              [classes.disabled]: disabled,
            })}
            style={{display: 'flex', alignItems: 'center'}}
            onMouseDown={handleMouseDown}
            ref={ref as any}>
              <div onClick={handleExpansionClick} className={classes.iconContainer}>
                {icon}
              </div>
              <Checkbox 
                checked={tagExists(nodeId, whitelist)}
                onChange={(e) => {
                updateTags(e.target.checked, parent, tag.name)
              }} />
              {tag.name}
            </div>)
        })}
        nodeId={nodeId} label={tag.name}>
          {tag.children ? renderTree(tag.children, parent ? `${parent}.${tag.name}` : tag.name) : null}
      </TreeItem>)
    })
  }

  const treeItems = useMemo(() => {
    return renderTree((tags || []).filter((a) => {
      if(search && search.length > -1)return a.name.toLowerCase().indexOf(search.toLowerCase()) > -1
      return true;
    }));
  }, [tags, search, whitelist])

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <TextField 
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        label="Search..." />
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        >
          {treeItems}
      </TreeView>
    </Box>
  )
}

export default App
