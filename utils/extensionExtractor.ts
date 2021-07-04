export default function getExtension(fileName: string) {
    return "." + fileName.split(".").pop();
}
