import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { type } from "os";

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
}
