// src/utils/nanoid.ts
export function nanoid(size = 12) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < size; i++) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
}