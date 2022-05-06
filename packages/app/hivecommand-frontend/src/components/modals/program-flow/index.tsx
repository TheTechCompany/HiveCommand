import { BaseModal, FormInput } from "@hexhive/ui";
import { useEffect, useState } from "react";

export const ProgramFlowModal = (props) => {

    const [ flow, setFlow ] = useState<{name?: string}>({})

    const onSubmit = () => {
        props.onSubmit?.(flow);
    }

    useEffect(() => {
        setFlow({
            ...props.selected
        })
    }, [props.selected])

    return (
        <BaseModal
            title={`${props.selected ? 'Update' : 'Create' } Program Flow`}
            open={props.open}
            onSubmit={onSubmit}
            onClose={props.onClose}
            onDelete={props.selected?.id && props.onDelete}
            >
            <FormInput 
                value={flow.name}
                onChange={(value) => setFlow({...flow, name: value})}
                placeholder="Flow name" />
        </BaseModal>
    )
}