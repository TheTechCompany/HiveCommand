import { useMutation } from "../../gqty"

export const useCreateProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {title?: string, script: string}) => {
        const item = mutation.createCommandProgramAlarm({
            program: program,
            input: {
                title: args.title,
                script: args.script
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (title: string, script: string) => {
        return mutateFn({
            args: {
                title,
                script
            }
        })
    }
}

export const useUpdateProgramAlarm = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {title?: string, id: string, script: string}) => {
        const item = mutation.updateCommandProgramAlarm({
            program: program,
            id: args.id,
            input: {
                title: args.title,
                script: args.script
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (id: string, title: string, script: string) => {
        return mutateFn({
            args: {
                title,
                id,
                script
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



export const useCreateProgramAlarmPathway = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {name?: string, scope?: string, script?: string}) => {
        const item = mutation.createCommandProgramAlarmPathway({
            program: program,
            input: {
                name: args.name,
                scope: args.scope,
                script: args.script
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (name: string, scope: string, script?: string) => {
        return mutateFn({
            args: {
                name,
                scope,
                script
            }
        })
    }
}

export const useUpdateProgramAlarmPathway = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {name?: string, id: string, scope?: string, script?: string}) => {
        const item = mutation.updateCommandProgramAlarmPathway({
            program: program,
            id: args.id,
            input: {
                name: args.name,
                script: args.script,
                scope: args.scope
            }
        })
        return {
            item: {
                ...item
            }
        }
    })

    return (id: string, name: string, scope?: string, script?: string) => {
        return mutateFn({
            args: {
                name,
                id,
                scope,
                script
            }
        })
    }
}

export const useDeleteProgramAlarmPathway = (program: string) => {
    const [mutateFn] = useMutation((mutation, args: {id: string}) => {
        const item = mutation.deleteCommandProgramAlarmPathway({
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