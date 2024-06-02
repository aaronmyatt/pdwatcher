import {$} from "jsr:@david/dax";
import { assert } from "jsr:@std/assert/assert";
import { exists, walk } from "jsr:@std/fs";
import { basename, dirname } from "jsr:@std/path";
import $p from "jsr:@pd/pointers@0.1.1";

const input = {
    localKvs: [],
    locationPath: '',

}

const result = await $`deno info`.lines()
input.locationPath = '/'+result
    .find(line => line.includes('location_data'))
    .split(' /')
    .at(1)

assert(await exists(input.locationPath))


while(true){
    for await (const entry of walk(input.locationPath)){
        const id = basename(dirname(entry.path))
        if(entry.name === 'kv.sqlite3'){
            const kv = await Deno.openKv(entry.path)
            $p.set(input, '/localKvs/-', {id, path: entry.path, kv})
        }
    }
    
    const kvPromises = input.localKvs.map(async (localKv) => {
        const records = await localKv.kv.list({prefix: []}, {limit:10})
        localKv.records = await Array.fromAsync(records);
        localKv.hasRecords = localKv.records.length;
        return localKv;
    })
    input.localKvs = await Promise.all(kvPromises)
    
    const kvPromises1 = input.localKvs.map(async (localKv) => {
        const [name] = await localKv.kv.getMany([
            ["pd", "meta", "name"]
        ])
        localKv.name = name.value;
        return localKv;
    })
    input.localKvs = await Promise.all(kvPromises1)
}

console.log(input);