import { ModuleKind, transpile } from 'typescript'
import { load_exports, parseValue } from "@hive-command/scripting";

describe('Runner', () => {
    it('Timing', () => {
        
        const jsCode = transpile(`
            export const getter = (value: any) => {
                return value.kind;
            }
        `, { module: ModuleKind.CommonJS })

        const { getter } = load_exports(jsCode)

        console.time('RunnerTime')

        parseValue('Number', getter({kind: '1234'}))

        console.timeEnd('RunnerTime')


    })
})