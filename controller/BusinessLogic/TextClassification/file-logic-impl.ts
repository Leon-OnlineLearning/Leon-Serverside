import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import TextClassificationFilesLogic from "./files-logic";

export default class FileLogicImpl implements TextClassificationFilesLogic {
    createRelateFile(
        file: TextClassificationFile
    ): Promise<TextClassificationFile> {
        throw new Error("Method not implemented.");
    }
    createNonRelatedFile(
        file: TextClassificationFile
    ): Promise<TextClassificationFile> {
        throw new Error("Method not implemented.");
    }
}
