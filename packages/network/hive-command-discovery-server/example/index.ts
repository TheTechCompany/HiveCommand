import { Client } from 'pg';

(async () => {
	const client = new Client({
		database: 'qdb',
		host: '54.66.232.181',
		port: 8812,
		user: 'admin',
		password: 'quest'
	})

	await client.connect()

    const createTable = await client.query(
		"CREATE TABLE IF NOT EXISTS commandDeviceValue (ts TIMESTAMP, device STRING, bus STRING, port STRING, value STRING) timestamp(ts);",
	  )
	  console.log(createTable)
  
	  const insertData = await client.query(
		"INSERT INTO commandDeviceValue VALUES(systimestamp(), $1, $2, $3, $4, $5);",
		['Device', "node pg example", '123', 'Test'],
	  )
	  await client.query("COMMIT")
  
	  console.log(insertData)


	// await client.
})()