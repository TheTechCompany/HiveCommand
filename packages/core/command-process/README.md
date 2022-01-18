# Command Process

## Usage

```
import Process from '@hive-command/process';

const process = new Process(  
	process: CommandProcess, 
    actions: CommandAction[], 
    performOperation: (device: string, release: boolean, operation: string) => Promise<any>, 
    getState: any,
    parent?: CommandProcess
)
```

## Methods

### `process.start()`

### `process.stop()`