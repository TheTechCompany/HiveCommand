
	export const getBlockType = (type: string) => {
		switch(type){
			case 'Connect':
				return 'sub-process';
			case 'PowerShutdown':
				return 'shutdown';
			case 'Trigger':
				return 'trigger';
			case 'Action':
				return 'action';
			case 'Clock':
				return 'timer';
			case 'Cycle':
				return 'action'; //TODO pid
		}
	}