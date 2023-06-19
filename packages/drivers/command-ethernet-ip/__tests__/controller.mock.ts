import * as EthernetIP from '@hive-command/ethernet-ip'

export const ControllerMock = (tagList: any[], returnValue: any) => ({
    ...EthernetIP,
    ControllerManager: jest.fn(() =>
        // ...EthernetIP.ControllerManager,
        ({
            addController: () => {
                return {
                    on: (key: string, fn: any) => {
        
                    },
                    PLC: {
                        tagList: tagList,
                        getTagArraySize: async (tag: string) => {
                            if(tag == 'RAW_ARR'){ return 3 }
                            return 4;
                        },
                    },
                    addTag: (tagName: string) => {
                        console.log(tagName)
                        return {
                            on: (key: string, fn: any) => {
                                if (key == 'Changed') {
                                    fn({value: returnValue})
                                }
                            }
                        }
                    }
                }
            }
        } as any)
    )
})

// export const Contoller = (tagList: any[], returnValue: any) => ({
//     addController: () => {
//         return {
//             on: (key: string, fn: any) => {

//             },
//             PLC: {
//                 tagList: tagList
//             },
//             addTag: (tagName: string) => {
//                 console.log(tagName)
//                 return {
//                     on: (key: string, fn: any) => {
//                         if (key == 'Changed') {
//                             fn({value: returnValue})
//                         }
//                     }
//                 }
//             }
//         }
//     }
// })
