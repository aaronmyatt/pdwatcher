# mainLoop

```ts
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/input.ts";
```

## latestFromAllKvStores
- check: /action/log
    ```ts
    import fetchAndTrackLatest from "fetchAndTrackLatest"

    input.showHistory = true;
    input.interval = setInterval(async () => {
        const output = await fetchAndTrackLatest.process(input)
        Object.assign(input, output);
        input.showHistory = false;
    }, 1000);

    input.actionCode = await Input.prompt('r: reset, d: drilldown, q: quit');
    clearInterval(input.interval);
    ```

## drilldown
- check: /action/drilldown
    ```ts
    import { Select, Input as PromptInput, prompt } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";
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

    const options = Object.entries(input.history).map(([key, values]) => {
            const { name } = input.localKvs.find(kv => kv.id === key)
            return values.map(record => {
                return {
                    name: formatRecord(name || key, record),
                    value: {
                        kvid: key,
                        ...record
                    }
                }
            })
        }).flat()

    const output: string = await prompt([
        { 
            message: `Pick from ${options.length} blob${options.length>0&&'s'} to drill down into:`, 
            search: true,
            name: "pickRecord",
            options,
            type: Select,
            after: async ({pickRecord}, next) => {
                if(typeof pickRecord.value === 'string') console.log(JSON.parse(pickRecord.value));
                else console.log(pickRecord.value);
                
                const nextStep = await Input.prompt('r: rename KV, b: back, e: end');
                if(nextStep === 'b'){
                    await next('pickRecord');
                }

                if(nextStep === 'r'){
                    const name: string = await Input.prompt("KV name");
                    const { kv } = input.localKvs.find(kv => kv.id === pickRecord.kvid)
                    await kv.set(['pd', 'meta', 'name'], name)
                    console.log('Name updated ✅')
                    await next('pickRecord');
                }

                if(nextStep === 'e'){
                    await next();
                }
            }
        },
        {
            type: PromptInput,
            name: "nextAction",
            message: 'r: reset, l: log latest, q: quit'
        }
    ]);
    //if(typeof output === 'string') console.log(Deno.inspect(JSON.parse(output.value), {colors: true, breakLength: Infinity, strAbbreviateSize: Infinity}));
    if(typeof output.value === 'string') console.log(JSON.parse(output.value));
    else console.log(output.value);
    ```

## chooseAction
When there is no `input.action` lined up, catch the user here so they can choose what to do next.
- not: /action
    ```ts
    input.actionCode = await Input.prompt('r: reset, l: log latest, d: drilldown, q: quit');
    ```

## consumeActionCode
Interpret the single character "actions" and line up the next function to step into.
- check: /actionCode
    ```ts
    const actionPointer = ({
        l: '/action/log',
        r: '/action/reset',
        d: '/action/drilldown',
        q: '/action/quit'
    })[input.actionCode]

    $p.set(input, '/action', {});
    $p.set(input,  actionPointer, true);
    $p.set(input, '/actionCode', false);
    ```

## reset
- check: /action/reset
    ```ts
    $p.set(input, '/action', false);
    clearInterval(input.interval);
    ```

## quit
- check: /action/quit
    ```ts
    clearInterval(input.interval);
    Deno.exit();
    ```
