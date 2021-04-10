import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import { type } from "os";


export default interface CoursesLogic {
    getAllExamsByCourse(courseId: string): Promise<Exam[]>;
    addExamToCourse(courseId: string, examId: any): Promise<void>;
    getLecturesForCourse(courseId: string): any;
    addLectureToCourse(courseId: string, lectureId: any): Promise<void>;
    createCourse(course: Course): Promise<Course>;
    deleteCourseById(courseId: string): Promise<void>;
    updateCourse(courseId: string, newData: Course): Promise<Course>;
    getCoursesById(courseId: string): Promise<Course>;
    getCoursesByYear(year: number): Promise<Course[]>;
    getLecturesStatistics(courseId: string): Promise<{ lectureTitle: string, count: number }[]>;
}
