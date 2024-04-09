import { makeHook } from "../src/hook/utils";

describe("Hook tests", () => {
    it('Can return cleanup', async () => {

        const res = await new Promise((resolve) => {

            const hook = makeHook(`
            export const handler = () => {
                let a = 2;

                setInterval(() => a++, 1000);
                return () => {
                    return a;
                }
            }
        `, [], async () => {return false}, () => {})

            const a : any = hook.handler?.({}, {}, {})

            setTimeout(() => {
                resolve(a?.())
            }, 1 * 1000);
        })
        expect(res).toBe(3)
    });


    it('Receives last state and can R_TRIG', async () => {
        const res = await new Promise((resolve) => {
            const hook = makeHook(`
                export const handler = (lastState: any, state: any, typedState: any) => {

                    if(!lastState.ReticulationLockout && state.ReticulationLockout){
                        return () => {
                            return "Locked out"
                        }
                    }

                    return () => {
                        return {lastState, state};
                    }
                }
            `, [], async () => {return false}, () => {})

            const a : any = hook.handler?.({ReticulationLockout: false}, {ReticulationLockout: true}, {})

            resolve(a?.());
        })
       
        expect(res).toBe('Locked out');
    })

})