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