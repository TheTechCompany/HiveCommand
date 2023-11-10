import axios from 'axios';

export const exchangeShortcode = async (discoveryServer: string, provisionCode: string) => {

    const res = await axios.post(`${discoveryServer}/authorize`, {
        shortCode: provisionCode
    });

    if (res?.data?.token) {
        return res.data.token;
    } else {
        return false;
    }
}

export const getProgramLayout = async (discoveryServer: string, authToken: string) => {
    const [ controlLayout, networkLayout ] = await Promise.all([
        axios.get(`${discoveryServer}/control-layout?token=${authToken}`).then(async (res) => {
            // console.log("controlLayout", {res})
            return res.data.results;
            // await setGlobalState?.((state) => ({...state, controlLayout: res.data.results}))
        }),

        axios.get(`${discoveryServer}/network-layout?token=${authToken}`).then(async (res) => {
            // console.log("networkLayout", {res})
            return res.data.results;
            // await setGlobalState?.((state) => ({...state, networkLayout: res.data.results}))
        })
    ])
    return [controlLayout, networkLayout]
}

