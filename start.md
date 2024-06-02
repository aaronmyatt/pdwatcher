# Start
We want a small tool that can watch changes to local `Deno.Kv` instances. This will be heavily inspired by [kview](https://kview.deno.dev) but tailored specifically for observing `Deno.Kv` databases that are having Pipedown input/output written to. The idea here is to provide a utility that can enhance the developer experience for people working with Pipedown, increase visibility of a pipe's input/output state and significantly improve feedback loops.


## checkForFlags
Given a user looking for specific information
When a flag is provided
Then don't drop them into a loop
```ts
input.gotFlags = Object.entries(input.flags)    
    .filter(flag => (flag[0] !== '_' && flag[0] !== 'input'))
    .some(flag => flag[1]);
```


## cli
When run from the command line I don't want the program to exit after an action/flag is handled. So we'll drop it into a loop and rely on a `ctrl-c` signal exit.
- check: /mode/cli
- not: /gotFlags
- ```ts
    import cliActions from "cliActions"
    while(1){
        await cliActions.process(input)
    }
    ```

## outputOnce
- check: /gotFlags
    ```ts
    Object.assign(input, await cliActions.process(input))
    ```
