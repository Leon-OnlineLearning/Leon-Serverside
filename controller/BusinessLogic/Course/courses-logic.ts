import Course from "@models/Course";

export default interface CoursesLogic {
    createCourse(course: Course): Promise<Course>;
    deleteCourseById(courseId: string): Promise<void>;
    updateCourse(courseId: string, newData: Course): Promise<Course>;
    getCoursesById(courseId:string) : Promise<Course>;
    getCoursesByYear(year: number): Promise<Course[]>;
}
