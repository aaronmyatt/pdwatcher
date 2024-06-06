# Main Loop

We are in the main loop of the app. On each loop we will check for flags and execute the appropriate action.

The loop may start with a `input.kvInfo` & `input.action` already provided from the last session.

```ts
import { ansi } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/ansi.ts";
```

## updateAction
```ts skip
if($p.get(globalThis, '/action/clear')){
    $p.set(input, '/action', false);
    $p.set(globalThis, '/action', false);
}
```

## noAction
- not: /action
    ```ts skip
    import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/select.ts";

    const choice = await Select.prompt({
        message: "What's next?",
        options: [
            { name: 'Pick a KV', value: '/action/k' },
            { name: 'Watch KV', value: '/action/w' },
            { name: 'Inspect KV', value: '/action/i' },
            { name: 'Exit', value: '/action/q' },
        ]
    })
    $p.set(input, choice, true);
    ```

## action
- check: /action
    ```ts
    console.log(ansi.cursorUp(2).cursorLeft.eraseDown(2).toString());
    console.log('esc: Back');
    ```

## Delegate actions!

### pickKvAction
- check: /action/k
    ```ts
    import pickKv from "pickKv"
    Object.assign(input, await pickKv.process(input));
    localStorage.setItem('kvInfo', JSON.stringify(input.kvInfo));
    $p.set(input, '/action', false);
    $p.set(input, '/action/w', true);
    ```

### watchKvAction
- check: /action/w
- and: /kvInfo
    ```ts
    import latestFromKv from "latestFromKv"
    Object.assign(input, await latestFromKv.process(input));
    await new Promise(resolve => setTimeout(resolve, 1000));
    ```

### inspectKvAction
- check: /action/i
- and: /kvInfo
    ```ts
    import inspectKv from "inspectKv"
    Object.assign(input, await inspectKv.process(input));
    await new Promise(resolve => setTimeout(resolve, 1000));
    ```

### exitAction
- check: /action/q
    ```ts
    Deno.exit();
    ```
