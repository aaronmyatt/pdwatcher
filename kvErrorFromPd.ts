import localKv from "./.pd/lib/localKv/index.ts";

while(true) {
    await localKv.process();
}