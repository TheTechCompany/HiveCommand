import { FormControl, FormInput } from "@hexhive/ui"
import { Box, Text, TextInput } from "grommet"

export const TimerDrawerItem = () => {
    return (
        <Box flex>
            <Box>
                <Text>Timer</Text>
            </Box>
            <FormInput
                placeholder="Timeout"
                />
            <FormControl 
                placeholder="Unit" 
                labelKey="label"
                valueKey="label"
                options={[
                    {label: "seconds"}, 
                    {label: "minutes"}, 
                    {label: "hours"}
                ]}/>
        </Box>
    )
}