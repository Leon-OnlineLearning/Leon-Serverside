import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";

export default interface TextClassificationFilesLogic {
    createFile(file: TextClassificationFile): Promise<TextClassificationFile>;
    linkFileToModel(
        fileId: string,
        modelId: string,
        fileRelation: FileType,
        className: string
    ): Promise<void>;
    getFileById(fileId: string): Promise<TextClassificationFile>;
    getFilesByName(fileName: string) : Promise<TextClassificationFile[]>;
}
