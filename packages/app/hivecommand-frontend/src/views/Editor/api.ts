import { useMutation, gql } from "@apollo/client"

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