import React from 'react'
import { Box, Paper, List, ListItemIcon, ListItemText, ListItemButton, ListItem } from '@mui/material';
import { useMatch, useResolvedPath } from 'react-router-dom'

export interface SidebarProps {
    items?: {label: string, path: string, icon: any}[]

    active?: string;
    onSelect?: (item: any) => void;
}

export const Sidebar : React.FC<SidebarProps> = (props) => {

    console.log(props.active, props.items);

    return (
        <Paper
            sx={{minWidth: '200px', borderRadius: 0, bgcolor: 'primary.main'}}
            >   
            <List 
        dense
        >
            {props.items?.map((o) => (
                <SidebarItem 
                    active={props.active?.split('/')?.[1] == o.path} 
                    label={o.label}
                    icon={o.icon}
                    onClick={() => props.onSelect?.(o)} />
            ))}
            </List>
        </Paper>
    )
}

export interface SidebarItemProps {
    label?: string;

    active?: boolean;

    icon?: any;

    onClick?: () => void;
}

export const SidebarItem : React.FC<SidebarItemProps> = (props) => {
    // const { pathname } = useResolvedPath();
    // const match = useMatch(pathname)

    // console.log(match, pathname)

    return (
        <ListItem 
        disablePadding
        sx={{
            backgroundColor: props.active ? 'rgb(0,0, 0, 0.2)' : undefined
        }}>
            <ListItemButton onClick={props.onClick}>
                <ListItemIcon sx={{color: 'white'}}>
                    {props.icon}
                </ListItemIcon>
                <ListItemText sx={{color: 'white'}}>
                    {props.label}
                </ListItemText>
            </ListItemButton>
        </ListItem>
    )
}