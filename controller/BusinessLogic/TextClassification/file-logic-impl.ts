import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import TextClassificationModelFile from "@models/TextClassification/TextClassificationModelFile";
import UserInputError from "@services/utils/UserInputError";
import { getRepository, Like } from "typeorm";
import TextClassificationFilesLogic from "./files-logic";
import ModelLogic from "./models-logic";
import ModelLogicImpl from "./models-logic-impl";

export default class FileLogicImpl implements TextClassificationFilesLogic {
    async getFilesByName(fileName: string): Promise<TextClassificationFile[]> {
        const files = await getRepository(TextClassificationFile).find({
            filePath: Like(`%${fileName.toLowerCase()}%`)
        })
        return files;
    }
    async getFileById(fileId: string): Promise<TextClassificationFile> {
        const file = await getRepository(TextClassificationFile).findOne(
            fileId
        );
        if (!file) throw new UserInputError("invalid file id");
        return file;
    }

    async createFile(
        file: TextClassificationFile
    ): Promise<TextClassificationFile> {
        file.filePath = file.filePath.toLowerCase()
        const res = await getRepository(TextClassificationFile).save(file);
        return res;
    }

    async linkFileToModel(
        fileId: string,
        modelId: string,
        related: boolean,
        className: string
    ): Promise<any> {
        // check if model is correct
        const modelLogic: ModelLogic = new ModelLogicImpl();
        const model = await modelLogic.getModelById(modelId);
        // check if file is correct
        const file = await this.getFileById(fileId);
        // TODO IMPORTANT link model with file
        const _modelFile = new TextClassificationModelFile();
        _modelFile.className = className;
        _modelFile.file = file;
        _modelFile.model = model;
        _modelFile.className = className;
        await getRepository(TextClassificationModelFile).save(_modelFile)
    }
}
