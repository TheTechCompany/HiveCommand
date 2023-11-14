import React, {useState, useMemo, useEffect} from 'react';
import { Box, Typography, TextField, Autocomplete, Card } from '@mui/material'
import { ConfigInput } from '../render';
import { useInterfaceEditor } from '../../../../context';

export interface TemplateConfigurationProps {
    onNodeUpdate?: (update: any) => void;
}

export const TemplateConfiguration : React.FC<TemplateConfigurationProps> = (props) => {
    
    const { selected, nodes, tags = [], templates = [], types = [] } = useInterfaceEditor()

    const selectedNode = nodes?.find((a) => a.id == selected?.nodes?.[0]?.id);

    const templateOptions = selectedNode?.data?.templateOptions || [];

    const activeTemplate = useMemo(() => templates?.find((a) => a.id === selectedNode?.data?.template), [selectedNode?.data?.template]);

    const [templateState, setTemplateState] = useState<{ [id: string]: any }>({})

    useEffect(() => {
        if (templateOptions) {
            setTemplateState(templateOptions);
        }
    }, [templateOptions])

    const templateInputs = useMemo(() => {
        return activeTemplate ? (
            <Card elevation={5} sx={{ padding: '6px' }}>
                <Typography sx={{ marginBottom: '6px' }} fontSize={'small'}>Template Options</Typography>
                {activeTemplate?.inputs?.map((input) => (
                    <Box sx={{ marginBottom: '6px' }}>
                        <ConfigInput
                            id={input.id}
                            type={input.type}
                            value={templateState?.[input.id] || null}
                            label={input.name}
                            onUpdateState={(key, value) => {
                                console.log("updateState", key, value)
                                props.onNodeUpdate?.({
                                    data: {
                                        templateOptions: { [key]: value }
                                    }
                                });
                            }} />
                      
                    </Box>
                ))}
            </Card>
        ) : null
    }, [activeTemplate, templateState])
    
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column'
        }}>
               <Box sx={{ marginBottom: '6px' }}>
                <Autocomplete
                    fullWidth
                    options={templates || []}
                    value={templates?.find((a) => a.id === selectedNode?.data?.template) || null}
                    disablePortal
                    onChange={(e, newVal) => {
                        if (typeof (newVal) === 'string') return;
                        // if(!selected?.id) return

                        props.onNodeUpdate?.({ data: { template: newVal?.id || null } });

                        // assignNodeTemplate({
                        //     variables: {
                        //         nodeId: selected?.id,
                        //         input: {
                        //             template: newVal?.id || null
                        //         }
                        //     }
                        // }).then(() => refetch?.());
                    }}
                    getOptionLabel={(option) => typeof (option) === 'string' ? option : option?.name}
                    renderInput={(params) => <TextField  {...params} size="small" label="Template" />}
                />

            </Box>
            {templateInputs}
        </Box>
    )
}