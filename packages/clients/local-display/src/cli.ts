#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { LocalDisplay } from '.';
import express from 'express'

const argv = yargs(process.argv.slice(2)).options({
  rows: { type: 'number', default: 2 },
  cols: { type: 'number', default: 4 },
  http: {type: 'boolean', default: true},
  httpPort: {type: 'number', default: 8765}
}).argv;

(async () => {
	const {rows, cols, http, httpPort} = await argv

	if(!http && httpPort > 0){
		throw new Error("You need to enable http with --http")
	}

	const display = new LocalDisplay({
		cols: cols,
		rows: rows,
	})
	
	display.start()

	if(http){
		const app = express()

		app.use(express.json())

		app.get('/layout', (req, res) => {
			res.send({
				cols: cols,
				rows: rows
			})
		})

		app.post('/update', (req, res) => {
			const {port, value} = req.body
			
			//extract column and row from port
			const col = port % cols
			const row = Math.floor(port / cols)

			display.updateCell(col, row, `${value}`)

			res.send({
				success: true
			})
		})

		app.listen(httpPort || 8765, () => {
			console.log(`Listening on port ${httpPort || 8765}`)
		})
	}

})()

