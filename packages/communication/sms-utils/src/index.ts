import axios from 'axios'

export const sendSMS = async (recipient: string, message: string, username?: string, password?: string, ip?: string) => {
	let host = ip || '192.168.10.254'
	let authBlob;
	if(username && password){
		authBlob = `username=${username}&password=${password}`
	}
	const data = await axios.get(`http://${host}/cgi-bin/sms_send?number=${recipient}&text=${message}${authBlob ? `&${authBlob}` : ''}`)
	return data.data;
}