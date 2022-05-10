import { StackModal } from '../../components/modals/stacks';
import React, {Suspense, useEffect, useState} from 'react';
import styled from 'styled-components'
import { Box, Button, CheckBox, TextInput, Text } from 'grommet'
import { PluginStore } from '../../components/plugin-store/PluginStore'
import { NestedList } from '../../components/ui/nested-list';
import { useQuery, gql } from '@apollo/client';
import { createPlugin } from '@hive-command/api';

export interface StackListProps {
    className? :string;
    history?: any;
    match?: any;
}

export const BaseStackList : React.FC<StackListProps> = (props) => {

    const { data } = useQuery(gql`
        query Q {
            commandPlugins {
                id
                name
            }
        }
    `)
    const plugins = data?.commandPlugins //query.commandPlugins()

    
    
    const [ modalOpen, openModal ] = useState<boolean>(false)
    
    return  (
        <Box
            overflow="hidden"
             background="neutral-1"
            direction="row"
            elevation="small"
            round="small"
            className={props.className}>
            <StackModal 
                open={modalOpen}
                onSubmit={(stack : any) => {
                    console.log(stack)
                    if(stack.name){
                        
                        createPlugin(stack.name).then(() => {
                            // if(item){
                            //     let s : any[] = _stacks.slice()
                            //     s.push(item)
                            // //    setStacks(s)
                            // }
                        })
                    }
                }}
                onClose={() => openModal(false)} />
        
            
            <NestedList
                data={plugins}
                onClick={({item}) => props.history.push(`${props.match.url}/${item.id}`)}
                renderItem={(item) => item.name}
                onAdd={() => openModal(true)} />
        </Box>
    )
}

export const PluginList = styled(BaseStackList)`
    flex: 1;
    display: flex;
    position: relative;

    .MuiList-root{
        flex: 1;
    }
`