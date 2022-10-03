import { useMutation } from "../gqty";

export const useUpdateElement = () => {
    const [mutateFn] = useMutation(
      (
        mutation,
        args: {
          id: string;
          input: any;
        }
      ) => {

        const item = mutation.updateCommandInterfaceDevice({
            id: args.id,
            input: args.input
        })
        return {
            item: {
                ...item
            }
        }
      }
    );
    return async (id: string, input: any) => {
      return await mutateFn({
        args: {
          id,
          input,
        },
      });
    };
  };