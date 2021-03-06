import { ProgramActionModal } from "../../../../../../components/modals/program-action"
import { Box, List, Text, Button } from "grommet"
import { MoreVert, Add } from '@mui/icons-material';
import { useState } from "react";
import { useCreateNodeAction, useRemoveNodeAction, useUpdateNodeAction } from "@hive-command/api";
import { useCommandEditor } from "../../../../context";
import { useProgramEditor } from "../../context";
import { IconButton } from "@mui/material";

export const ActionDrawerItem = () => {

    const [modalOpen, openModal] = useState(false);
    const [selected, setSelected] = useState<{id?: string} & any>();

    const { program } = useCommandEditor()

	const { activeProgram, devices, selectedType, selected: node, refresh, flow } = useProgramEditor()

    const createNodeAction = useCreateNodeAction(program.id, activeProgram, flow?.parent?.id)
	const updateNodeAction = useUpdateNodeAction(program.id, activeProgram, flow?.parent?.id)
	const deleteNodeAction = useRemoveNodeAction(program.id, activeProgram, flow?.parent?.id)

    console.log({node});

    return (
        <Box flex>
            <ProgramActionModal
                devices={devices}

                open={modalOpen}
                selected={selected}
                onClose={() => {
                    openModal(false)
                    setSelected(undefined)
                }}
                onDelete={() => {
                    deleteNodeAction(node.id, selected.id).then(() => {
                        openModal(false)
                    }).then(() => {
                        refresh()
                        setSelected(undefined)
                    })
                }}
                onSubmit={(action) => {
                    if(action.id){
                        updateNodeAction(node.id, action).then(() => {
                            openModal(false)
                        }).then(() => {
                            refresh()
                            setSelected(undefined)
                        })
                    }else{
                        createNodeAction(node.id, action).then(() => {
                            openModal(false);
                        }).then(() => {
                            refresh()
                          setSelected(undefined)
                        })
                    }
                }} />
            <Box
                justify="between"
                align="center"
                direction="row">
                <Text size="small">Actions</Text>
                <IconButton
                    size="small"
                    onClick={() => {
                        openModal(true);
                        // let schema = form_type.find((a) => a.name == field.type)
                        // setCreateSchema(schema.object)

                    }}
                >
                    <Add fontSize="inherit" />
                </IconButton>
            
            </Box>
            <List
                pad="none"
                data={node.extras.configuration?.find((a) => a.key == "actions")?.value}>
                {(datum) => (
                    <Box
                        pad={'xsmall'}
                        justify="between"
                        align="center"
                        direction="row">
                        <Box flex>
                            <Text size="small">{datum.device?.name} {datum.request?.key}</Text>
                            {/* <Text size="small">{renderListItem(datum, form_type.find((a) => a.name == field.type))}</Text> */}
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => {
                                openModal(true)
                                // let schema = form_type.find((a) => a.name == field.type)
                                // setCreateSchema(schema.object)

                                setSelected(datum)

                            }}
                        >
                            <MoreVert fontSize="inherit" />
                        </IconButton>
                          
                    </Box>
                )}
            </List>
        </Box>
    )
}