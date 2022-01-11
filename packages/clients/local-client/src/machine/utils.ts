
	export const getBlockType = (type: string) => {
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