```ts
import objectSummary from "objectSummary"
import raw from '/cliActions/index.json' with { type: "json" };
input.obj = raw;
const output = await objectSummary.process(input)

if(output.errors){
    output.errors.map(err => {
        console.error(err.name)
        console.error(err.func)
        console.error(err.message)
        console.error(err.stack)
        console.error('---')
        console.error()
    })
} else {
    console.log(output.summary);
}
```
