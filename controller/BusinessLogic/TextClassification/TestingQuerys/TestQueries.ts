import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { ModelsFacade, ModelsFacadeImpl } from "../modelFacade";
import TestingQuery from "./TestingQuery";

export class TestSentence extends TestingQuery {
    constructor(model: TextClassificationModel, private sentence: string) {
        super(model);
    }
    getSpecificFields(): Promise<any> {
        return Promise.resolve({
            test_sent: this.sentence,
        });
    }
}

export class TestFiles extends TestingQuery {
    async getSpecificFields() {
        return await new ModelsFacadeImpl().getTestingFiles(this.model);
    }
}

export class TestVideo extends TestingQuery {
    constructor(
        model: TextClassificationModel,
        private videoId: string,
        private videoPath: string
    ) {
        super(model);
    }
    getSpecificFields() {
        return Promise.resolve({
            exam_video_path: this.videoPath,
            videoId: this.videoId,
        });
    }
}
