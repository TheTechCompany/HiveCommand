import { useMutation } from "../gqty";
export * from './reports'
/*
	Create new device

	@param {string} name - name of the device
	@param {string} network_name - DNS prefix for the device
	@param {string} program - program id to connect to
*/
export const useCreateDevice = () => {
  const [mutateFn, info] = useMutation(
    (
      mutation,
      args: { name: string; network_name: string; program?: string }
    ) => {
      let createExtras = {};
      if (args.program) {
        createExtras = {
          activeProgram: { connect: { where: { node: { id: args.program } } } },
        };
      }

      const item = mutation.createCommandDevice({
        input: {
          name: args.name,
          network_name: args.network_name,
          program: args.program
        }
        // where: { members: { id: user } },
        // update: {
        //   commandDevices: [
        //     {
        //       create: [
        //         {
        //           node: {
        //             name: args.name,
        //             network_name: args.network_name,
        //           },
        //         },
        //       ],
        //     },
        //   ],
        // },
      });
      return {
        item: {
          ...item
        },
      };
    }
  );

  return async (name: string, network_name: string, program?: string) => {
    // let query = '';

    // if(program){
    // 	query = `
    // 		createCommandDevices({
    // 			input: [{
    // 				name: $name,
    // 				network_name: $network_name,
    // 				activeProgram: {connect: {where: {node: {id: $program}}}}
    // 			}]
    // 		})`
    // }else{
    // 	query = `
    // 		createCommandDevices({
    // 			input: [{
    // 				name: $name,
    // 				network_name: $network_name
    // 			}]
    // 		})`
    // }
    return mutateFn({ args: { name, network_name, program } });
  };
};

/*
	Update device

	@param {string} id - id of the device
	@param {string} name - name of the device
	@param {string} network_name - DNS prefix for the device
	@param {string} program - program id to connect to
*/
export const useUpdateDevice = () => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: { id: string; name: string; program?: string; network_name: string }
    ) => {
      let programUpdate = {};

      if (args.program) {
        programUpdate = {
          activeProgram: {
            disconnect: {
              where: {
                node: {
                  id_NOT: args.program,
                },
              },
            },
            connect: {
              where: {
                node: {
                  id: args.program,
                },
              },
            },
          },
        };
      }

	  const item = mutation.updateCommandDevice({
      where: {id: args.id},
      input: {
        name: args.name,
        network_name: args.network_name,
        program: args.program,
      }
		  // where: { members: { id: user } },
		  // update: {
			//   commandDevices: [{
			// 	  where: {node: {id: args.id}},
			// 	  update: {
			// 		  node: {
			// 			  name: args.name,
			// 			  network_name: args.network_name,
			// 			  ...programUpdate
			// 		  }
			// 	  }
			//   }]
		  // }
		})

		return {
			item: {
				...item
			}
		}
    //   mutation.updateCommandDevices({
    //     where: { id: args.id },
    //     update: {
    //       name: args.name,
    //       network_name: args.network_name,
    //     },
    //   });
    }
  );
  return async (
    id: string,
    name: string,
    network_name: string,
    program?: string
  ) => {
    return await mutateFn({
      args: {
        id,
        name,
        network_name,
        program,
      },
    });
  };
};


export const useCreateDeviceScreen = (deviceId: string) => {
  const [ createScreen ] = useMutation((mutation, args: {name: string}) => {
    const item = mutation.createDeviceScreen({device: deviceId, input: {name: args.name}})
    return {
      item: {
        ...item
      }
    }
  })

  return (name: string) => {
    return createScreen({args: {name}})
  }
}


