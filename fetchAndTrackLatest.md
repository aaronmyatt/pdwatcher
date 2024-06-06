# outputLatestFromAllKvStores

Rather than getting complicated with nested loops and navigated between many screens. I think we can drilldown to the core information that we want pdwatch to put in front of us. Let's iterate over all kv stores and log their latest pipedown input/outputs.

We will keep the presentation quite simple. Lines of this format:

`<kvname> <pipename> <input/output> <Object.keys>`


## fetchKVs
```ts
import localKv from "localKv"
const { localKvs } = await localKv.process();
input.localKvs = localKvs;
```

## setupHistory
We only want to output to the screen once for each unique record. So, on each loop we will look through the latest output and check if we have already seen it. If we have, we will skip it.
```ts
input.history = input.history || {};
if(Object.keys(input.history).length){}
else {
    for(const kvInfo of input.localKvs){
        input.history[kvInfo.id] = []
    }
}
```

## getLatestOutputs
The call to the `localKv` pipe will have the latest outputs fetched
```ts
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";

const formatRecord = (name, record) => {
    const logBase = `${name || 'NoName'} ${record.key.at(-2)} ${colors.bold.green(record.key.at(-1))}`;
    try {
        let value = record.value;
        typeof value === 'string' && (value = JSON.parse(value));
        const keys = Object.keys(value).map(k => {
            if(k === 'error') return colors.red(k);
            if(k === 'errors') return colors.red(k);
            return k;
        })
        return `${logBase} ${keys}`;
    } catch(e) {
        input.debug && console.error(e.message);
        return `${logBase} ${colors.yellow(record.value)}`;
    }
}

for(const kvInfo of input.localKvs){
    for(const record of kvInfo.records){
        const seen = input.history[kvInfo.id].find(seen => {
            return record.key.at(-1) === seen.key.at(-1) && record.versionstamp === seen.versionstamp;
        })

        if(seen) continue;
        $p.set(input, `/history/${kvInfo.id}/-`, record);
        console.log(formatRecord(kvInfo.name, record));
    }
}
```

## waitBetweenQuerySweeps
We will wait a few seconds between each sweep of the kv stores.
```ts
await new Promise(resolve => setTimeout(resolve, 1000));
```
