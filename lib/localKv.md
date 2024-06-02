# Local Kv

Fetch the local instances of Deno Kv databases.
These are stored in the a directory created by deno. We can learn the path to the dir by running `deno info`.

Output: `[{path: '', id: '', records:[]}]` first 10 records

## localDenoLocationDataPath
Extract the path from `deno info`
```ts
import {$} from "jsr:@david/dax";
import { assert } from "jsr:@std/assert/assert";
import { exists, walk } from "jsr:@std/fs";

const result = await $`deno info`.lines()
input.locationPath = '/'+result
    .find(line => line.includes('location_data'))
    .split(' /')
    .at(1)

assert(await exists(input.locationPath))
```

## getPathAndId
Setup an object with Deno KV information.
```ts
import { basename, dirname } from "jsr:@std/path";

input.localKvs = []
for await (const entry of walk(input.locationPath)){
    const id = basename(dirname(entry.path))
    if(entry.name === 'kv.sqlite3'){
        const kv = await Deno.openKv(entry.path)
        $p.set(input, '/localKvs/-', {id, path: entry.path, kv})
    }
}
```

## checkForData
A draw back of working with Deno KV locally is that 
they get totally unapproached names like: `6916b74b438cd5f9a4c303a17443473fa2cb30d46605e253f9e430c799d9bf69`. Ideally we would be able to select by project name. 

I may ask a question in the Deno repo as things progress here. If I can figure how they generate these seemingly random ids I might be able to decyrpt them to find they match something human readable.

Meanwhile, as a first effort, we will query each kv instance and check if they have at least one row.
- not: /localKvs
```ts
const kvPromises = input.localKvs.map(async (localKv) => {
    const records = await localKv.kv.list({prefix: []}, {limit:10})
    localKv.records = await Array.fromAsync(records);
    localKv.hasRecords = localKv.records.length;
    return localKv;
})
input.localKvs = await Promise.all(kvPromises)
```

## checkForMeta
- check: /localKvs
```ts
const kvPromises = input.localKvs.map(async (localKv) => {
    const [name] = await localKv.kv.getMany([
        ["pd", "meta", "name"]
    ])
    localKv.name = name.value;
    return localKv;
})
input.localKvs = await Promise.all(kvPromises)
```
