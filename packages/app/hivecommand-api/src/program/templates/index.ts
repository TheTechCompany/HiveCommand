import { useMutation } from "../../gqty";



export const useCreateProgramTemplate = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		input: {
			name: string;
		}
	}) => {

		const newItem = mutation.createCommandProgramTemplate({
			program: programId,
			input: {
				name: args.input.name,
			}
		})

		return {
			item: {
				...newItem
			}
		}

	})

	return async (
		input: {
			name: string;
		}
	) => {
		return await mutateFn({
			args: {
				input: input
			}
		})
	}

}



export const useUpdateProgramTemplate  = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
        id: string,
		input: {
			name: string;
		}
	}) => {

		const newItem = mutation.updateCommandProgramTemplate({
			program: programId,
            id: args.id,
			input: {
				name: args.input.name,
			}
		});

		return {
			item: {
				...newItem
			}
		}

	})

	return async (
        id: string,
		input: {
			name: string;
		}
	) => {
		return await mutateFn({
			args: {
                id,
				input: input
			}
		})
	}

}


export const useDeleteProgramTemplate  = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
        id: string,
		
	}) => {

		const newItem = mutation.deleteCommandProgramTemplate({
			program: programId,
            id: args.id,
		});

		return {
			item: newItem
		}

	})

	return async (
        id: string,
		
	) => {
		return await mutateFn({
			args: {
                id,
			}
		})
	}

}
