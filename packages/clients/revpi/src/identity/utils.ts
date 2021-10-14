import axios from 'axios';

export const whoami = async () : Promise<{error?: string, identity?: {named: string, address: string}}> => {
	const result = await axios.request({
		url: 'http://discovery.hexhive.io:8080/api/identity/whoami'
	})
	return result.data
}