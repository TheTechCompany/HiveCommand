import { gql } from "@apollo/client"

import { mutation, useMutation } from "../gqty"

export * from './alarms'
export * from './hmi'
export * from './templates';

export const useCreateProgram = () => {

	const [ mutateFn ] = useMutation((mutation, args: {
		name: string
	}) => {

		const item = mutation.createCommandProgram({
			input: {
				name: args.name,
			}
		})

			return {
				item: {
					...item
				}
			}
	})


	return (name: string) => {
		return mutateFn({args: {name}})
	}
}




export const useCreateProgramHMI = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {name: string, parent?: string, remoteHomepage?: boolean, localHomepage?: boolean}) => {

		const item = mutation.createCommandProgramInterface({
			program: programId,
			input: {
				name: args.name,
				localHomepage: args.localHomepage,
				remoteHomepage: args.remoteHomepage
			}
		})
		
		return {
			item: {
				...item
			}
		}
	})
	return async (name: string, localHomepage?: boolean, remoteHomepage?: boolean, parent?: string) => {
		return await mutateFn({
			args: {
				name,
				remoteHomepage,
				localHomepage,
				parent
			}
		})
	}
}

export const useDeleteProgramHMI = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {id: string}) => {

		const item = mutation.deleteCommandProgramInterface({
			program: programId,
			id: args.id
		})

		return {
			item: {
				...item
			}
		}
	})

	return (id: string) => {
		return mutateFn({
			args: {
				id
			}
		})
	}
}


export const useUpdateProgramHMI = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {id: string, name: string, parent?: string, remoteHomepage?: boolean, localHomepage?: boolean}) => {

		const item = mutation.updateCommandProgramInterface({
			program: programId,
			id: args.id,
			input: {
				name: args.name,
				localHomepage: args.localHomepage,
				remoteHomepage: args.remoteHomepage,
			}
		})
	
		return {
			item: {
				...item
			}
		}
	})
	return async (id: string, name: string, localHomepage?: boolean, remoteHomepage?: boolean, parent?: string) => {
		return await mutateFn({
			args: {
				id,
				name,
				parent,
				remoteHomepage,
				localHomepage
			}
		})
	}
}

export const useUpdateProgram = () => {

	const [ mutateFn ] = useMutation((mutation, args: {
		id: string,
		name: string
	}) => {

		const item = mutation.updateCommandProgram({
			id: args.id,
			input: {
				name: args.name,
			}
		})

			return {
				item: {
					...item
				}
			}
	})


	return (id: string, name: string) => {
		return mutateFn({args: {id, name}})
	}
}


export const useDeleteProgram = () => {

	const [ mutateFn ] = useMutation((mutation, args: {
		id: string,
	}) => {

		const item = mutation.deleteCommandProgram({
			id: args.id
		})

			return {
				item: item
			}
	})


	return (id: string) => {
		return mutateFn({args: {id}})
	}
}

export const getProgramSelector = (query: any, flow: string, parent?: string) => {

	return parent ? {
		where: {node: {id: parent}},
		update: {
			node: {
				children: [{
					where: {node: {id: flow}},
					update: query
				}]
			}
		}
	} : {
		where: {node: {id: flow}},
		update: query
	}
}	
