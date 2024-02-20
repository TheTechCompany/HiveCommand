import { useEffect, useState } from "react"
import { AlarmItem } from "../../../../../core/command-alarms/src"

export const useAlarmEngine = () => {
    const useAlarms = () => {
        const [ alarms, setAlarms ] = useState<AlarmItem[]>([]);

        const fetchAlarms = async () => {
            const result = await fetch('http://localhost:8484/controller/alarms').then((r) => r.json())
            return result.result;
        }

        useEffect(() => {
            fetchAlarms().then((alarms) => setAlarms(alarms));

            const interval = setInterval(() => {
                fetchAlarms().then((alarms) => setAlarms(alarms));
                
            }, 5 * 1000)

            return () => {
                clearInterval(interval)
            }
        }, [])

        return {results: alarms};
        
    }

    const acknowledgeAlarm = async (id: string) => {
        const result = await fetch('http://localhost:8484/controller/alarms', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            })
        }).then((r) => r.json())

    }

    return {
        acknowledgeAlarm,
        useAlarms
    }
}