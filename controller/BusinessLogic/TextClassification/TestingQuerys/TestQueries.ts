import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import Course from "@models/Course";
import StudentsExamData from "@models/JoinTables/StudentExam";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { getConnection, getManager, getRepository } from "typeorm";
import { ModelsFacade, ModelsFacadeImpl } from "../modelFacade";
import TestingQuery from "./TestingQuery";

export class TestSentence extends TestingQuery {
    courseLogic: CourseLogicImpl = new CourseLogicImpl();
    constructor(
        model: TextClassificationModel,
        private sentence: string,
        private courseId: string
    ) {
        super(model);
    }
    changeTestingState(state: TestRequestStatus): Promise<any> {
        return this.courseLogic.setStateForCourseWide(state, this.courseId);
    }
    async getSpecificFields(): Promise<any> {
        return Promise.resolve({
            test_sent: this.sentence,
        });
    }
    async storeTestResult(data: any): Promise<any> {
        await this.courseLogic.storeTestSentenceResultInCourse(this.model.id, {
            ...data,
            sentence: this.sentence,
        });
    }
}

export class TestFiles extends TestingQuery {
    courseLogic: CourseLogicImpl = new CourseLogicImpl();
    constructor(model: TextClassificationModel, private courseId: string) {
        super(model);
    }
    changeTestingState(state: TestRequestStatus): Promise<any> {
        return this.courseLogic.setStateForCourseWide(state, this.courseId);
    }
    async storeTestResult(data: any): Promise<any> {
        await this.courseLogic.storeTestFileResultInCourse(this.model.id, data);
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
        await getRepository(StudentsExamData).save(studentExam);
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
