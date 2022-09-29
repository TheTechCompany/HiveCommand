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
      // const item = mutation.createCommandProgramInterfaceGroup()
      // const item = mutation.updateCommandPrograms({
      //   where: { id: programId },
      //   update: {
      //     hmi: [
      //       {
      //         where: { node: { id: hmiId } },
      //         update: {
      //           node: {
      //             actions: [
      //               {
      //                 create: [
      //                   {
      //                     node: {
      //                       name: args.name,
      //                       flow: {
      //                         connect: args.flow.map((f) => ({
      //                           where: { node: { id: f } },
      //                         })),
      //                       },
      //                     },
      //                   },
      //                 ],
      //               },
      //             ],
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

    // const item = mutation.createCommandProgramInterfaceGroup({
    //   program: programId,
    //   node: args.node,
    //   input: {
    //     nodes: args.nodes,
    //     ports: args.ports,
    //   }
    // })
	
		// const item = mutation.updateCommandPrograms({
		// 	where: {id: programId},
		// 	update: {
		// 		hmi: [{
		// 			where: {node: {id: hmiId}},
		// 			update: {
		// 				node: {
		// 					groups: [{
		// 						create: [{
		// 							node: {
		// 								ports: {
		// 									create: args.ports.map((p) => ({
		// 										node: {
		// 											...p
		// 										}
		// 									}))
		// 								},
		// 								nodes: {
		// 									create: args.nodes.map((node) => ({
		// 										node: {
		// 											x: node.x,
		// 											y: node.y,
		// 											rotation: node.rotation,
		// 											scaleX: node.scaleX,
		// 											scaleY: node.scaleY,
		// 											showTotalizer: node.showTotalizer,
		// 											type: {connect: {where: {node: {name: node.type}}}}
		// 										}
		// 									}))
		// 								}
		// 							}
		// 						}]
		// 					}]
		// 				}
		// 			}
		// 		}]
		// 	}
		// })

		// return {
		// 	item: {
		// 		...item.commandPrograms?.[0]
		// 	}
		// }

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

// export const useUpdateHMIGroup = () => {
	
// 	const [ mutateFn ] = useMutation((mutation, args: {
// 		id: string,
// 		x: number,
// 		y: number
// 	}) => {

//     const item = mutation.updateCommandProgramInterfaceGroup({
//       id: args.id,
//       input: {
//         x: args.x,
//         y: args.y
//       }
//     })
// 		// const item = mutation.updateCommandHMIGroups({
// 		// 	where: {id: args.id},
// 		// 	update: {
// 		// 		x: args.x,
// 		// 		y: args.y
// 		// 	}
// 		// })
// 		// return {
// 		// 	item: {
// 		// 		...item.commandHmiGroups?.[0]
// 		// 	}
// 		// }
//     return {
//       item: {
//         ...item
//       }
//     }
// 	})
// 	return async (id: string, x: number, y: number) => {

