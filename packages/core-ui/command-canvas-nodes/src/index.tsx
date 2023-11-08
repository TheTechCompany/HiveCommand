import { HMINode } from './nodes'
import { LinePath } from './paths';

export * from './nodes'
export * from './paths';

export const nodeTypes = (editor: boolean) => ({
    ['hmi-node']: HMINode(editor)
})

export const edgeTypes = (editor: boolean) => ({
    line: LinePath(editor)
})