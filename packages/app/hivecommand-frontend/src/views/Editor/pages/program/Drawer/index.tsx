import { ACTION_TYPES } from '@hive-command/data-types';
import { Box } from 'grommet';
import React from 'react';
import { useProgramEditor } from '../context';
import { ActionDrawerItem } from './types/action';
import { ConditionDrawerItem } from './types/condition';
import { TimerDrawerItem } from './types/timer';

export const ProgramDrawer = () => {

    const { devices, refresh, selected, selectedType, flow } = useProgramEditor()

    const renderDrawer = () => {
        console.log({selected, selectedType})
        switch(selectedType){
            case 'node':
                return selected.extras.type == ACTION_TYPES.TIMER ? (
                    <TimerDrawerItem />
                ) : (
                    <ActionDrawerItem />
                );
            case 'path':
                return (<ConditionDrawerItem />)
        }
    }

    return (
        <Box flex>
            {renderDrawer()}
        </Box>
    )
}