import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { type } from "os";

export type TestResultType = "Sentence" | "File";

export default interface CoursesLogic {
    getAllCourses(): Promise<Course[]>;
    getAllExamsByCourse(courseId: string): Promise<Exam[]>;
    addExamToCourse(courseId: string, examId: any): Promise<void>;
    getLecturesForCourse(courseId: string): any;
    addLectureToCourse(courseId: string, lectureId: any): Promise<void>;
    createCourse(course: Course): Promise<Course>;
    deleteCourseById(courseId: string): Promise<void>;
    updateCourse(courseId: string, newData: Course): Promise<Course>;
    getCoursesById(courseId: string): Promise<Course>;
    getCoursesByYear(year: number): Promise<Course[]>;
    getCourseByLecture(lectureId: string): Promise<Course>;
    getLecturesStatistics(
        courseId: string
    ): Promise<{ lectureTitle: string; count: number }[]>;
    getAllTextClassificationModels(courseId: string): Promise<any>;
    getLastTestResult(courseId: string, resultType: TestResultType): Promise<any>;
    getCourseAssociatedToModel(modelId: string): Promise<Course>;
    storeTestFileResultInCourse(modelId: string, data: any): Promise<void>;
    storeTestSentenceResultInCourse(modelId: string, data: any): Promise<void>;
    setStateForCourseWide(
        state: TestRequestStatus,
        courseId: string
    ): Promise<void>;
	getLastTestSentenceResult(courseId: string): Promise<any>;
	getLastTestFileResult(courseId: string): Promise<any>;
}
