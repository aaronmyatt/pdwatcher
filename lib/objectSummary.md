# Object Summariser

Printing lots of objects to the terminal is pretty ugly. So let's only print the keys, maybe the value data type and a summary of the value data.

## limitOutputLength
```ts
const {columns} = Deno.consoleSize()
input.outputLength = (stringLength, padding=3) => columns - stringLength - padding
```


## debugMode
- flags: /all
    ```ts
    console.log(input.obj)
    ```

## levelOne
Read through the top level of the object and collect each data type into its own bucket (groupBy?). 
```ts
input.realTypeOf = (val) => {
    let realType = '';
    const maybeType = typeof val
    if(maybeType == 'object'){
        realType = val.length ? 'array' : 'object'
    }
    return realType || maybeType;
}


input.groups = Object.entries(input.obj).reduce((acc, entry) => {
    const group = input.realTypeOf(entry[1])
    $p.set(acc, '/'+group+'/-', entry)
    return acc;
}, {})
```

## stringSummary
So long as the strings are not too long, we're all good, otherwise we should truncate them and add an indicator about how long it was originally.
- check: /groups/string
- ```ts
    const stringSummaries = $p.get(input, '/groups/string').map(([key,val]) => {
        const sample = val.slice(0, input.outputLength(key.length, 8))
        return [key, JSON.stringify(sample)]
    })
    $p.set(input, '/summary/string', stringSummaries)
    ```

## numbersLeaveAsIs
A gamble here, but let's leave numbers alone.
- check: /groups/number
- ```ts
    $p.set(input, '/summary/number', $p.get(input, '/groups/number'))
    ```

## boolLeaveAsIs
A gamble here, but let's leave numbers alone.
- check: /groups/boolean
- ```ts
    $p.set(input, '/summary/boolean', $p.get(input, '/groups/boolean'))
    ```

## arraySummary
I'm thinking we just preserve the first element and leave an indicator of how many have been cut off. One challenge, which will be the same challenge we have with objects, is whether we can recursively call this same pipe to summarise the nested object!
- check: /groups/array
- ```ts
    const arraySummary = $p.get(input, '/groups/array').map(([key, val]) => {
        const first = JSON.stringify($p.get(val, '/0'));
        const itemSummary = first.slice(0,input.outputLength(key.length, 9))
        return [
            key, '['+itemSummary
        ]
    })
    $p.set(input, '/summary/array', arraySummary)
    ```


## objectSummary
I'm thinking we just preserve the first element and leave an indicator of how many have been cut off. One challenge, which will be the same challenge we have with objects, is whether we can recursively call this same pipe to summarise the nested object!
- check: /groups/object
- ```ts
    const objSummary = $p.get(input, '/groups/object').map(([key, val]) => {
        const asString = JSON.stringify(val) || '';
        const itemSummary = asString.slice(0,input.outputLength(key.length, 7))
        return [
            key, `${itemSummary}`
        ]
    })
    $p.set(input, '/summary/object', objSummary)
    ```

## presentSummary
Drop all our groups into a single array, sort them alphabetically, and return this new object with all values summarised.
- check: /summary
    ```ts
    input.allSummaries = Object.entries($p.get(input, '/summary'))
        .reduce((acc, [,group]) => acc.concat(group), [])
        .toSorted(([nameA], [nameB]) => {
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        })
    ```

## outputDetailed
Return this new object with all values summarised.
```ts
input.summary = Object.fromEntries(input.allSummaries || [])
```
