/*

	BallValve
	
	Takes 11 seconds to open

	Has two actions/states [open, close]


*/

// const target = {
// 	message1: 'channel'
// }

// const handler = {
// 	get: function (target: any, prop: any, receiver: any){
// 		console.log(target, prop, receiver)	
// 		return Reflect.get(target, prop, receiver)
// 	}
// }

// const proxy = new Proxy({
// 	message1: 'string'
// }, {
// 	get: (target, prop, receiver) => {
// 		console.log(target, prop, receiver)
// 		return 'other';
// 	},
// 	set: function (target, prop, value, receiver){
// 		console.log("SET", target, prop, value, receiver)
// 		return false;
// 	}
// })

// const test = (state: any) => {
// 	state.message1 = 101;
// }

// // let val = proxy;

// test(proxy)

// // val = '101';
// // console.log(proxy.message1 = '101')
// {
// 	name: "Pump",
// 	busType: ["io-link"],
// 	portType: ["analog", "shared"],
// 	state: {
// 		running: Boolean,
// 		starting: Boolean
// 	},
// 	actions: {
// 		start: (state, setState, args, requestOperation) => {
// 			setState("starting")
// 			requestOperation('write', {current: 1000})
// 			setState("on")
// 			// "on";
// 		},
// 		increase: (state, args, requestOperation) => {
// 			requestOperation('write', {current: state.current + args.value})
// 		},
// 		decrease: (state, args, requestOperation) => {
// 			requestOperation('write', {current: state.current - args.value})
// 		},
// 		stop: (state, args, requestOperation) => {
// 			state = "stopping"
// 			requestOperation('write', {current: 0})
// 			state = "off";
// 		}
// 	}
// }
// {
// 	name: "BallValve",
// 	busType: ["digital"],
// 	state: {
// 		open: Boolean,
// 		opening: Boolean
// 	},
// 	actions: {
// 		open: async (state, setState, requestOperation) => {
// 			setState({opening: true})
// 			requestOperation('open') // Requests the value of bus mapping ('open')->{open: 1, close: 0}
// 			await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)
// 			setState({opening: false})
// 		},
// 		close: async (state, requestOperation) => {
// 			await new Promise((resolve, reject) => setTimeout(() => resolve(true), 11 * 1000)
// 			requestOperation('close')
// 		}
// 	}
// 	component: ((state) => (
// 		<Box>
// 			<Valve
// 				style={{filter: state.opening ? 'hue-rotate(45deg)' : state.open ? 'hue-rotate(30deg'} : undefined} />
// 		</Box>
// 	)),

// }
// export class BallValve {
	

// }