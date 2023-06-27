import { Autocomplete, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from "@mui/material"
import { useState } from "react"
import { useCommandEditor } from "../../../../context"

export const TriggerModal = (props: any) => {

    const [conditions, setConditions] = useState<any[]>([])
    const { program: { tags, types } } = useCommandEditor()

    const renderSecondInput = (type: "Tag" | "Type", ix: number, active?: string, activeField?: string) => {
        switch (type) {
            case 'Tag':
                let typeId = tags.find((a) => a.id == active)?.type
                let fields = types.find((type) => type.name == typeId)?.fields || [];

                return (
                    <>
                        <Autocomplete
                            fullWidth
                            options={tags}
                            value={tags.find((a) => a.id == active)}
                            onChange={(e, newVal) => {
                                setConditions((cond) => {
                                    let c = cond.slice()
                                    //    let ix=  c.findIndex((a) => a.id == active)
                                    if (ix > -1) {
                                        c[ix].active = newVal ? (typeof (newVal) == 'string' ? newVal : newVal?.id) : null
                                    }
                                    return c;
                                })
                            }}
                            renderInput={(params) => <TextField {...params} label="Tag" size="small" />}
                            getOptionLabel={(option) => typeof (option) == 'string' ? option : option.name}
                        />
                        {fields.length > 0 && (
                            <Autocomplete
                                fullWidth
                                options={fields as any[]}
                                value={fields.find((a) => a.id == activeField)}
                                onChange={(e, newVal) => {
                                    setConditions((cond) => {
                                        let c = cond.slice()
                                        //    let ix=  c.findIndex((a) => a.id == active)
                                        if (ix > -1) {
                                            c[ix].field = newVal ? (typeof (newVal) == 'string' ? newVal : newVal?.id): null
                                        }
                                        return c;
                                    })
                                }}
                                renderInput={(params) => <TextField {...params} label="Field" size="small" />}
                                getOptionLabel={(option) => typeof (option) == 'string' ? option : option.name} />
                        )}

                    </>
                )
            case 'Type':
                let activeFields = types.find((a) => a.id == active)?.fields || []
                return (
                    <>
                        <Autocomplete
                            fullWidth
                            options={types}
                            value={types.find((a) => a.id == active)}
                            onChange={(e, newVal) => {

                                setConditions((cond) => {
                                    let c = cond.slice()
                                    //    let ix=  c.findIndex((a) => a.id == active)
                                    if (ix > -1) {
                                        c[ix].active = newVal ? (typeof (newVal) == 'string' ? newVal : newVal.id) : null
                                    }
                                    return c;
                                })

                            }}
                            renderInput={(params) => <TextField {...params} label="Type" size="small" />}
                            getOptionLabel={(option) => typeof (option) == 'string' ? option : option.name}
                        />
                        <Autocomplete
                            fullWidth
                            value={activeFields.find((a) => a.id == activeField)}
                            onChange={(e, newVal) => {
                                setConditions((cond) => {
                                    let c = cond.slice()
                                    //    let ix=  c.findIndex((a) => a.id == active)
                                    if (ix > -1) {
                                        c[ix].field = newVal ? (typeof (newVal) == 'string' ? newVal : newVal?.id) : null
                                    }
                                    return c;
                                })
                            }}
                            options={activeFields}
                            renderInput={(params) => <TextField {...params} label="Field" size="small" />}
                            getOptionLabel={(option) => typeof (option) == 'string' ? option : option.name}
                        />
                    </>
                )
        }
    }

    const _renderValueField = (type: "Tag" | "Type", active?: string, activeField?: string) => {
        let fieldType;

        if (type == 'Tag') {
            let tagTypeFields = types.find((a) => a.name == tags.find((a) => a.id == active)?.type)?.fields || [];
            fieldType = tagTypeFields.length > 0 ? tagTypeFields.find((a) => a.id == activeField)?.type : tags.find((a) => a.id == active)?.type
        } else {
            fieldType = types.find((a) => a.id == active)?.fields?.find((a) => a.id == activeField)?.type
        }

        console.log(type, active, activeField, fieldType)

        switch (fieldType) {
            case 'String':
                return (<TextField fullWidth label="Value" size="small" />);
            case 'Number':
                return (<TextField fullWidth label="Value" size="small" type="number" />)
            case 'Boolean':
                return (
                    <FormControlLabel labelPlacement="start" label="Value" control={<Checkbox size="small" />} />
                )
            default:
                return null;
        }
    }

    const renderValueField = (type: "Tag" | "Type", active?: string, activeField?: string) => {
        const item = _renderValueField(type, active, activeField);

        return item ? (<Box sx={{ marginRight: '12px', width: '100%', justifyContent: 'flex-end', display: 'flex' }}>
            {item}
        </Box>) : null;
    }


    return (
        <Dialog
            fullWidth
            maxWidth='md'
            open={props.open}
            onClose={props.onClose}
        >
            <DialogTitle>Edit Condition</DialogTitle>
            <DialogContent>
                <Box sx={{ flex: 1, display: 'flex', marginTop: '12px', flexDirection: 'column' }}>

                    {conditions.map((condition, ix) => (
                        <Box sx={{ display: 'flex', marginBottom: '6px', }}>
                            <Box sx={{ flex: 1, display: 'flex' }}>
                                <Autocomplete
                                    fullWidth
                                    value={condition.type}
                                    options={["Tag", "Type"]}
                                    onChange={(e, value) => {

                                        console.log(conditions)
                                        setConditions((cond) => {
                                            let c = cond.slice()
                                            c[ix].type = value as any;
                                            return c;
                                        })
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Type" size="small" />} />

                                {renderSecondInput(condition.type, ix, condition.active, condition.field)}
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex' }}>
                                <Autocomplete
                                    fullWidth
                                    options={["==", ">", ">=", "<", "<="]}
                                    renderInput={(params) => <TextField {...params} label="Comparator" size="small" />} />

                                {renderValueField(condition.type, condition.active, condition.field)}

                            </Box>
                        </Box>
                    ))}
                    <Button onClick={() => setConditions([...conditions, { type: 'Tag' }])}>Add condition</Button>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button color="primary" variant="contained">Update</Button>
            </DialogActions>
        </Dialog>
    )
}