import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import TextClassificationModelFile from "@models/TextClassification/TextClassificationModelFile";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";
import axios from "axios";
import { getManager, getRepository } from "typeorm";
import ProfessorLogic from "../User/Professor/professors-logic";
import ProfessorLogicImpl from "../User/Professor/professors-logic-impl";
import FileLogicImpl from "./file-logic-impl";
import TextClassificationFilesLogic from "./files-logic";
import ModelLogic from "./models-logic";
import ModelLogicImpl from "./models-logic-impl";

export interface UploadResult {
    success: boolean;
    sessionId: string;
}

export interface ModelsFacade {
    uploadFile(
        files: any[],
        courseId: string,
        className: string,
        professorId: string,
        fileType: FileType,
        sessionId?: string
    ): Promise<UploadResult>;
    addExistingFiles(
        filesIds: string[],
        modelId: string,
        fileType: FileType,
        className: string
    ): Promise<void>;
    getFileInfoReport(modelId: string): Promise<any>;
    getFileInfo(modelId: string, fileRelation: FileType): Promise<any>;
    sendModelFiles(modelId: string, to: string): Promise<void>;
}

export class ModelsFacadeImpl implements ModelsFacade {
    async sendModelFiles(modelId: string, to: string): Promise<void> {
        const report = await this.getFileInfoReport(modelId);
        console.log("report is", report);
        await axios.post(to, report);
    }

    async getFileInfo(modelId: string, fileRelation: FileType): Promise<any[]> {
        // for some reason typeorm can't recognize that text_classification_model
        // has model_id or (modelId) column so i had to type a raw sql 😥
        const res = await getManager().query(
            `
        select * from text_classification_model_file
        inner join text_classification_model on text_classification_model_file."model_id" = text_classification_model.id
        inner join text_classification_file on text_classification_model_file."file_id" = text_classification_file.id
        where file_relation = $1
        and model_id = $2;
        `,
            [fileRelation, modelId]
        );
        return res;
    }

    async getFileInfoReport(modelId: string): Promise<any> {
        const tcmfsRelated = await this.getFileInfo(modelId, FileType.RELATED);
        const tcmfsNonRelated = await this.getFileInfo(
            modelId,
            FileType.NON_RELATED
        );
        const tcmfsTest = await this.getFileInfo(modelId, FileType.TEST);
        return {
            related: tcmfsRelated,
            nonRelated: tcmfsNonRelated,
            test: tcmfsTest,
        };
    }
    async addExistingFiles(
        filesIds: string[],
        modelId: string,
        fileType: FileType,
        className: string
    ): Promise<void> {
        const tcLogic: TextClassificationFilesLogic = new FileLogicImpl();
        for (const id of filesIds) {
            await tcLogic.linkFileToModel(id, modelId, fileType, className);
        }
    }

    async uploadFile(
        files: any[],
        courseId: string,
        className: string,
        professorId: string,
        fileType: FileType
    ): Promise<UploadResult> {
        const tcLogic: TextClassificationFilesLogic = new FileLogicImpl();
        const requestedFiles = files;
        const modelLogic: ModelLogic = new ModelLogicImpl();
        const professorLogic: ProfessorLogic = new ProfessorLogicImpl();

        // store the session id (mode id) in the database
        let modelId = await professorLogic.getTextClassificationSessionId(
            professorId
        );

        if (!modelId) {
            const _model = new TextClassificationModel();
            _model.name = `${courseId}-model-${Date.now()}`;
            const model = await modelLogic.addModelInCourse(_model, courseId);
            modelId = model.id;
        }

        console.log("requestedFiles ", requestedFiles);

        for (
            let fileIndex = 0;
            fileIndex < requestedFiles.length;
            fileIndex++
        ) {
            const textClassifierFile = new TextClassificationFile();
            textClassifierFile.filePath = requestedFiles[fileIndex].path;
            const _file = await tcLogic.createFile(textClassifierFile);
            tcLogic.linkFileToModel(_file.id, modelId, fileType, className);
        }
        professorLogic.setTextClassificationSessionId(professorId, modelId);
        return {
            success: true,
            sessionId: modelId,
        };
    }
}
