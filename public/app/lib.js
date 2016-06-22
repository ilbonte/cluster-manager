export function generateUid() {
    return Math.random().toString(36).substring(2, 22);
}
