import { useMutation, gql } from "@apollo/client"


export const useCreateProgramComponent = (programId: string) => {
    const [mutateFn] = useMutation(gql`
        mutation CreateProgramComponent ($program: ID, $input: CommandProgramComponentInput){
            createCommandProgramComponent (program: $program, input: $input){
                id
            }
        }
    `)

    return (name: string, description: string) => {
        mutateFn({variables: {program: programId, input: {name, description} }})
    }

}




export const useUpdateProgramComponent = (programId: string) => {
    const [mutateFn] = useMutation(gql`
        mutation UpdateProgramComponent ($program: ID, $id: ID, $input: CommandProgramComponentInput){
            updateCommandProgramComponent (program: $program, id: $id, input: $input){
                id
            }
        }
    `)

    return (id: string, name: string, description: string, mainId?: string) => {
        mutateFn({variables: {program: programId, id, input: {name, description, mainId} }})
    }

}


export const useDeleteProgramComponent = (programId: string) => {
    const [mutateFn] = useMutation(gql`
        mutation DeleteProgramComponent ($program: ID, $id: ID){
            deleteCommandProgramComponent (program: $program, id: $id){
                id
            }
        }
    `)

    return (id: string) => {
        mutateFn({variables: {program: programId, id }})
    }

}



export const useCreateProgramType = (programId: string) => {
    const [mutateFn] = useMutation(gql`
        mutation CreateProgramType ($program: ID, $name: String){
            createCommandProgramType (program: $program, input: {name: $name}){
                id
            }
        }
    `)

    return (name: string) => {
        mutateFn({variables: {program: programId, name}})
    }

}

export const useUpdateProgramType = (programId: string) => {
    const [ mutateFn ] = useMutation(gql`
        mutation UpdateProgramType ($program: ID, $id: ID, $name: String){
            updateCommandProgramType (program: $program, id: $id, input: {name: $name}){
                id
            }
        }
    `)

    return (id: string, name: string) => {
        mutateFn({variables: {program: programId, name, id }})
    }
}

export const useDeleteProgramType = (programId: string) => {
    const [ mutateFn ] = useMutation(gql`
        mutation DeleteProgramType ($program: ID, $id: ID){
            deleteCommandProgramType (program: $program, id: $id){
                id
            }
        }
    `)

    return (id: string) => {
        mutateFn({variables: {program: programId, id }})
    }
}