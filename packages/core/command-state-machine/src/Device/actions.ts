import vm from "vm";
import { merge } from 'lodash'

export const getDeviceFunction = (func_desc: string) => {
  const func = vm.runInNewContext(
    `		const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
			new AsyncFunction(
				'state',
				'setState',
				'requestState',
				func
			)
		`,
    {
      func: func_desc,
      setTimeout,
    }
  );
  return func;
};

// const classConstructor = vm.runInNewContext(
// 	`
// 		const PIDController = require("node-pid-controller");

// 		class DefaultClass {

// 			instance = null;

// 			targetDevice = null;
// 			targetKey = null;
// 			actuatorKey = null;
			
// 			speed = 0;
// 			running = false;

// 			state = null;
// 			updateState = null

// 			constructor(options){
// 				this.instance = new PIDController({
// 					k_p: parseFloat(options.p),
// 					k_i: parseFloat(options.i),
// 					k_d: parseFloat(options.d),
// 					dt: 1
// 				})

// 				this.instance.setTarget(parseFloat(options.target))

// 				this.targetDevice = options.targetDevice
// 				this.targetKey = options.targetDeviceField
// 				this.actuatorDevice = options.actuator
// 				this.actuatorKey = options.actuatorField

// 				this.state = options.state;
// 				this.updateState = options.updateState;

// 				this.start = this.start.bind(this);
// 				this.stop = this.stop.bind(this);
// 			}

// 			async start(){
// 				this.running = true;
// 				while(this.running){
// 					let targetValue = this.state.getByKey(this.targetDevice, this.targetKey)
// 					let actuatorValue = this.state.getByKey(this.actuatorDevice, this.actuatorKey)
	
// 					const addValue = this.instance.update(targetValue); 
	
// 					this.updateState({[this.actuatorKey]: actuatorValue += addValue}); 
				
// 					console.log(this.speed);
// 					await new Promise(resolve => setTimeout(resolve, 1000));
// 				}
// 			}

// 			stop(){
// 				this.running = false;
// 			}

// 			tick(state, updateState){
				
// 			}
// 		}
// 		DefaultClass
// 	`, {
// 		require: require,
// 		setTimeout
// 	}
// )

// console.log(classConstructor)

// let state: any = {
// 	FIT101: {
// 		flow: 0
// 	},
// 	PMP101: {
// 		speed: 0
// 	}
// }

// const updateState = (newState: any) => {
// 	console.log(newState)
// 	state = merge(state, newState)
// }

// const test = new classConstructor({
// 	p: 0.5,
// 	i: 0.01,
// 	d: 0.01,
// 	target: 12,
// 	targetDevice: 'FIT101',
// 	targetDeviceField: 'flow',
// 	actuator: 'PMP101',
// 	actuatorField: 'speed',
// 	state: {
// 		get: (key: string) => {
// 			return state?.[key]
// 		},
// 		getByKey: (key: string, subKey: string) => {
// 			return state?.[key]?.[subKey]
// 		}
// 	},
// 	updateState
// })

// setTimeout(() => test.stop(), 2000)
// test.start().catch((e: any) => {
// 	console.log(e)
// })
// // test.tick({
// // 	"PMP101": {
// // 		"speed": 0
// // 	},
// // 	"FIT101": {
// // 		"flow": 0
// // 	}
// // }, (state: any) => {
// // 	console.log(state)
// // })

// // console.log(test)

