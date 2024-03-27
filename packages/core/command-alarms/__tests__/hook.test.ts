import { makeHook } from "../src/hook/utils";

describe("Hook tests", () => {
    it('Can return cleanup', () => {

        const hook = makeHook(`
            export const handler = () => {
                let a = 2;

                setInterval(() => a++, 1000);
                return () => {
                    return a;
                }
            }
        `, [], async () => {return false}, () => {})

        const a : any = hook.handler?.([], [])

        setTimeout(() => {
            console.log(a?.());

        }, 10 * 6000);
    });

})