export const cleanTree = (nodes: any[]) => {
	const response = (nodes || []).map((node) => ({
		...node,
		children: cleanTree(node.children)
	}))



	
	return response
}