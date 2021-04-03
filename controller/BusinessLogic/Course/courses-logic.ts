import Course from "@models/Course";
import Lecture from "@models/Events/Lecture";
import { type } from "os";


export default interface CoursesLogic {
    getLecturesForCourse(courseId: string): any;
    addLectureToCourse(courseId: string, lectureId: any): Promise<void>;
    createCourse(course: Course): Promise<Course>;
    deleteCourseById(courseId: string): Promise<void>;
    updateCourse(courseId: string, newData: Course): Promise<Course>;
    getCoursesById(courseId: string): Promise<Course>;
    getCoursesByYear(year: number): Promise<Course[]>;
    getLecturesStatistics(courseId: string): Promise<{lectureTitle:string, count: number}[]>;
}
