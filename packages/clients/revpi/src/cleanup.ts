import axios from 'axios'
import express, { Express } from 'express'

const app = express()

app.post('/io', (req, res) => {
	let {cid} = req.body;

	axios.request({
		method: "POST",
		url: 'http://192.168.10.225/timer[1]/counter/datachanged/unsubscribe',
		data: {
			code: 'request',
			cid: cid,
			adr: '/timer[1]/counter/datachanged/unsubscribe',
			data: {
				callback: `http://192.168.10.221:9000/io`
			}
		}
	})

})

app.listen(9000)