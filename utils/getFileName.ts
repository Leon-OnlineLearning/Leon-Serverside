export default function getFileName(path: string) {
    const split = path.split("/");
    return split[split.length - 1];
}
