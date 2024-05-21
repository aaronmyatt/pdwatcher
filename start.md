# Start

We want a small tool that can watch changes to local `Deno.Kv` instances. This will be heavily inspired by [kview](https://kview.deno.dev) but tailored specifically for observing `Deno.Kv` databases that are having Pipedown input/output written to. The idea here is to provide a utility that can enhance the developer experience for people working with Pipedown, increase visibility of a pipe's input/output state and significantly improve feedback loops.


## localDenoLocationDataPath
```ts
import {$} from "jsr:@david/dax";
import { assert } from "jsr:@std/assert/assert";
import { basename, dirname } from "jsr:@std/path";
import { exists, walk } from "jsr:@std/fs";

const result = await $`deno info`.lines()
input.locationPath = '/'+result
    .find(line => line.includes('location_data'))
    .split(' /')
    .at(1)

assert(exists(input.locationPath))
```

## kvPaths
```ts
input.kvDbs = {}
for await (const entry of walk(input.locationPath)){
    if(entry.name === 'kv.sqlite3'){
        $p.set(input, '/kvDbs/'+basename(dirname(entry.path)), entry.path)
    }
}
```

## openEachKv
```ts
const openPromises = Object.entries(input.kvDbs).map(([_, path]) => Deno.openKv(path))
input.kvOpened = await Promise.all(openPromises)
```

## readFirstValueFromEach
```ts
input.valuesPerKv = {}
input.kvOpened.forEach(async (db, index) => {
    const values = await Array.fromAsync(db.list({ prefix: ['pd'] }, {limit: 1}))
    $p.set(input, '/valuesPerKv/'+index, values);
})
```

## watchEachKv
```ts
import {equals as keysAreEqual} from "jsr:@kitsonk/kv-toolbox/keys";

const latest = []

while(1){
    const lastTenInputs = await Promise.all(input.kvOpened.map(async (kv) => { return await Array.fromAsync(kv.list({prefix: ['pd','input']}, { limit: 10 })) }))
    lastTenInputs.forEach(last => {
        last.forEach(entry => {
            if(latest.find(seen => keysAreEqual(seen.key, entry.key) && seen.versionstamp === entry.versionstamp)) return;
            latest.push(entry);
            console.log(entry);
        })
    })

    const lastTenOutputs = await Promise.all(input.kvOpened.map(async (kv) => await Array.fromAsync(kv.list({prefix: ['pd','output']}, { limit: 10 }))))
    lastTenOutputs.forEach(last => {
        last.forEach(entry => {
            if(latest.find(seen => keysAreEqual(seen.key, entry.key) && seen.versionstamp === entry.versionstamp)) return;
            latest.push(entry);
            console.log(entry);
        })
    })

    await (new Promise((resolve) => {
        setTimeout(() => { resolve() }, 1000)
    }))
}
```
