const crypto = require('crypto').webcrypto;

export function replace(value: string, searchValue: string, replaceValue: string): string {
    return value.replace(searchValue, replaceValue);
}

export function encodeFormData(data: any): string {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');
}

export function base64Unicode(buffer: Iterable<number> | ArrayBuffer) {
    /*\
    |*|
    |*|  Base64 / binary data / UTF-8 strings utilities (#1)
    |*|
    |*|  https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
    |*|
    |*|  Author: madmurphy
    |*|
    \*/
    const uint6ToB64 = function(nUint6: number) {

        return nUint6 < 26 ?
            nUint6 + 65 :
            nUint6 < 52 ?
                nUint6 + 71 :
                nUint6 < 62 ?
                    nUint6 - 4 :
                    nUint6 === 62 ?
                        43 :
                        nUint6 === 63 ?
                            47 :
                            65;

    }
    const base64EncArr = function(aBytes: string | any[] | Uint8Array) {

        let eqLen = (3 - (aBytes.length % 3)) % 3,
            sB64Enc = "";

        for (let nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            /* Uncomment the following line in order to split the output in lines 76-character long: */
            /*
            if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
            */
            nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || aBytes.length - nIdx === 1) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }

        return eqLen === 0 ?
            sB64Enc :
            sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==");
    };
    // @ts-ignore
    let encodedArr =  base64EncArr(new Uint8Array(buffer));
    // manually finishing up the url encoding fo the encodedArr
    encodedArr = encodedArr.replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return encodedArr;
}

export function gen128x8bitNonce(): string {
    // account for the overhead of going to base64
    var bytes = Math.floor(128  / 1.37);
    var array = new Uint8Array(bytes); //
    // note: there was a bug where getRandomValues was assumed
    // to modify the reference to the array and not return
    // a value
    array = crypto.getRandomValues(array);
    return base64Unicode(array.buffer);
}

export async function digestVerifier(vString: string | undefined): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const verifier = encoder.encode(vString);
    const hash = await crypto.subtle.digest('SHA-256', verifier);
    return hash;
}

