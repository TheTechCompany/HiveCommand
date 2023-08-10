import { gql, useApolloClient, useQuery, useLazyQuery } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";

export const useDeviceValues = (id: string) : {
	refetch: () => void;
	results: {id: string, key: string, value: string}[]
} => {

    const client = useApolloClient();

    const { data: deviceValueData } = useQuery(gql`
		query DeviceValues($id: ID) {
		
			commandDevices (where: {id: $id}){
				deviceSnapshot {
					placeholder
					key
					value
                }
			}
		}
    `, {
		variables: {
			id: id,
		}
	})

	

    return {
        refetch: () => {
            client.refetchQueries({include: ['DeviceValues']})
        },
        results: deviceValueData?.commandDevices?.[0]?.deviceSnapshot?.map((x) => ({id: x.placeholder, key: x.key, value: x.value})) || []
    }
}


export const useDeviceHistory = (id: string) => {

	const HISTORIC_DATA_QUERY = gql`
		query HistoricDeviceValues($id: ID, $startDate: DateTime, $endDate: DateTime){

			commandDevices(where: {id: $id}){
				deviceSnapshot(where: {startDate: $startDate, endDate: $endDate}){
					placeholder
					key
					value
					lastUpdated
				}
			}
		}
	`
	const [getHistoricValues, {data}] = useLazyQuery(HISTORIC_DATA_QUERY)

	return {
		getHistoricValues,
		data: data?.commandDevices?.[0]?.deviceSnapshot?.map((x) => ({id: x.placeholder, lastUpdated: x.lastUpdated, key: x.key, value: x.value})) || []
	}
}

export const useValues = (deviceId: string, program: {tags: any[], types: any[]} ) => {
    
	const { results: values, refetch: refetchValues } = useDeviceValues(deviceId);

	useEffect(() => {
        const interval = setInterval(() => {
            refetchValues();
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [])

	const normalisedValues = useMemo(() => {

        let valueObj = values.reduce((prev, curr) => {

            let key = curr.key;

            let update = {};

            if (key) {
                update = {
                    ...prev[curr.id],
                    [key]: curr.value
                }
            } else {
                update = curr.value;
            }

            return {
                ...prev,
                [curr.id]: update
            }
        }, {});

        return program?.tags?.map((tag) => {

            let type = program?.types?.find((a) => a.name === tag.type) || tag.type;

            let hasFields = (type?.fields || []).length > 0;

            let value = valueObj[tag.name];

            if (
                type &&
                typeof (type) === "string" &&
                type.indexOf('[]') > -1
            ) {

                if( typeof (value) === "object" &&
                    !Array.isArray(value) &&
                    Object.keys(value).map((x: any) => x % 1 == 0).indexOf(false) < 0
                ) {
                    value = Object.keys(value).map((x) => value[x]);
                }else if(typeof(value) === 'string'){
                    value = value.split(',')
                }
                
            }

            return {
                key: `${tag.name}`,
                value: value
            }

        }).reduce((prev, curr) => ({
            ...prev,
            [curr.key]: curr.value
        }), {})

    
    }, [program.tags, program.types, values])

    const [ speed, setSpeed ] = useState(0);

    useEffect(() => {
        const int = setInterval(() => setSpeed(s => s + 1), 500)
        return () => {
            clearInterval(int);
        }
    }, [])

	return {values: normalisedValues};
}