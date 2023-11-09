import { mutate, mutation, useMutation } from "../../gqty";

export const useCreateHMINode = (programId: string, hmiId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        type: string;
        x: number;
        y: number;
      }
    ) => {

      const item = mutation.createCommandProgramInterfaceNode({
        program: programId,
        hmi: hmiId,
        input: {
          type: args.type,
          x: args.x,
          y: args.y
        }
      })

      return {
        item: {
          ...item
        }
      }
    }
  );
  return async (type: string, x: number, y: number) => {
    return await mutateFn({
      args: {
        type,
        x,
        y,
      },
    });
  };
};

export const useUpdateHMINode = (programId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        nodeId: string;
        x?: number;
        y?: number;
        zIndex?: number;
        scaleX?: number;
        scaleY?: number;
        width?: number,
        height?: number,
        options?: any;
        rotation?: number;
        template?: string;
        templateOptions?: any;
      }
    ) => {
      let hmiUpdate: any = {};
      if (args.x != undefined) hmiUpdate.x = args.x;
      if (args.y != undefined) hmiUpdate.y = args.y;
      if (args.scaleX != undefined) hmiUpdate.scaleX = args.scaleX;
      if (args.scaleY != undefined) hmiUpdate.scaleY = args.scaleY;
      if (args.width != undefined) hmiUpdate.width = args.width
      if (args.height != undefined) hmiUpdate.height = args.height;
      
      if (args.zIndex != undefined) hmiUpdate.zIndex = args.zIndex;

      if(args.options) hmiUpdate.options = args.options;

      if(args.rotation != undefined) hmiUpdate.rotation = args.rotation;

      if(args.template != undefined) hmiUpdate.template = args.template;
      if(args.templateOptions != undefined) hmiUpdate.templateOptions = args.templateOptions;

      const item = mutation.updateCommandProgramInterfaceNode({
        id: args.nodeId,
        input: hmiUpdate
      })


      return {
        item: {
          ...item
        }
      }
    }
  );

  return async (node_id: string, update: {
		x?: number,
		y?: number,
    zIndex?: number,
    scaleX?: number,
    scaleY?: number,
    width?: number,
    height?: number,
    options?: any;
		rotation?: number;
    template?: string;
    templateOptions?: any;
	}) => {
    return await mutateFn({
      args: {
        nodeId: node_id,
        x: update.x,
        y: update.y,
        zIndex: update.zIndex,
        scaleX: update.scaleX,
        scaleY: update.scaleY,
        width: update.width,
        height: update.height,
        options: update.options,
        rotation: update.rotation,
        template: update.template,
        templateOptions: update.templateOptions
      },
    });
  };
};


export const useDeleteHMINode = (programId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        nodeId: string;
      }
    ) => {

      const item = mutation.deleteCommandProgramInterfaceNode({id: args.nodeId})
      
      return {
        item: {
          success: item?.id != null
        }
      }
    }
  );
  return async (node_id: string) => {
    return await mutateFn({
      args: {
        nodeId: node_id,
      },
    });
  };
}

export const useDeleteHMIPath = (programId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        pathId: string;
      }
    ) => {

      const item = mutation.deleteCommandProgramInterfaceEdge({
        id: args.pathId,
        program: programId
      })

      return {
        item: {
          success: item?.id != null
        }
      }
      // const item = mutation.updateCommandPrograms({
      //   where: { id: programId },
      //   update: {
      //     hmi: [
      //       {
      //         where: { node: { id: hmiId } },
      //         update: {
                
      //           node: {
      //             paths: [{
      //               delete: [{
      //                 where: { node: { id: args.pathId } }
      //               }]
      //             }]
      //           },
      //         },
      //       },
      //     ],
      //   },
      // });
      // return {
      //   item: {
      //     ...item.commandPrograms?.[0],
      //   },
      // };
    }
  );

  return async (path_id: string) => {
    return await mutateFn({
      args: {
        pathId: path_id,
      },
    });
  };
}

export const useUpdateHMIPath = (programId: string) => {
  const [ mutateFn ] = useMutation((
    mutation,
    args: {
      id?: string;
      source: string;
      sourceHandle: string;
      sourcePoint: {x: number, y: number},
      target: string;
      targetHandle: string;
      targetPoint: {x: number, y: number},
      points: { x: number; y: number }[];
    }
  ) => {

    let points = args.points.map((x) => ({x: x.x, y: x.y}));

    let tgtPoint = args.targetPoint ? {x: args.targetPoint.x, y: args.targetPoint.y} : undefined;
    let srcPoint = args.sourcePoint ? {x: args.sourcePoint.x, y: args.sourcePoint.y} : undefined;

    const item = mutation.updateCommandProgramInterfaceEdge({
      id: args.id,
      input: {
        from: args.source,
        fromHandle: args.sourceHandle,
        fromPoint: srcPoint,
        to: args.target,
        toHandle: args.targetHandle,
        toPoint: tgtPoint,
        points: points,
      }
    });

    return {
      item: {
        ...item
      }
    }
  })

  return async (
    node_id: string,
    source: string,
    sourceHandle: string,
    sourcePoint: {x: number, y: number},
    target: string,
    targetHandle: string,
    targetPoint: {x: number, y: number},
    points: { x: number; y: number }[]
  ) => {
    return await mutateFn({
      args: {
        id: node_id,
        source,
        sourceHandle,
        sourcePoint,
        target,
        targetHandle,
        targetPoint,
        points,
      }
    })
  }
}

export const useCreateHMIPath = (programId: string, hmiId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        source: string;
        sourceHandle: string;
        sourcePoint: {x: number, y: number},
        target: string;
        targetHandle: string;
        targetPoint: {x: number, y: number},
        points: { x: number; y: number }[];
      }
    ) => {

      const item = mutation.createCommandProgramInterfaceEdge({
        program: programId,
        hmi: hmiId,
        input: {
          from: args.source,
          fromHandle: args.sourceHandle,
          fromPoint: args.sourcePoint,
          to: args.target,
          toHandle: args.targetHandle,
          toPoint: args.targetPoint,
          points: args.points,
        }
      })

      return {
        item: {
          ...item
        }
      }
    }
  );

  return async (
    source: string,
    sourceHandle: string,
    sourcePoint: {x: number, y: number},
    target: string,
    targetHandle: string,
    targetPoint: {x: number, y: number},
    points: { x: number; y: number }[]
  ) => {
    return await mutateFn({
      args: {
        source,
        sourceHandle,
        sourcePoint,
        target,
        targetHandle,
        targetPoint,
        points,
      },
    });
  };
};
