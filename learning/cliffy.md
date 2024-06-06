# Learning Cliffy 

## Present data as tables
- flags: /table
    ```ts
    import { Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";

    const table: Table = Table.from([
    ["Baxter Herman", "Oct 1, 2020", "Harderwijk", "Slovenia"],
    ["Jescie Wolfe", "Dec 4, 2020", "Alto Hospicio", "Japan"],
    ["Allegra Cleveland", "Apr 16, 2020", "Avernas-le-Bauduin", "Samoa"],
    ]);

    table.push(["Aretha Gamble", "Feb 22, 2021", "Honolulu", "Georgia"]);
    table.sort();
    table.render();
    ```

## Prompt the user to select an option
- flags: /select
    ```ts
    import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/select.ts";

    const color: string = await Select.prompt({
    message: "Pick a color",
    options: [
        { name: "Red", value: "#ff0000" },
        { name: "Green", value: "#00ff00", disabled: true },
        { name: "Blue", value: "#0000ff" },
        Select.separator("--------"),
        { name: "White", value: "#ffffff" },
        { name: "Black", value: "#000000" },
    ],
    });
    ```

## Select prompts can be arbitrarily deep
Doesn't fits what I need though. It only returns the choice from the nested option. So it can only be used to get a specific granular choice from within the child, it doesn't "remember" each of the choices.

So, if I want that, I suppose I will need to have sequential selects.
- flags: /selectchild
    ```ts
    input.color = await Select.prompt({
    message: "Pick a color",
    options: [
            { name: "Red", value: "#ff0000" },
            { name: "Green", value: "#00ff00", disabled: true },
            { name: "Blue", value: "#0000ff" },
            Select.separator("--------"),
            { name: "White", value: "#ffffff" },
            { name: "Black", value: "#000000" },
        ].map(color => {
            $p.set(color, '/options', [
                "Fave",
                "Not Fave"
            ])
            return color;
        })
    });
    ```

## keypresses
Key press events can either be waited for async, streamed or listened to, very handy!
- check: /press
- flags: /press
- ```ts
    import { keypress, KeyPressEvent } from "https://deno.land/x/cliffy@v1.0.0-rc.4/keypress/mod.ts";

    console.log('Press any key: ')
    const event: KeyPressEvent = await keypress();

    console.log(
    "type: %s, key: %s, ctrl: %s, meta: %s, shift: %s, alt: %s, repeat: %s",
    event.type,
    event.key,
    event.ctrlKey,
    event.metaKey,
    event.shiftKey,
    event.altKey,
    event.repeat)
    ```

## Show an image
Once I changed the image to a working url it worked well in iTerm. Tmux didn't play nicely though. There's probably some config required for tmux..
- flags: /image
- ```ts
    import { cursorTo, eraseDown, image, link } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/ansi_escapes.ts";

    const response = await fetch("https://picsum.photos/200");
    const imageBuffer: ArrayBuffer = await response.arrayBuffer();

    console.log(
    cursorTo(0, 0) +
        eraseDown() +
        image(imageBuffer, {
        width: 29,
        preserveAspectRatio: true,
        }) +
        "\n          " +
        link("Deno Land", "https://deno.land") +
        "\n",
    );
    ```
