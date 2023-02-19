import { useMutation } from "../../gqty"

export const useCreateProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {name?: string, description: string}) => {
        const item = mutation.createCommandProgramAlarm({
            program: program,
            input: {
                name: args.name,
                description: args.description
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (name: string, description: string) => {
        return mutateFn({
            args: {
                name,
                description
            }
        })
    }
}

export const useUpdateProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {name?: string, id: string, description: string}) => {
        const item = mutation.updateCommandProgramAlarm({
            program: program,
            id: args.id,
            input: {
                name: args.name,
                description: args.description
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (id: string, name: string, description: string) => {
        return mutateFn({
            args: {
                name,
                id,
                description
            }
        })
    }
}

export const useDeleteProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {id: string}) => {
        const item = mutation.deleteCommandProgramAlarm({
            program: program,
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
                id,
            }
        })
    }
}