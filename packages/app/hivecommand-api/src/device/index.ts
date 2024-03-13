import { useMutation } from "../gqty";
export * from './analytics'
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