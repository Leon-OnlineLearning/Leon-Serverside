import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import TextClassificationModelFile from "@models/TextClassification/TextClassificationModelFile";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";
import UserInputError from "@services/utils/UserInputError";
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

// model logic that is outside the scope of the DTOs
// for example it will handle requests to other servers
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
    sendModelFiles(modelId: string, to: string): Promise<any>;
    getFileInfoForTraining(modelId: string): Promise<any>;
    requestRaise(modelId: string, to: string): Promise<any>;
    requestTest(modelId: string): Promise<any>;
}

export class ModelsFacadeImpl implements ModelsFacade {
    async requestTest(modelId: string): Promise<any> {
        // TODO implement request test
        // - [x] get the test file path
        // - [x] send the test file
        // - [x] and the prediction file name it will stored in the ml server
        // - [] you will receive the class names then check if these classes are related
        const req: any = {};
        const model = await getRepository(TextClassificationModel).findOne(
            modelId
        );
        if (!model) throw new UserInputError("invalid model id");
        req["testFile"] = this.getFilePathsByClassName("testing");
        req["prediction_model"] = model.predictionModelPath;
        // or not
    }

    async requestRaise(modelId: string, to: string): Promise<any> {
        const modelLogic: ModelLogic = new ModelLogicImpl();
        const subModel = modelLogic.createSubModel(modelId);
        // TODO see what is the format for test
        console.log("the submodule:", subModel);
        return axios
            .post(to, subModel)
            .then((res) => {
                console.log("raise result", res.data);
                return res.data;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    async getFilePathsByClassName(className: string) {
        const filesQuery = `
            select f."filePath" from text_classification_file as f 
            inner join text_classification_model_file as t on f.id = t.file_id
            where t."className" = $1;
        `;
        const paths = await getManager().query(filesQuery, [className]);
        return paths;
    }

    async getFileInfoForTraining(modelId: string): Promise<any> {
        // get all class names
        const classNamesQuery = `
            select distinct "className" from text_classification_model_file where model_id = $1;
        `;
        const classNames: [
            { className: string }
        ] = await getManager().query(classNamesQuery, [modelId]);
        console.log("class names", classNames);
        // get all files that has the exact class name
        let res: any = { modelId, dictionary_classes: {} };
        for (let className of classNames) {
            const paths = await this.getFilePathsByClassName(
                className.className
            );
            res["dictionary_classes"][className.className] = paths.map(
                // TODO check if there is a better (dynamic) way to get the base url
                (path: { filePath: string }) => {
                    console.log("path is", path);
                    return (
                        `${
                            process.env["BASE_URL"] ??
                            "https://localhost/backend/"
                        }` + path.filePath
                    );
                }
            );
        }
        console.log("result is", res);
        return res;
    }

    async sendModelFiles(modelId: string, to: string): Promise<any> {
        // const report = await this.getFileInfoReport(modelId);
        const res = await this.getFileInfoForTraining(modelId);
        console.log("report is", res);
        return axios
            .post(to, res, {
                headers: {
                    Accept: "application/zip",
                },
                responseType: "arraybuffer",
            })
            .then((res) => res.data);
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
        requestedFiles: any[],
        courseId: string,
        className: string,
        professorId: string,
        fileType: FileType
    ): Promise<UploadResult> {
        const tcLogic: TextClassificationFilesLogic = new FileLogicImpl();
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
