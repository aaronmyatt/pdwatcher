# Drilldown
Explore different pipe outputs in more detail

```ts
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/input.ts";
import { Select, prompt } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";
```
    
## flattenHistory
`input.history` is a namespaced object holding records from each Deno.Kv on the system. We need to extract these records, `formatRecord` them into single line entries and then flatten the whole lot into a single blob.
```ts
input.options = Object.entries(input.history).map(([key, values]) => {
        const { name } = input.localKvs.find(kv => kv.id === key)
        return values.map(record => {
            return {
                name: input.formatRecord(name || key, record),
                value: {
                    kvid: key,
                    ...record
                }
            }
        })
    }).flat()
```

## Select an output
Here we use the delightful [Cliffy](https://cliffy.io/docs) to present the options, formatted above, in a neat windowed list that can be searched and navigated with the keyboard.

Cliffy let's you create [dynamic prompts](https://cliffy.io/docs@v1.0.0-rc.4/prompt/dynamic-prompts)! The `after:` key callback catches the users choice, outputs it and then let's the user either:

| select again `b`
| rename the KV instance `r`
| end the select session `e`

```ts
input.selection = await prompt([
    { 
        message: `Pick from ${input.options.length} blob${input.options.length>0&&'s'} to drill down into:`, 
        search: true,
        name: "pickRecord",
        options: input.options,
        type: Select,
        after: async ({pickRecord}, next) => {
            if(typeof pickRecord.value === 'string') console.log(JSON.parse(pickRecord.value));
            else console.log(pickRecord.value);
            
            const nextStep = await Input.prompt({message: 'r: rename KV, b: back, e: end', minLength: 1, maxLength: 1});
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
    }
]);
```

## Log Selection
```ts
if(typeof input.selection.value === 'string') console.log(JSON.parse(input.selection.value));
else console.log(input.selection.value);
```

## nextAction
```ts
input.actionCode = await Input.prompt({message: 'r: reset, l: log latest, d: drilldown, q: quit', minLength: 1, maxLength: 1});
```
