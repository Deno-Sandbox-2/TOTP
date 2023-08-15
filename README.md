# TOTP
Generate totp  with deno

see `./test.ts` for an example ! [click here](./test.ts)

# Test
```ts
import { TOTP } from "./totp.ts";

const key = await TOTP.importKey("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");

console.log(await TOTP.getTOTP(key, 60, 10));

for await (const code of TOTP.generateTOTP(key, 30, 6)) {
    console.log(code);
}
```

# problem ?
open an issue [here](https://github.com/Deno-Sandbox-2/TOTP/issues)
