export const cleanTree = (nodes: any[]) => {
	return (nodes || []).map((node) => ({
		...node,
		children: cleanTree(node.children)
	}))
}