# CLI Actions

```ts
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/select.ts";
import { tty } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/tty.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/input.ts";
import { Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";
```

## NoFlags
When no flags are used we should drop the user into a Select so that we can present and line up a desired action.
- not: /gotFlags
    ```ts
    const options = [
        { name: "Select KV", value: "/flags/kv" },
        { name: "Info", value: "/flags/info" },
    ]
    const flag = await Select.prompt({
            message: "Pick your adventure.",
            options
        });

    tty
        .cursorHide
        .cursorTo(0, 0)
        .eraseScreen();
    options.map(option => $p.set(input, option.value, false))
    $p.set(input, flag, true);
    ```

## showInfo
Present simple information about each KV on the system in a tabular form:
Name | ID | Path
- flags: /info
    ```ts
    import localKv from "localKv"
    const { localKvs } = await localKv.process();
    const rows = localKvs.map(({name, id, path}) => [name || 'Add a name', id, path])
    Table.from([['Name', 'ID', 'Path']].concat(rows)).render()
    ```

## selectKv
- flags: /kv
    ```ts
    const { localKvs } = await localKv.process();

    input.kvInfo = await Select.prompt({
        message: "Pick a KV",
        options: localKvs
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

## selectAction
- check: /kvInfo
    ```ts
    const action = await Select.prompt({
        message: "Action!",
        options: [
            { name: "Watch 👀", value: "watch" },
            { name: "Latest", value: "latest" },
            { name: "Rename", value: "rename" },
        ],
    });
    $p.set(input, `/action/${action}`, true)
    ```

## actionWatch
    keypress().addEventListener("keydown", (event: KeyPressEvent) => {
        console.log(event.currentTarget);

        if (event.key === 'escape') {
            keypress().dispose();
            stopInterval = true;
        }
    });
- check: /action/watch
- and /kvInfo
- ```ts
    import { keypress, KeyPressEvent, } from "https://deno.land/x/cliffy@v1.0.0-rc.4/keypress/mod.ts";
    import objectSummary from "objectSummary"
    let stopInterval = false;
    let somethingNew = false;

    const changes = await Array.fromAsync(input.kvInfo.kv.list({ prefix: ['pd', 'output'] }))
    changes.map(async record => {
        let value = record.value;
        if(typeof value === 'string') (value = JSON.parse(value));
        const output = await objectSummary.process({obj:value})
        Table.from([[record.key.at(-1), output.summary]]).border().render()
    })

    const interval = setInterval(async () => {
        if(stopInterval) clearInterval(interval)

        somethingNew && tty
            .cursorHide
            .cursorTo(0, 0)
            .eraseScreen();
        somethingNew = false;

        const records = input.kvInfo.kv.list({ prefix: ['pd', 'output'] })
        for await (const record of records){
            const alreadySeen = changes.some(({key, versionstamp}) => {
                return key.at(-1) === record.key.at(-1) && versionstamp === record.versionstamp
            })
            if(alreadySeen) {}
            else {
                somethingNew = true;
                changes.push(record)
                let value = record.value;
                if(typeof value === 'string') (value = JSON.parse(value));
                const output = await objectSummary.process({obj:value});
                Table.from([[record.key.at(-1), output.summary]]).border().render()
            }
        }
    }, 1000)


    await keypress()
    stopInterval = true;
    console.log();
    ```

## actionAction
- check: /action/latest
- and /kvInfo
- ```ts
    console.log($p.get(input, '/kvInfo/records'))
    ```

## actionRename
Write to a pdwatcher object in the db to keep some meta data handy between runs
- check: /action/rename
- and /kvInfo
- ```ts
    const name: string = await Input.prompt("KV name");
    await input.kvInfo.kv.set(['pd', 'meta', 'name'], name)
    console.log('Name updated ✅')
    ```

```ts
console.log();
```
