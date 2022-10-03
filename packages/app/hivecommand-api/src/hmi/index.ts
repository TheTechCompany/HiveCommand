import { mutate, mutation, useMutation } from "../gqty";

export const useCreateHMIAction = (programId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        name: string;
        flow: string[];
      }
    ) => {
      
    }
  );
  return async (name: string, flow: string[]) => {
    return await mutateFn({
      args: {
        name,
        flow,
      },
    });
  };
};

export interface HMIGroupNode {
	x: number,
	y: number,
	rotation: number,
	scaleX: number,
	scaleY: number,
	showTotalizer: boolean,
	type: string
 }

 export interface HMIGroupPort {
	key: string,
	rotation: number,
	length: number,
	x: number,
	y: number
 }

export const useUpdateHMIGroup = (programId: string) => {

	const [ mutateFn ] = useMutation((mutation, args: {
    node: string,
		nodes: HMIGroupNode[]
		ports: HMIGroupPort[]
	}) => {

    const item = mutation.updateCommandProgramInterfaceNode({
      id: args.node,
      input: {
        children: args.nodes,
        ports: args.ports
      }
    })

    return {
      item: {
        ...item
      }
    }
	})

	return async (nodeId: string, nodes: HMIGroupNode[], ports: HMIGroupPort[]) => {
		return await mutateFn({
			args: {
        node: nodeId,
				nodes,
				ports
			}
		})	
	}

};


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
        width?: number,
        height?: number,
        options?: any;
        rotation?: number;
      }
    ) => {
      let hmiUpdate: any = {};
      if (args.x != undefined) hmiUpdate.x = args.x;
      if (args.y != undefined) hmiUpdate.y = args.y;
        if (args.width != undefined) hmiUpdate.width = args.width
        if (args.height != undefined) hmiUpdate.height = args.height;
      if(args.options) hmiUpdate.options = args.options;

      if(args.rotation != undefined) hmiUpdate.rotation = args.rotation;

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
    width?: number,
    height?: number,
    options?: any;
		rotation?: number;
	}) => {
    return await mutateFn({
      args: {
        nodeId: node_id,
        x: update.x,
        y: update.y,
        width: update.width,
        height: update.height,
        options: update.options,
        rotation: update.rotation,
      },
    });
  };
};

export const useDeleteHMIAction = (programId: string) => {
  const [ mutateFn ] = useMutation((mutation, args: {actionId: string}) => {
  
  })

  return async (actionId: string) => {
    return await mutateFn({args: {actionId}})
  }
}

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

    const item = mutation.updateCommandProgramInterfaceEdge({
      id: args.id,
      input: {
        from: args.source,
        fromHandle: args.sourceHandle,
        fromPoint: args.sourcePoint,
        to: args.target,
        toHandle: args.targetHandle,
        toPoint: args.targetPoint,
        points: args.points,
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

export const useAssignHMINode = (programId: string) => {
	const [ mutateFn ] = useMutation((mutation, args: {nodeId: string, deviceId: string}) => {
    const item = mutation.updateCommandProgramInterfaceNode({
      id: args.nodeId,
      input: {
        devicePlaceholder: args.deviceId
      }
    })

    return {
      item: {
        ...item
      }
    }
	})

	return async (
		node_id: string,
		device_id: string
	) => {
		return await mutateFn({
			args: {
				nodeId: node_id,
				deviceId: device_id
			}
		})
	}
};
