# CLI Actions
What should be possible here? I want to focus improving feedback loops for pipedown developers initially. The typical workflow should be:

- run `pdw`
- choose a db
- see latest input/output
- optionally select an object to "drilldown" and see the full data
  - I would also like to experiment with a simple JSON Pointer based interactive prompt for exploring objects
- copy data to clipboard? 🤷

On subsequent runs

- run `pwd`
  - remember which database was chosen last time (localStorage 💥)
- see latest input/output

```ts
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/select.ts";
import { tty } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/tty.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/input.ts";
import { Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";
```

## NoFlags
When no flags are used we should drop the user into a Select so that we can present and line up a desired action.

We reset the actions on each loop to prevent two actions being executed in the same loop.
- not: /gotFlags
    ```ts
    const options = [
        { name: "Select KV", value: "/flags/kv" },
        { name: "Info", value: "/flags/info" },
    ]
    
    options.map(option => $p.set(input, option.value, false))

    const flag = await Select.prompt({
        message: "Pick your adventure.",
        options
    });

    tty
        .cursorHide
        .cursorTo(0, 0)
        .eraseScreen();

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

## interactWithKv
- flags: /kv
    ```ts
    import kvActions from "kvActions"
    while(true){
        await kvActions.process(input);
        if(input.back) {
            $p.set(input, '/back', false);
            break;
        }
    }
    ```

```ts
console.log();
```
