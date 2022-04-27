import { useMutation } from "../../gqty";



export const useCreateProgramVariable = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
		input: {
			name: string;
			type: string;
			defaultValue: string;
		}
	}) => {

		const newItem = mutation.createCommandProgramVariable({
			program: programId,
			input: args.input
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
			type: string;
			defaultValue: string;
		}
	) => {
		return await mutateFn({
			args: {
				input: input
			}
		})
	}

}



export const useUpdateProgramVariable = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
        id: string,
		input: {
			name: string;
			type: string;
			defaultValue: string;
		}
	}) => {

		const newItem = mutation.updateCommandProgramVariable({
			program: programId,
            id: args.id,
			input: args.input
		})

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
			type: string;
			defaultValue: string;
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


export const useDeleteProgramVariable = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {
        id: string,
		
	}) => {

		const newItem = mutation.deleteCommandProgramVariable({
			program: programId,
            id: args.id,
		})

		return {
			item: {
				...newItem
			}
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
