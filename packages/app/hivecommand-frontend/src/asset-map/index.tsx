import { ACTION_TYPES } from "@hive-command/data-types";
import { AccountTree as Connect, PrecisionManufacturing as Action, PlayArrow as Trigger, PowerSettingsNew as PowerShutdown, Add, Timer } from '@mui/icons-material';

export const IconMap = {
    [ACTION_TYPES.ACTION]: {
        label: "Action",
        icon: <Action />
    },
    [ACTION_TYPES.SHUTDOWN_TRIGGER]: {
        label: "Shutdown",
        icon: <PowerShutdown />
    },
    [ACTION_TYPES.TIMER]: {
        label: "Timer",
        icon: <Timer />
    },
    [ACTION_TYPES.TRIGGER]: {
        label: "Trigger",
        icon: <Trigger />
    },
    [ACTION_TYPES.SUBPROCESS]: {
        label: "Subprocess",
        icon: <Connect />
    }
}