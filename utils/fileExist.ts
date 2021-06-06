import fs from "fs/promises";
export default async function fileExist(path: string) {
    try {
        await fs.access(path);
        return true;
    } catch (e) {
        return false;
    }
}
