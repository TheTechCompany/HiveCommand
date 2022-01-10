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
		blessed.box({
			parent: this.screen,
			top: 'top',
			left: 'center',
			width: '50%',
			height: '2',
			content: '{center}Command Center{/center}',
			border: {
				type: 'line'
			}
		})

		blessed.box({
			parent: this.screen,
			top: 'center',
			left: 'center',
			width: '50%',
			height: '50%',
			border: {
				type: 'line'
			}
		})
	}

	start(){
		this.renderInterval = setInterval(() => {
			this.render()
		}, 100)
	}

	stop(){
		if(this.renderInterval) clearInterval(this.renderInterval)
	}


	render(){
		this.screen.render()
	}

	
}	