import { Base32 } from "./base32.ts"

export namespace TOTP {
    export type Key = CryptoKey;

    export type Hash = "SHA-1" | "SHA-256" | "SHA-512";

    export async function generateKey(byteLength: number, hash: Hash = "SHA-1"): Promise<Key> {
        const raw = crypto.getRandomValues(new Uint8Array(byteLength));
        return importKey(Base32.encode(raw.buffer), hash);
    }

    export async function exportKey(key: Key) {
        return Base32.encode(await crypto.subtle.exportKey("raw", key));
    }

    export async function importKey(base32: string, hash: Hash = "SHA-1") {
        const raw = Base32.decode(base32);

        return crypto.subtle.importKey("raw", raw, { 
            name: "HMAC", hash: { name: hash }
        }, true, ["sign"]);
    }

    export function getTimeCounter(interval: number) {
        let step = BigInt(Math.floor(Date.now() / (interval * 1000)));

        let buffer = new ArrayBuffer(8),
            view = new DataView(buffer);

        view.setBigUint64(0, step);
        return buffer;
    }

    export async function HS(key: Key, counter: BufferSource) {
        return crypto.subtle.sign("HMAC", key, counter);    
    }

    export function DT(hs: ArrayBuffer) {
        let view = new DataView(hs),
            offset = view.getUint8(19) & 0xf;
        return view.getUint32(offset) & 0x7fffffff;
    }

    export interface HOTPOptions {
        digits?: number;
    }

    export async function getHOTP(key: Key, counter: ArrayBuffer, options: HOTPOptions = {}) {
        let digits = options.digits ?? 6,
            n = DT(await HS(key, counter));
        
        return ("000000" + (n % (10 ** digits))).slice(-digits);
    }

    export interface TOTPOptions extends HOTPOptions {
        interval?: number;
    }

    export async function getTOTP(key: Key, options: TOTPOptions = {}) {
        let interval = options.interval ?? 30;
        return getHOTP(key, TOTP.getTimeCounter(interval), options);
    }

    export async function *generateTOTP(key: Key, options: TOTPOptions = {}) {
        const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

        let interval = (options.interval ?? 30) * 1000;

        yield await getTOTP(key, options);
        await sleep(interval - (Date.now() % interval));

        while (true) {
            yield await getTOTP(key, options);
            await sleep(interval);
        }
    }

    export interface VerifyTOTPOptions extends TOTPOptions {
        forward?: number;
        backward?: number;
    }

    export async function verifyTOTP(key: Key, code: string, options: VerifyTOTPOptions = {}) {
        let forward = BigInt(options.forward ?? 1),
            backward = BigInt(options.backward ?? 1);

        const codes = new Array<string>();

        let counter = TOTP.getTimeCounter(options.interval ?? 30),
            view = new BigUint64Array(counter);

        view[0] -= backward;

        for (let i = 0n; i < (forward + backward + 1n); i++) {
            codes.push(await getHOTP(key, counter, options));
            view[0]++;
        }

        return codes.includes(code);
    }
}