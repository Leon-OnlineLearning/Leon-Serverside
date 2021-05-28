import TextClassificationFile from "@models/TextClassification/TextClassificationFile";

export default interface TextClassificationFilesLogic {
    createRelateFile(
        file: TextClassificationFile,
    ): Promise<TextClassificationFile>;

    createNonRelatedFile(
        file: TextClassificationFile
    ): Promise<TextClassificationFile>;
}
