import TextClassificationModel from "@models/TextClassification/TextClassificationModel";

export default interface ModelLogic {
    addModelInCourse(
        model: TextClassificationModel,
        courseId: string
    ): Promise<TextClassificationModel>;
    getModelById(modeId: string): Promise<TextClassificationModel>;
    getAllModels(): Promise<TextClassificationModel[]>;
    receiveModelFiles(modelId: string, zipFile: any): Promise<TextClassificationModel>;
    createSubModel(modelId: string) : Promise<TextClassificationModel>;
}
