export type HookCleanup = () => void;

export type HookInstance = (
    lastState: {[tag: string]: any}, 
    state: {[tag: string]: any}, 
    typedState: {[type: string]: {[tag: string]: any}}
) => HookCleanup
