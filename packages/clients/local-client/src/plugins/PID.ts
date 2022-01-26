export default `
	instance = null;
			id = nanoid();
			targetDevice = null;
			targetKey = null;
			target = 0;

			currentTarget = 0;

			actuatorKey = null;
			
			speed = 0;
			running = false;

			state = null;
			updateState = null

			device = null;

			instance = null;

			constructor(device, options){
				this.device = device;
				// console.log({PIDController})
				this.instance = new PIDController({
					k_p: parseFloat(options.p),
					k_i: parseFloat(options.i),
					k_d: parseFloat(options.d),
					dt: 1
				})

				this.target = options.target ? parseFloat(options.target)  :  0;

				this.instance.setTarget(this.target)

				this.targetDevice = options.targetDevice
				this.targetKey = options.targetDeviceField
				this.currentTarget = this.target;

				this.actuatorDevice = options.actuator
				this.actuatorKey = options.actuatorField

				this.start = this.start.bind(this);
				this.stop = this.stop.bind(this);
			}

			async start(){
				this.running = true;
				// console.log({thisvalue: this.instance.setTarget, thissecond: this.instance.update})
				this.instance.setTarget(this.target);

				console.log("Starting PID");

				await this.device.setState({on: true});

				(async () => {
					while(this.running){
						let targetValue = this.device.fsm.state.getByKey(this.targetDevice, this.targetKey)
						let actuatorValue = this.device.fsm.state.getByKey(this.device.name, 'speed') || 0
	
						const addValue = this.instance.update(targetValue); 
						
						console.log({targetDevice: this.targetDevice, id: this.id});

						// console.log({targetDevice: this.targetDevice, targetKey: this.targetKey})
						await this.device.requestState({speed: actuatorValue += addValue}); 
					
						await new Promise(resolve => setTimeout(resolve, 1000));
					}
				})();
				console.log("Started PID");
				// console.log(this.device, this.device.fsm.state)

			}

			async stop(){
				console.log("Stopping PID");
				this.running = false;

				await this.device.setState({on: false})
				
				await this.device.requestState({speed: 0});
			}

`