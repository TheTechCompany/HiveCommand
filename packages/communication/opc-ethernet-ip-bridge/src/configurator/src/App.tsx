import { useEffect, useState } from 'react'
import { Box, Checkbox } from '@mui/material'
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material'
import './App.css'

export interface Tag {
  name: string,
  children?: Tag[]
}

function App() {

  const [tags, setTags] = useState<Tag[]>([
    {
      name: 'tag1',
      children: [
        {name: 'value'}
      ]
    }
  ]);

  const getTags = () => {
    return fetch('/api/tags').then((r) => r.json())
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
    }).then((r) => r.json());
  }

  useEffect(() => {
    getTags().then((tags) => {
      setTags(tags)
    })
  }, [])

  const renderTree = (tags: any[], parent?: string) => {
    return tags.map((tag) => {
      
      return (<TreeItem   
        ContentComponent={() => (
        <div>
          <Checkbox onChange={(e) => {
            updateTags(e.target.checked, parent, tag.name)
          }} />{tag.name}
        </div>
        )}
        nodeId={parent ? `${parent}.${tag.name}` : tag.name} label={tag.name}>
          {tag.children ? renderTree(tag.children, parent ? `${parent}.${tag.name}` : tag.name) : null}
      </TreeItem>)
    })
  }

  return (
    <Box>
      <TreeView
        onNodeSelect={(e: any, node: any) => console.log({node})}
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        >
          {renderTree(tags)}
      </TreeView>
    </Box>
  )
}

export default App
