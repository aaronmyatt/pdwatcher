# Last From a Kv Store
This was getting a little convoluted for a single function. Let's go thorugh it step by step.

Incase a store hasn't been selected, we'll expect an id to be passed in the input object. We'll use that to get the store.

## getStore
- check: /kvid
    ```ts
    import localKv from "localKv"
    const { localKvs } = await localKv.process();

    input.kvInfo = localKvs.find(kv => kv.id === input.kvid)
    ```

## onlyIfSomethingChanged
If we already have `input.changes` let's compare what's in the db to that we have already. If nothing has changed we'll return early.
```ts
input.skipRender = false;
input.changes = input.changes || [];

const latestOutputs = input.kvInfo.kv.list({ prefix: ['pd', 'output'] })


for await (const record of latestOutputs){
    const alreadySeen = input.changes.some(({key, versionstamp}) => {
        return key.at(-1) === record.key.at(-1) && versionstamp === record.versionstamp
    })
    if(alreadySeen) {
        input.skipRender = true
    }
    else {
        input.changes.push(record)
    }
}
```

## getLatestOutputs
- not: /skipRender
    ```ts
    import { Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";
    import objectSummary from "objectSummary"

    const renderObject = (name, summary) => Table.from([[name], [summary]]).render()

    await Promise.all(input.changes.map(async record => {
        let value = record.value;
        if(typeof value === 'string') (value = JSON.parse(value));
        const output = await objectSummary.process({obj:value})
        renderObject(record.key.at(-1), output.summary)
    }))
    ```
