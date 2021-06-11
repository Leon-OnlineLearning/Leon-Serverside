import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import Course, { TestRequestStatus } from "@models/Course";
import StudentsExams from "@models/JoinTables/StudentExam";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { getConnection, getManager, getRepository } from "typeorm";
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

async function setStateForCourseWide(
    state: TestRequestStatus,
    courseId: string
) {
    await getConnection()
        .createQueryBuilder()
        .update(Course)
        .set({ testingState: TestRequestStatus.PENDING })
        .where("id = :id", { id: courseId })
        .execute();
}

export class TestSentence extends TestingQuery {
    constructor(
        model: TextClassificationModel,
        private sentence: string,
        private courseId: string
    ) {
        super(model);
    }
    changeTestingState(state: TestRequestStatus): Promise<any> {
        return setStateForCourseWide(state, this.courseId);
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
    constructor(model: TextClassificationModel, private courseId: string) {
        super(model);
    }
    changeTestingState(state: TestRequestStatus): Promise<any> {
        return setStateForCourseWide(state, this.courseId);
    }
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

export class TestExamVideo extends TestingQuery {
    constructor(
        model: TextClassificationModel,
        private examId: string,
        private studentId: string
    ) {
        super(model);
    }
    async changeTestingState(state: TestRequestStatus): Promise<any> {
        // get student exam state
        const examLogic: ExamsLogic = new ExamsLogicImpl();
        const studentExam = await examLogic.getStudentExam(
            this.studentId,
            this.examId
        );
        // testing state into it
        studentExam.testingStatus = state;
        await getRepository(StudentsExams).save(studentExam);
    }
    storeTestResult(result: any): Promise<any> {
        const studentExamLogic: ExamsLogic = new ExamsLogicImpl();
        return studentExamLogic.storeExamTextClassificationResult(
            this.studentId,
            this.examId,
            result
        );
    }
    async getSpecificFields() {
        const examLogic: ExamsLogic = new ExamsLogicImpl();
        const [videoPath, videoId] = await examLogic.getExamVideoData(
            this.studentId,
            this.examId
        );

        return {
            exam_video_path: videoPath,
            // TODO change it to be the student exam id
            videoId: videoId,
        };
    }
}
