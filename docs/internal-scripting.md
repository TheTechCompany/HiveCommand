# Internal Scripting

## ValueStore

Internal scripting has access to a ValueStore interface that maps all tags for a program into a global json state object

## SetValueStore

Allows for setState similar to React.useState

## TemplateInput

A templated input that has access to ValueStore and an autocomplete interface with {{ tags }} (uses doT under the hood with a regex to turn {{tags}} into {{= it.tags}} )


## Example

```js
export const getter = (values: ValueStore) => {

}

export const setter = (values: ValueStore, setValues: SetValueStore) => {

}
```

```js
export const handler = (elem: {}) => {

}
```