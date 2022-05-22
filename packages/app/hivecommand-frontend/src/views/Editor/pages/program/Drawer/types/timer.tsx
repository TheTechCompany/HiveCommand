import { FormControl, FormInput } from "@hexhive/ui"
import { useUpdateNodeTimer } from "@hive-command/api";
import { Box, Text, TextInput } from "grommet"
import { useEffect } from "react";
import { useState } from "react"
import { useCommandEditor } from "../../../../context";
import { useProgramEditor } from "../../context";

export const TimerDrawerItem = () => {

    const [ value, setValue ] = useState(0);

    const [ unit, setUnit ] = useState('seconds');

    const { program } = useCommandEditor()

	const { activeProgram, devices, selectedType, selected: node, refresh, flow } = useProgramEditor()

    const updateTimer = useUpdateNodeTimer(program.id, activeProgram)

    useEffect(() => {
        let timer = node.extras.configuration?.find((a) => a.key == "timer")?.value;
        setValue(timer?.value || 0)
        setUnit(timer?.unit || 'seconds')
    }, [node])

    const onChange = (key: string, newValue: string) => {
        if(key == "value"){
            setValue(parseFloat(newValue))
        }else if(key == "unit"){
            setUnit(newValue)
        }

        updateTimer(node.id, key == "value" ? newValue: `${value}`, key == "unit" ? newValue: unit)
    }

    console.log({node});

    return (
        <Box flex>
            <Box>
                <Text>Timer</Text>
            </Box>
            <FormInput
                value={value}
                onChange={(value) => onChange('value', value)}
                type="number"
                placeholder="Timeout"
                />
            <FormControl 
                placeholder="Unit" 
                labelKey="label"
                valueKey="label"
                value={unit}
                onChange={(value) => onChange('unit', value)}
                options={[
                    {label: "seconds"}, 
                    {label: "minutes"}, 
                    {label: "hours"}
                ]}/>
        </Box>
    )
}