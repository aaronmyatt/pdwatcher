# Start Over

## startWithLog
```ts
$p.set(input, '/action/log', true);
```

## theLoop
```ts
import { tty } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/tty.ts";

// tty
    // .cursorHide
    // .cursorTo(0, 0)
    // .eraseScreen();

while(true){
    import mainLoop from "mainLoop"
    Object.assign(input, await mainLoop.process(input));
    if(input.errors){
        console.log(input.errors);
        Deno.exit();
    }
}
```
