import { ProgramConditionModal } from "../../../../../../components/modals/program-condition"
import { Box, List, Text, Button } from "grommet"
import { MoreVert, Add } from '@mui/icons-material';
import { useState } from "react";
import { useCreatePathCondition, useRemovePathCondition, useUpdatePathCondition } from "@hive-command/api";
import { useProgramEditor } from "../../context";
import { useCommandEditor } from "../../../../context";

export const ConditionDrawerItem = () => {

    const [modalOpen, openModal] = useState(false);
    const [selected, setSelected] = useState<{id?: string} & any>();

    const { program } = useCommandEditor()

	const { devices, variables, activeProgram, selectedType, selected: path, refresh, flow } = useProgramEditor()

    const createPathCondition = useCreatePathCondition(program?.id, activeProgram, flow?.parent?.id)
	const updatePathConditions = useUpdatePathCondition(program?.id, activeProgram, flow?.parent?.id)
	const removePathConditions = useRemovePathCondition(program?.id, activeProgram, flow?.parent?.id)

    const renderItemValue = (condition: any) => {
        switch(condition.assertion?.type){
            case 'value':
                return condition.assertion?.value;
            case 'setpoint':
                return condition.assertion?.setpoint?.name;
            case 'variable':
                return condition.assertion?.variable?.name;
        }
    }
    
    return (
        <Box flex>
            <ProgramConditionModal
                devices={devices}
                variables={variables}

                open={modalOpen}
                selected={selected}
                onClose={() => openModal(false)}
                onDelete={() => {
                    removePathConditions(selected?.id).then(() => {
                        openModal(false)
                        refresh()
                    })
                }}
                onSubmit={(condition) => {
                    if(condition.id){
                        updatePathConditions(path.id, condition.id, condition).then(() => {
                            openModal(false)
                            refresh()
                        })
                    }else{
                        createPathCondition(path.id, condition).then(() => {
                            openModal(false);
                            refresh()
                        })
                    }
                }}  />
            <Box
                justify="between"
                align="center"
                direction="row">
                <Text size="small">Conditions</Text>
                <Button
                    onClick={() => {
                        openModal(true);
                        // let schema = form_type.find((a) => a.name == field.type)
                        // setCreateSchema(schema.object)

                    }}
                    hoverIndicator
                    plain
                    style={{ padding: 6, borderRadius: 3 }}
                    size="small"
                    icon={<Add />} />
            </Box>
            <List
                pad="none"
                data={path.extras.conditions || []}>
                {(datum) => (
                    <Box
                        pad={'xsmall'}
                        justify="between"
                        align="center"
                        direction="row">
                        <Box flex>
                            <Text size='small'>{datum.inputDevice?.name} {datum.comparator} {renderItemValue(datum)} </Text>
                            {/* <Text size="small">{renderListItem(datum, form_type.find((a) => a.name == field.type))}</Text> */}
                        </Box>
                        <Button
                            onClick={() => {
                                openModal(true)
                                // let schema = form_type.find((a) => a.name == field.type)
                                // setCreateSchema(schema.object)

                                setSelected(datum)

                            }}
                            hoverIndicator
                            style={{ padding: 6, borderRadius: 3 }}
                            plain
                            size="small"
                            icon={<MoreVert />} />
                    </Box>
                )}
            </List>
        </Box>
    )
}