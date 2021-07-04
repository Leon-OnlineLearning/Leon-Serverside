import { promises } from "fs";
const access = promises.access;

export default async function fileExist(path: string) {
    try {
        await access(path);
        return true;
    } catch (e) {
        return false;
    }
}