/*
	Map a program device to the actualized device bus

	@param {string} deviceId - id of the device with bus'
	@param {string} peripheralId - id of the bus
	@param {string} port - port index of bus
	@param {string} mapDevice - program device to map

*/
export const useMapPort = (deviceId: string) => {
  const [mutateFn] = useMutation(
    (
      mutation,
      args: {
        deviceId: string,
        deviceState: string,
        path: string,
      }
    ) => {

    
      const item = mutation.connectCommandDeviceData({
        where: {id: deviceId},
        input: {
          path: args.path,
          device: args.deviceId,
          deviceState: args.deviceState
        }
      })
      // const item = mutation.updateCommandDevice({
      //   where: {id: deviceId}, 
      //   input: {
      //     peripherals: [
      //       {
      //         id: args.peripheralId,
      //         mappedDevices: args.connections.map((connection) => ({
      //           ...connection,
      //           port: args.port
      //         }))
      //       }
      //     ] 
      //   }
      // })
    //   let deviceMapping: any[] = [
    //     {
    //       create: args.connections
    //         .filter((a) => !a.id)
    //         .map((map) => {
    //           let keyConnect = map.key
    //             ? {
    //                 key: {
    //                   connect: {
    //                     where: {
    //                       node: {
    //                         key: map.key,
    //                         product: {
    //                           peripheral: { id: args.peripheralId },
    //                           peripheralConnection: {
    //                             edge: { port: args.port },
    //                           },
    //                         },
    //                       },
    //                     },
    //                   },
    //                 },
    //               }
    //             : {};

    //           let deviceConnect = map.device
    //             ? {
    //                 device: {
    //                   connect: {
    //                     where: {
    //                       node: {
    //                         id: map.device,
    //                       },
    //                     },
    //                   },
    //                 },
    //               }
    //             : {};

    //           let valueConnect = map.value
    //             ? {
    //                 value: {
    //                   connect: {
    //                     where: {
    //                       node: {
    //                         device: {
    //                           usedIn: {
    //                             id_IN: [map.device],
    //                           },
    //                         },
    //                         key: map.value,
    //                       },
    //                     },
    //                   },
    //                 },
    //               }
    //             : {};
    //           return {
    //             node: {
    //               ...keyConnect,
    //               ...deviceConnect,
    //               ...valueConnect,
    //             },
    //             edge: {
    //               port: args.port,
    //             },
    //           };
    //         }),
    //     },
    //     ...(args.connections || [])
    //       .filter((a) => a.id)
    //       .map((item) => {
    //         return {
    //           where: { node: { id: item.id } },
    //           update: {
    //             node: {
    //               key: {
    //                 connect: {
    //                   where: {
    //                     node: {
    //                       key: item.key,
    //                       product: {
    //                         peripheral: { id: args.peripheralId },
    //                         peripheralConnection: { edge: { port: args.port } },
    //                       },
    //                     },
    //                   },
    //                 },
    //               },
    //               device: {
    //                 disconnect: {
    //                   where: {
    //                     node: {
    //                       id_NOT: item.device,
    //                     },
    //                   },
    //                 },
    //                 connect: {
    //                   where: {
    //                     node: {
    //                       id: item.device,
    //                     },
    //                   },
    //                 },
    //               },
    //               value: {
    //                 disconnect: {
    //                   where: {
    //                     node: {
    //                       device: {
    //                         id_NOT_IN: [item.device],
    //                       },
    //                       key_NOT: item.value,
    //                     },
    //                   },
    //                 },
    //                 connect: {
    //                   where: {
    //                     node: {
    //                       device: {
    //                         usedIn: {
    //                           id_IN: [item.device],
    //                         },
    //                       },
    //                       key: item.value,
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         };
    //       }),
    //   ];

    //   const item = mutation.updateCommandDevices({
    //     where: { id: deviceId },
    //     update: {
    //       peripherals: [
    //         {
    //           where: { node: { id: args.peripheralId } },
    //           update: {
    //             node: {
    //               mappedDevices: deviceMapping,
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   });
	  // return {
		//   item: {
		// 	  ...item.commandDevices?.[0]
		//   }
	  // }

    return {
      item: {
        ...item
      }
    }
  });

  return async (
    deviceId: string,
    deviceState: string,
    path: string
  ) => {

	  return await mutateFn({
      args: {
        deviceId: deviceId,
        deviceState: deviceState,
        path: path
      }
	  })
  };
};

// const [ mapPort, mapInfo ] = useMutation((mutation, args: {
// 	id: string,
// 	port: string,
// 	peripheralId: string,

// 	mapping: {id?: string, key: string, device: string, value: string}[],
// 	deviceId: string[],

// }) => {

// 	const device = mutation.updateCommandDevices({
// 		where: {id: args.id},
// 		update: {
// 			peripherals: [{
// 				where: {
// 					node: {
// 						id: args.peripheralId
// 					}
// 				},
// 				update: {
// 					node: {
// 						mappedDevices:
// 					}
// 				}
// 			}]
// 		}
// 	})
// 	return {
// 		item: {
// 			...device.commandDevices?.[0]
// 		},
// 	}
// })


export const useUpdateDeviceSetpoint = (deviceId: string) => {
  const [ mutateFn ] = useMutation((mutation, args: {
    setpoint: string,
    value: string
  }) => {
    const item = mutation.updateCommandDeviceSetpoint({
      device: deviceId,
      setpoint: args.setpoint,
      value: args.value
    })

    return {
      item: item
    }
  })

  return (setpoint: string, value: string) => {
    return mutateFn({
      args: {
        setpoint,
        value
      }
    })
  }
}

export const useCreateDeviceMaintenanceWindow = (deviceId: string) => {
  const [ createWindow ] = useMutation((mutation, args: {startTime: Date, endTime: Date}) => {
    const item = mutation.createCommandDeviceMaintenanceWindow({
      device: deviceId,
      input: {
        startTime: args.startTime.toISOString(),
        endTime: args.endTime.toISOString()
      }
    })
    return {
      item: {
        ...item
      }
    }
  })

  return (startTime: Date, endTime: Date) => {
    return createWindow({args: {startTime, endTime}})
  }
}