import { forwardRef, useEffect, useState } from 'react'
import { Box, Checkbox } from '@mui/material'
import { TreeView, TreeItem, TreeItemContentProps, useTreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material'
import clsx from 'clsx';
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
    }).then((r) => r.json());
  }

  useEffect(() => {
    getTags().then((tags) => {
      setTags(tags)
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
              <Checkbox onChange={(e) => {
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

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        >
          {renderTree(tags || [])}
      </TreeView>
    </Box>
  )
}

export default App
