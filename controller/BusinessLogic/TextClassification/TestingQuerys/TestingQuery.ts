import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import getBaseURL from "@utils/getBaseURL";
import { ModelsFacade, ModelsFacadeImpl } from "../modelFacade";

// export default interface TestingQuery {
//     getKey(): string;
//     getValue(model : TextClassificationModel): any;
//     getAdditionalData(): any;
// }

export default abstract class TestingQuery {
    constructor(protected model: TextClassificationModel) {}
    async getCommonFields(): Promise<{
        modelId: string;
        prediction_model_path: string;
        dictionary_classes: any;
        relations: any;
    }> {
        const modelFacade: ModelsFacade = new ModelsFacadeImpl();
        const relations = await modelFacade.getRelations(this.model.id);
        let goodClasses = {};
        Object.keys(this.model.state.Classes).forEach((key) => {
            if (this.model.state.Classes[key] !== "testing") {
                goodClasses = {
                    ...goodClasses,
                    [key]: this.model.state.Classes[key],
                };
            }
        });
        return {
            modelId: this.model.id,
            prediction_model_path: `${getBaseURL()}${
                this.model.predictionModelPath
            }`,
            dictionary_classes: goodClasses,
            relations,
        };
    }
    abstract changeTestingState(state: TestRequestStatus): Promise<any>;
    abstract getSpecificFields(): Promise<any>;
    abstract storeTestResult(result: any): Promise<any>;
}
