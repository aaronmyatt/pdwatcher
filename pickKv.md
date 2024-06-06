# Pick KV
Show all databases as Select-able list. Unfortunately Deno assigns a (seemingly) random ID to each Deno.Kv instance and it is hard to know which project they map back to.

Later in the workflow the user can assign a name to each KV. When we find a name for database we will show that, we'll also label the databases that have data with an emoji.

## Get KVs
Incase they are not already available
- not: /localKvs
    ```ts
    import localKv from "localKv"
    const { localKvs } = await localKv.process();
    input.localKvs = localKvs
    ```

## Present KVs
```ts
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/select.ts";

input.kvInfo = await Select.prompt({
    message: "Pick a KV",
    options: input.localKvs
        .toSorted((a,b) => {
            if(a.name && !b.name) return -1
            if(a.hasRecords && b.hasRecords) return 0
            if(a.hasRecords && !b.hasRecords) return -1
            return 1
        })
        .map(info => {
            const prefix = info.hasRecords ?  '✅ ' : '❎ '
            return {
                name: info.name || prefix + info.id,
                value: info,
            }
        }),
});
```
