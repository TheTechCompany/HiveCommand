import { gql, useMutation } from "@apollo/client"

export const createPlugin = async (name: string) => {
	const [ mutateFn ] = useMutation(gql`
		mutation createPlugin($name: String!) {
			createCommandPlugins(input: [{name: $name}]) {
				id
			}
		}
	`)

	return await mutateFn({
		variables: {
			name
		}
	})
}
   

export const createPluginItem = async (plugin: string, name: string) => {
	const [ mutateFn ] = useMutation(gql`
		mutation ($pluginId: ID, name: String){
			updateCommandPlugins(
				where: {id: $pluginId}, 
				update: {
					items: [{
						create: [{
							node: {name: $name}
						}]
					}]	
				}){
					id
				}
		}
	`)

	return await mutateFn({variables: {pluginId: plugin, name}})
	
}