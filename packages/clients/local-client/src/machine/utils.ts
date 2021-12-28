
	export const getBlockType = (type: string) => {
		console.log("Get TYpe", type)
		switch(type){
			case 'Connect':
				return 'sub-process';
			case 'PowerShutdown':
			case 'Trigger':
			case 'Action':
				return 'action';
			case 'Clock':
				return 'timer';
			case 'Cycle':
				return 'action'; //TODO pid
		}
	}