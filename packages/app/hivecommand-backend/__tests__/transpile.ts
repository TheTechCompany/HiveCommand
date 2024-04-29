import { ModuleKind, ScriptTarget, transpile } from 'typescript'
import * as ts from 'typescript'

// const configFileName = __dirname + '/__tests__/tsconfig.json';

// if(!configFileName) throw new Error("No tsconfig found");

// const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
// const compilerOptions = ts.parseJsonConfigFileContent(
//   configFile.config,
//   ts.sys,
//   "./"
// );

// const inputFileName = "module.ts";

// const sourceFile = ts.createSourceFile(
//     inputFileName,
//     `var oldName = undefinedN;`,
//     {
//         languageVersion: compilerOptions.options.target || ScriptTarget.ES2017
//     }
// )


// const program = ts.createProgram({
//     options: compilerOptions.options,
//     rootNames: [inputFileName],
//     projectReferences: compilerOptions.projectReferences,
//     configFileParsingDiagnostics: compilerOptions.errors
// })

// // console.log(program.getSourceFiles().length)

// console.log(program.getSyntacticDiagnostics(sourceFile))
// console.log(program.getSemanticDiagnostics())


const text = ts.transpileModule(`
    var oldName = undefinedN;
    facke();
`, {
    
    compilerOptions: {
        target: ScriptTarget.ES2017,
        module: ModuleKind.ESNext,
        noImplicitAny: true,
        strict: true,
        strictNullChecks: true,
        strictFunctionTypes: true,
        strictBindCallApply: true,
        strictPropertyInitialization: true,
        noImplicitThis: true,
        alwaysStrict: true,
        noImplicitReturns: true,
        declaration: true,
        allowSyntheticDefaultImports: true
    },
    reportDiagnostics: true

});

