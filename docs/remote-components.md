# Remote Components

HiveCommand has a concept of remote react components to keep the extensibility high without continual updates to the core stack

## Packs

Components can be group into component packs similar to a normal node module, the loader looks for an index.js file and imports everything exported from the index into the component pack by name

## Component

A remote component is a react component exported from a component pack