import { Box } from 'grommet';
import React from 'react';
import { useProgramEditor } from '../context';
import { ActionDrawerItem } from './types/action';
import { ConditionDrawerItem } from './types/condition';
import { TimerDrawerItem } from './types/timer';

export const ProgramDrawer = () => {

    const { devices, refresh, selected, selectedType, flow } = useProgramEditor()

    const renderDrawer = () => {
        switch(selectedType){
            case 'node':
                return selected.extras.icon == "Clock" ? (
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