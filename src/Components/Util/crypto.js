import CryptoJS from 'crypto-js';

export function encryptData(data) {
    return CryptoJS.AES.encrypt(data, process.env.NEXT_PUBLIC_ENCRYPTION_KEY).toString();
}

export function decryptData(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.NEXT_PUBLIC_ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}
