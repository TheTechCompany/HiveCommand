import { BasePane } from '@hive-command/editor-panes';
import { Box, Divider, List, ListItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useElectricalNodeContext } from '@hive-command/electrical-nodes';

export interface SymbolsPaneProps {
    activeTool?: {type: string, data?: any} | null;
    onSelectSymbol?: (symbol: any) => void;
}

export const SymbolsPane : React.FC<SymbolsPaneProps> = (props) => {
    
    const [ search, setSearch ] = useState<string | null>(null)

    const { elements } = useElectricalNodeContext()

    const filterSearch = (item: any) => {
        return !search || item?.name?.indexOf(search) > -1;
    }

    return (
        <BasePane>
            <Box sx={{height: '28px'}}>
                <input 
                    type="text" 
                    placeholder='Search'
                    value={search || ''}
                    onChange={(e) => setSearch(e.target.value)} />
            </Box>
            <Divider />
            <Box sx={{flex: 1, overflow: 'auto'}}>
                <List sx={{display: 'flex', height: 0, flexWrap: 'wrap'}}>
                    {elements?.filter(filterSearch)?.map((item) => (
                        <ListItem
                            key={item.name} 
                            onClick={() => props.onSelectSymbol?.(item?.name)} 
                            sx={{ 
                                display: 'flex', 
                                width: '50%', 
                                flexDirection: 'column',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                backgroundColor: props.activeTool?.type == 'symbol' && props.activeTool?.data?.symbol == item.name ? 'rgba(0,0,0,0.04)' : null,
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                             }}>
                            <Box sx={{ width: '50px', height: '50px', '& svg': {width: '50px', height: '50px'} }}>
                                {item.component()}
                            </Box>
                            <Typography sx={{fontSize: '12px'}}>
                                {item.name}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>

        </BasePane>
    )
}