export interface DevicePlaceholder {
	tag: string,
	
	setpoints?: {
		id: string;
		name: string;
		type: string;
		
	}[]
	type?: {
		tagPrefix?: string
		state?: {
			key: string;
		}[]
		actions?: {
			key: string;
			func?: string;
		}[]
	}
}

export const getDevicesForNode = (node: any) : DevicePlaceholder[] => {
	if(node.children && node.children.length > 0){
		return node.children?.map((x: any) => ({...x.devicePlaceholder}))
	}else{
		return [node?.devicePlaceholder];
	}
}
