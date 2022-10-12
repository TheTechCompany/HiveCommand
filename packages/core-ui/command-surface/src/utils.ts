export const getDevicesForNode = (node: any) => {
	if(node.children && node.children.length > 0){
		return node.children?.map((x: any) => ({...x.devicePlaceholder}))
	}else{
		return [node?.devicePlaceholder];
	}
}