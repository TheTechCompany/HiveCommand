import React, { forwardRef, useState, useMemo, useContext } from 'react';
import { TreeItem, TreeView, useTreeItem } from '@mui/lab'
import { Box, Checkbox, TextField } from '@mui/material';
import { ConfiguratorContext } from '../../context';
import { ExpandMore, ChevronRight } from '@mui/icons-material'
import clsx from 'clsx';
import { Template } from '../../App';

export const TemplateView = () => {

    const { whitelist, templates, tagExists, updateTags } = useContext(ConfiguratorContext);

    const [search, setSearch] = useState('');

    const renderTree = (tags: Template[], parent?: string) => {
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
                        style={{ display: 'flex', alignItems: 'center' }}
                        onMouseDown={handleMouseDown}
                        ref={ref as any}>
                        <div onClick={handleExpansionClick} className={classes.iconContainer}>
                            {icon}
                        </div>
                        <Checkbox
                            checked={tagExists?.(nodeId, whitelist?.templates || [])}
                            onChange={(e) => {
                                updateTags?.('template', e.target.checked, parent, tag.name)
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
        return renderTree((templates || []).filter((a) => {
            if (search && search.length > -1) return a.name.toLowerCase().indexOf(search.toLowerCase()) > -1
            return true;
        }));
    }, [templates, search, whitelist])

    return (
        <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', width: '80%'}}>
            <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                label="Search Templates..." />
            <TreeView
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
            >
                {treeItems}
            </TreeView>
        </Box>
    )
}