import Course from "@models/Course";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { getManager, getRepository } from "typeorm";
import { ModelsFacade, ModelsFacadeImpl } from "../modelFacade";
import TestingQuery from "./TestingQuery";

async function storeResultInCourse(modelId: string, data: any) {
    const { courseId } = await getManager().query(
        `select "courseId" from text_classification_model
            where id = $1 
           `,
        [modelId]
    );
    const course = await getRepository(Course).findOne(courseId);
    if (!course) throw new Error("Invalid model/course state");
    course.lastTestResults = data;
    await getRepository(Course)
        .save(course)
        .catch((err) => console.error(err));
}

export class TestSentence extends TestingQuery {
    constructor(model: TextClassificationModel, private sentence: string) {
        super(model);
    }
    async getSpecificFields(): Promise<any> {
        return Promise.resolve({
            test_sent: this.sentence,
        });
    }
    async storeTestResult(data: any): Promise<any> {
        await storeResultInCourse(this.model.id, data);
    }
}

export class TestFiles extends TestingQuery {
    async storeTestResult(data: any): Promise<any> {
        await storeResultInCourse(this.model.id, data);
    }
    async getSpecificFields() {
        return {
            test_files_dictionary: await new ModelsFacadeImpl().getTestingFiles(
                this.model
            ),
        };
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
    storeTestResult(result: any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getSpecificFields() {
        return Promise.resolve({
            exam_video_path: this.videoPath,
            videoId: this.videoId,
        });
    }
}
