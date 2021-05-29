import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";
import ProfessorLogic from "../User/Professor/professors-logic";
import ProfessorLogicIml from "../User/Professor/professors-logic-impl";
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
}

export class ModelsFacadeImpl implements ModelsFacade {
    async uploadFile(
        files: any[],
        courseId: string,
        className: string,
        professorId: string,
        fileType: FileType,
        sessionId?: string
    ): Promise<UploadResult> {
        const tcLogic: TextClassificationFilesLogic = new FileLogicImpl();
        const requestedFiles = files;
        const modelLogic: ModelLogic = new ModelLogicImpl();
        let modelId = sessionId;

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
        const professorLogic: ProfessorLogic = new ProfessorLogicIml();
        professorLogic.setTextClassificationSessionId(professorId, modelId);
        return {
            success: true,
            sessionId: modelId,
        };
    }
}
