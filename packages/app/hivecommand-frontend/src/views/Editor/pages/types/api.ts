import { useMutation, gql } from "@apollo/client"

export const useCreateTypeField = (typeId: string) => {
    const [mutateFn] = useMutation(gql`
        mutation CreateProgramTypeField ($type: ID, $input: CommandProgramTypeFieldInput) {
            createCommandProgramTypeField(type: $type, input: $input){
                id
            }
        }
    `)

    return (input: any) => {
        return mutateFn({variables: {type: typeId, input }})

    }
}

export const useUpdateTypeField = (typeId: string) => {
    const [mutateFn] =  useMutation(gql`
        mutation UpdateProgramTypeField ($type: ID, $id: ID!, $input: CommandProgramTypeFieldInput) {
            updateCommandProgramTypeField(type: $type, id: $id, input: $input){
                id
            }
        }
    `)
    return (id: string, input: any) => {
        return mutateFn({variables: { type: typeId, id, input }})

    }

}

export const useDeleteTypeField = (typeId: string) => {
    const [mutateFn] =  useMutation(gql`
        mutation DeleteProgramTypeField ($type: ID, $id: ID!) {
            deleteCommandProgramTypeField(type: $type, id: $id){
                id
            }
        }
    `)
    return (id: string) => {
        return mutateFn({variables: {type: typeId, id}})

    }
}