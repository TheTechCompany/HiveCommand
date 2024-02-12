import { useMutation } from "../../gqty"

export const useCreateProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {title?: string, message: string}) => {
        const item = mutation.createCommandProgramAlarm({
            program: program,
            input: {
                title: args.title,
                message: args.message
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (title: string, message: string) => {
        return mutateFn({
            args: {
                title,
                message
            }
        })
    }
}

export const useUpdateProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {title?: string, id: string, message: string}) => {
        const item = mutation.updateCommandProgramAlarm({
            program: program,
            id: args.id,
            input: {
                title: args.title,
                message: args.message
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (id: string, title: string, message: string) => {
        return mutateFn({
            args: {
                title,
                id,
                message
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