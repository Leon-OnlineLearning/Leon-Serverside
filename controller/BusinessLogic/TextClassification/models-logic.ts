import TextClassificationModel from "@models/TextClassification/TextClassificationModel";

export default interface ModelLogic {
    addModelInCourse(
        model: TextClassificationModel,
        courseId: string
    ): Promise<TextClassificationModel>;
    getModelById(modeId: string): Promise<TextClassificationModel>;
    getAllModels(): Promise<TextClassificationModel[]>;
    receiveModelFiles(
        modelId: string,
        zipFile: any
    ): Promise<TextClassificationModel>;
    createSubModel(modelId: string): Promise<TextClassificationModel>;
    getAllModelsByCourseId(
        courseId: string
    ): Promise<TextClassificationModel[]>;
    isSuperModel(modelId: string): Promise<boolean>;
    getSuperModel(
        modelId: string
    ): Promise<TextClassificationModel | undefined>;
    getTheLatestModel(
        courseId: string
    ): Promise<TextClassificationModel | undefined>;
}
