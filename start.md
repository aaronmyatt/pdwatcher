# Start CLI

## startWithLog
Rather than requiring the user to choose what "action" they want to perform immediately, we will assume they are here to see Pipeodown/Deno.Kv outputs. So we initialise with this action and drop them into a loop of [[fetchAndTrackLatest]]
```ts
$p.set(input, '/action/log', true);
```

## clearScreen
CLI apps feel a little more elegant when they clear screen and present themselves.
```ts
import { tty } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/tty.ts";

tty
    .cursorHide
    .cursorTo(0, 0)
    .eraseScreen();
```

## theLoop
 Drop the user into an "action" loop and listen for their key strokes: [[mainLoop]]
```ts


while(true){
    import mainLoop from "mainLoop"
    Object.assign(input, await mainLoop.process(input));
    if(input.errors){
        console.log(input.errors);
        Deno.exit();
    }
}
```



[//begin]: # "Autogenerated link references for markdown compatibility"
[fetchAndTrackLatest]: fetchAndTrackLatest.md "outputLatestFromAllKvStores"
[mainLoop]: mainLoop.md "mainLoop"
[//end]: # "Autogenerated link references"