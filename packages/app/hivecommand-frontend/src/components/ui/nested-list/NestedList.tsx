import React from 'react';
import { Box, Button, List } from 'grommet';
import { NavigateNext as Next, Add, NavigateBefore as Previous } from '@mui/icons-material'

export interface NestedListProps {
    onAdd?: () => void;
    onClick?: ({item}: any) => void;
    renderItem?: (datum: any) => any;
    data?: any[];
}

export const NestedList : React.FC<NestedListProps> = (props) => {
    return (
        <Box 
            overflow="hidden"
            round="xsmall"
            elevation="small"
            flex
            background={'neutral-1'}>
            <Box   
                pad="xsmall"
                background="accent-2" 
                justify="between"
                border={{side: 'bottom', color: '#dfdfdf', size: '1px'}}
                direction="row">
                <Box direction="row">
                    <Button     
                        plain
                        style={{padding: 6, borderRadius: 3}}
                        hoverIndicator 
                        icon={<Previous fontSize="small"  />} />
                    <Button 
                        plain
                        style={{padding: 6, borderRadius: 3}}
                        hoverIndicator 
                        icon={<Next  fontSize="small" />} />
                </Box>

                <Button 
                    plain
                    style={{padding: 6, borderRadius: 3}}
                    onClick={props.onAdd}
                    hoverIndicator
                    icon={<Add fontSize="small" />} />
            </Box>
            <Box flex>
                <List
                    onClickItem={props.onClick}
                    data={props.data}
                    >
                    {(datum: any) => props.renderItem?.(datum)}
                </List>
            </Box>
        </Box>
    )
}