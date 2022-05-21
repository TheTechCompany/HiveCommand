export const getDevicesForNode = (node: any) => {
	if(node.children){
		return node.children?.map((x) => ({...x.devicePlaceholder}))
	}else{
		return [node?.devicePlaceholder];
	}
}