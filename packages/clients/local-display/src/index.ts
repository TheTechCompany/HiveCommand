import blessed from 'blessed'

export interface LocalDisplayOptions {
	cols?: number;
	rows?: number;
}

export class LocalDisplay {
	private screen: blessed.Widgets.Screen;

	private renderTimer?: NodeJS.Timer;

	private rows = 2;
	private cols = 4;

	private cells : {[key: string]: blessed.Widgets.BoxElement} = {};

	constructor(options: LocalDisplayOptions){
		this.screen = blessed.screen({
			smartCSR: true
		})

		this.rows = options.rows || 2;
		this.cols = options.cols || 4 

		this.init()
	}

	get cell_width(){
		return 100 / this.cols;
	}

	get cell_height(){
		return 100 / this.rows;
	}

	init(){
		for(var colIndex = 0; colIndex < this.cols; colIndex++){
			for(var rowIndex = 0; rowIndex < this.rows; rowIndex++){
				this.cells[`${colIndex}:${rowIndex}`] = blessed.box({
					parent: this.screen,
					top: `${rowIndex * this.cell_height}%`,
					left: `${colIndex * this.cell_width}%`,
					width: `${this.cell_width}%`,
					height: `${this.cell_height}%`,
					border: {
						type: "line"
					}
				})
			}
		}
	}

	updateCell(col: number, row: number, value: any){
		this.cells[`${col}:${row}`].setContent(value)
	}


	render(){
		this.screen.render();
	}

	start(){
		this.renderTimer = setInterval(() => {
			this.render();
		}, 100)

		this.render()
	}

	stop(){
		clearInterval(this.renderTimer as any);
	}
}
