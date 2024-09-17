import { ModuleKind, ScriptTarget, JsxEmit, CompilerOptions } from 'typescript'

export const FnTranspileOptions : CompilerOptions = {
    kind: ModuleKind.CommonJS,
    target: ScriptTarget.ES5,
    jsx: JsxEmit.React,
    esModuleInterop: true
}

export const UiTranspileOptions = {
    // { kind: ModuleKind.CommonJS, jsx: JsxEmit.React, target: ScriptTarget.ES5 }
}