import axios from 'axios'
import bodyParser from 'body-parser';
import express, { Express } from 'express'

const app = express()

app.use(bodyParser.json())

app.post('/io', (req, res) => {
	let {cid} = req.body;

	console.log(`Unsubscribing from ${cid}`)

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