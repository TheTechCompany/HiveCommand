import blessed from 'blessed'
import { Machine } from '../machine'

export class TerminalDisplay {
	private machine: Machine;

	private screen: blessed.Widgets.Screen;
	
	private renderInterval?: NodeJS.Timer;

	constructor(machine: Machine){
		this.machine = machine;
	
		this.screen = blessed.screen({
			smartCSR: true
		})

		this.initDisplay()
	}

	initDisplay(){
		const header = blessed.box({
			// parent: this.screen,
			top: 'top',
			left: 'center',
			width: '50%',
			height: '10%',
			tags: true,
			content: '{center}Command Center{/center}',
			border: {
				type: 'line'
			}
		})

		this.screen.append(header)

		const content = blessed.box({
			// parent: this.screen,
			top: 'center',
			left: 'center',
			width: '50%',
			height: '50%',
			border: {
				type: 'line'
			}
		})

		this.screen.append(content)
	}

	start(){
		this.renderInterval = setInterval(() => {
			this.render()
		}, 100)
		this.render()
		this.screen.program.emit('resize')
	}

	stop(){
		if(this.renderInterval) clearInterval(this.renderInterval)
	}


	render(){
		this.screen.render()
	}

	
}	