import TextClassificationFile from "@models/TextClassification/TextClassificationFile";

export default interface TextClassificationFilesLogic {
    createFile(file: TextClassificationFile): Promise<TextClassificationFile>;
    linkFileToModel(
        fileId: string,
        modelId: string,
        related: boolean,
        className: string
    ): Promise<void>;
    getFileById(fileId: string): Promise<TextClassificationFile>;
    getFilesByName(fileName: string) : Promise<TextClassificationFile[]>;
}
