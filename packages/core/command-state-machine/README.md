# Command State Machine

## Usage

```
import FSM, {CommandStateMachineMode} from '@hive-command/state-machine';

const fsm = new FSM({
	processes: [
		{
			id: 'first',
			name: 'First Flow',
			nodes: [{

			}],
			edges: [{

			}]
		}
	]
})

fsm.changeMode(CommandStateMachineMode.AUTO)
fsm.start()

fsm.stop()

fsm.changeMode(CommandStateMachineMode.MANUAL)
fsm.runFlow('first')

fsm.stopFlow('first')
```


## Properties

### `fsm.mode`

### `fsm.isRunning`

## Methods

### `fsm.changeMode(mode: "AUTO" | "MANUAL" | "DISABLED") : Error | void`

### `fsm.start()`

### `fsm.stop()`

### `fsm.runFlow(id: string)`

### `fsm.stopFlow(id: string)`

