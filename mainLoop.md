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

    input.actionCode = await Input.prompt({message: 'r: reset, l: log latest, d: drilldown, q: quit', minLength: 1, maxLength: 1});
    clearInterval(input.interval);
    ```

## drilldown and explore
- check: /action/drilldown
    ```ts
    import drilldown from "drilldown"
    const output = await drilldown.process(input)
    console.log(output.errors)
    ```

## chooseAction
When there is no `input.action` lined up, catch the user here so they can choose what to do next.
- not: /action
    ```ts
    input.actionCode = await Input.prompt({message: 'r: reset, l: log latest, d: drilldown, q: quit', minLength: 1, maxLength: 1});
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
    $p.set(input, '/actionCode', false);
    $p.set(input, actionPointer, true);
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