// 		return await mutateFn({args: {id, x, y}})
// 	}
// };

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
      // const item = mutation.updateCommandPrograms({
      //   where: { id: programId },
      //   update: {
      //     hmi: [
      //       {
      //         where: { node: { id: hmiId } },
      //         update: {
      //           node: {
      //             nodes: [
      //               {
      //                 create: [
      //                   {
      //                     node: {
      //                       type: {
      //                         connect: { where: { node: { name: args.type } } },
      //                       },
      //                       x: args.x,
      //                       y: args.y,
      //                     },
      //                   },
      //                 ],
      //               },
      //             ],
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

      // const item = mutation.updateCommandPrograms({
      //   where: { id: programId },
      //   update: {
      //     hmi: [
      //       {
      //         where: { node: { id: hmiId } },
      //         update: {
      //           node: {
      //             nodes: [
      //               {
      //                 where: { node: { id: args.nodeId } },
      //                 update: {
      //                   node: hmiUpdate,
      //                 },
      //               },
      //             ],
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
    // const item = mutation.updateCommandPrograms({
    //   where: { id: programId },
    //   update: {
    //     hmi: [
    //       {
    //         where: { node: { id: hmiId } },
    //         update: {
    //           node: {
    //             actions: [{
    //               delete: [{where: {node: {id: args.actionId}}}]
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
      // const item = mutation.updateCommandPrograms({
      //   where: { id: programId },
      //   update: {
      //     hmi: [
      //       {
      //         where: { node: { id: hmiId } },
      //         update: {
      //           node: {
      //             nodes: [
      //               {
      //                 delete: [{
      //                   where: { node: { id: args.nodeId } }
      //                 }],
      //               },
      //             ],
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
      target: string;
      targetHandle: string;
      points: { x: number; y: number }[];
    }
  ) => {
    const item = mutation.updateCommandProgramInterfaceEdge({
      id: args.id,
      input: {
        from: args.source,
        fromHandle: args.sourceHandle,
        to: args.target,
        toHandle: args.targetHandle,
        points: args.points,
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
    source: string,
    sourceHandle: string,
    target: string,
    targetHandle: string,
    points: { x: number; y: number }[]
  ) => {
    return await mutateFn({
      args: {
        id: node_id,
        source,
        sourceHandle,
        target,
        targetHandle,
        points,
      }
    })
  }
}

export const useCreateHMIPath = (programId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        source: string;
        sourceHandle: string;
        target: string;
        targetHandle: string;
        points: { x: number; y: number }[];
      }
    ) => {

      const item = mutation.createCommandProgramInterfaceEdge({
        program: programId,
        input: {
          from: args.source,
          fromHandle: args.sourceHandle,
          to: args.target,
          toHandle: args.targetHandle,
          points: args.points,
        }
      })

      return {
        item: {
          ...item
        }
      }
    //   let paths = [
    //     !args.id
    //       ? {
    //           create: [
    //             {
    //               node: {
    //                 source: {
    //                   CommandHMIGroup: {
    //                     connect: { where: { node: { id: args.source } } },
    //                   },
    //                   CommandHMINode: {
    //                     connect: { where: { node: { id: args.source } } },
    //                   },
    //                 },
    //                 target: {
    //                   CommandHMIGroup: {
    //                     connect: { where: { node: { id: args.target } } },
    //                   },
    //                   CommandHMINode: {
    //                     connect: { where: { node: { id: args.target } } },
    //                   },
    //                 },
    //                 sourceHandle: args.sourceHandle,
    //                 targetHandle: args.targetHandle,
    //                 points: args.points,
    //               },
    //             },
    //           ],
    //         }
    //       : {
    //           where: { node: { id: args.id } },
    //           update: {
    //             node: {
    //               source: {
    //                 CommandHMIGroup: {
    //                   connect: { where: { node: { id: args.source } } },
    //                 },
    //                 CommandHMINode: {
    //                   connect: { where: { node: { id: args.source } } },
    //                 },
    //               },
    //               target: {
    //                 CommandHMIGroup: {
    //                   connect: { where: { node: { id: args.target } } },
    //                 },
    //                 CommandHMINode: {
    //                   connect: { where: { node: { id: args.target } } },
    //                 },
    //               },
    //               sourceHandle: args.sourceHandle,
    //               targetHandle: args.targetHandle,
    //               points: args.points,
    //             },
    //           },
    //         },
    //   ];
    //   const item = mutation.updateCommandPrograms({
    //     where: { id: programId },
    //     update: {
    //       hmi: [
    //         {
    //           where: { node: { id: hmiId } },
    //           update: {
    //             node: {
		// 			paths: paths
		// 		}
    //           },
    //         },
    //       ],
    //     },
    //   });

	  // return {
		//   item: {
		// 	  ...item.commandPrograms?.[0]
		//   }
	  // }
    }
  );

  return async (
    source: string,
    sourceHandle: string,
    target: string,
    targetHandle: string,
    points: { x: number; y: number }[]
  ) => {
    return await mutateFn({
      args: {
        source,
        sourceHandle,
        target,
        targetHandle,
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
		// const item = mutation.updateCommandPrograms({
		// 	where: {id: programId},
		// 	update: {
		// 		hmi: [{
		// 			where: {node: {id: hmiId}},
		// 			update: {
		// 				node: {
		// 					nodes: [{
		// 						where: {node: {id: args.nodeId}},
		// 						update: {
		// 							node: {
		// 								devicePlaceholder: {
		// 									connect: {where: {node: {id: args.deviceId}}}
		// 								}
		// 							}
		// 						}
		// 					}]
		// 				}
		// 			}
		// 		}]
		// 	}
		// })
		// return {
		// 	item: {
		// 		...item.commandPrograms?.[0]
		// 	}
		// }
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
