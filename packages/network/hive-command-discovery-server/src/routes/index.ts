import { Router } from 'express'
import { Data } from '../data'
import identityRouter from './identity'

export default (dataBroker: Data) => {
	const router = Router()

	router.use('/api/identity', identityRouter(dataBroker))
	
	return router;
}
