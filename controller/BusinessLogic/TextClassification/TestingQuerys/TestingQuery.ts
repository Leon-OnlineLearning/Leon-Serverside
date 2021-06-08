import TextClassificationModel from "@models/TextClassification/TextClassificationModel";

// export default interface TestingQuery {
//     getKey(): string;
//     getValue(model : TextClassificationModel): any;
//     getAdditionalData(): any;
// }

export default abstract class TestingQuery {
    constructor(protected model: TextClassificationModel) {}
    getCommonFields(): {
        modelId: string;
        prediction_model_path: string;
        dictionary_classes: any;
    } {
        return {
            modelId: this.model.id,
            prediction_model_path: this.model.predictionModelPath,
            dictionary_classes: this.model.state.Classes,
        };
    }
    abstract getSpecificFields(): Promise<any>;
}
