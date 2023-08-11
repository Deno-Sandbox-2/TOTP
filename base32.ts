export namespace Base32 {
    const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    function uint8ArrayToBase32(array: Uint8Array): string {
        let result = '';
        let bits = 0;
        let bitsCount = 0;

        for (let i = 0; i < array.length; i++) {
            bits = (bits << 8) | array[i];
            bitsCount += 8;

            while (bitsCount >= 5) {
                const index = (bits >>> (bitsCount - 5)) & 0x1F;
                result += BASE32_ALPHABET[index];
                bitsCount -= 5;
            }
        }

        if (bitsCount > 0) {
            const index = (bits << (5 - bitsCount)) & 0x1F;
            result += BASE32_ALPHABET[index];
        }

        return result;
    }

    function base32ToUint8Array(input: string): Uint8Array {
        const array = new Uint8Array(Math.ceil(input.length * 5 / 8));
        let index = 0;
        let bits = 0;
        let bitsCount = 0;

        for (const char of input) {
            const charIndex = BASE32_ALPHABET.indexOf(char);
            if (charIndex === -1) {
                throw new Error('Invalid base32 character: ' + char);
            }

            bits = (bits << 5) | charIndex;
            bitsCount += 5;

            while (bitsCount >= 8) {
                const byte = (bits >>> (bitsCount - 8)) & 0xFF;
                array[index++] = byte;
                bitsCount -= 8;
            }
        }

        return array;
    }

    export function encode(buffer: ArrayBuffer): string {
        const uint8Array = new Uint8Array(buffer);
        return uint8ArrayToBase32(uint8Array);
    }

    export function decode(string: string): ArrayBuffer {
        const uint8Array = base32ToUint8Array(string);
        return uint8Array.buffer;
    }
}