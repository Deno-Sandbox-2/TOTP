import { TOTP } from "./totp.ts";

// Generate random key
const key = await TOTP.generateKey(20);

// Get TOTP code
const code = await TOTP.getTOTP(key, {
    interval: 30,
    digits: 6 // you can change that, but default is 6 and it's recommended !
})

console.log(code);

// Verify TOTP code in range [-backward, forward]
console.log(await TOTP.verifyTOTP(key, code, {
    interval: 30,
    digits: 6,
    forward: 2,
    backward: 2
}));

// Generate another key, but with SHA-512
const key2 = await TOTP.generateKey(64, "SHA-512");

// Get code at every interval
for await (const code of TOTP.generateTOTP(key2, { digits: 10, interval: 5 })) { // 10 digits / 5 seconds -> is hardcore to copy/paste in 30 sec :)
    console.log(code);
}