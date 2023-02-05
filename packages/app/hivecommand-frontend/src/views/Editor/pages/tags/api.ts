import { useMutation, gql } from "@apollo/client"

export const useCreateTag = () => {
    const [mutateFn] = useMutation(gql`
        mutation CreateProgramTag ($program: ID, $input: CommandProgramTagInput) {
            createCommandProgramTag(program: $program, input: $input){
                id
            }
        }
    `)
    return mutateFn
}

export const useUpdateTag = () => {
    const [mutateFn] =  useMutation(gql`
        mutation UpdateProgramTag ($program: ID, $id: ID!, $input: CommandProgramTagInput) {
            updateCommandProgramTag(program: $program, id: $id, input: $input){
                id
            }
        }
    `)
    return mutateFn

}

export const useDeleteTag = () => {
    const [mutateFn] =  useMutation(gql`
        mutation DeleteProgramTag ($program: ID, $id: ID!) {
            deleteCommandProgramTag(program: $program, id: $id){
                id
            }
        }
    `)
    return mutateFn
}