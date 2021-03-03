import Course from "@models/Course";
import { getRepository } from "typeorm";
import CoursesLogic from "./courses-logic"
export default class CourseLogicImpl implements CoursesLogic {
    async createCourse(course: Course): Promise<Course> {
        return await getRepository(Course).save(course);
    }

    async deleteCourseById(courseId: string): Promise<void> {
        await getRepository(Course).delete(courseId);
        return
    }
    async updateCourse(courseId: string, newData: Course): Promise<Course> {
        const { id, ...newDataWithoutId } = newData; // Hack for upsert and update by id yet return the new object
        return await getRepository(Course).save({
            id: courseId,
            ...newDataWithoutId
        })
    }
    async getCoursesById(courseId: string): Promise<Course> {
        const course = await getRepository(Course).findOne(courseId);
        if (course)
            return course;
        else
            throw new Error("Invalid course id");

    }

    async getCoursesByYear(year: number): Promise<Course[]> {
        return await getRepository(Course).find(
            {
                where: {
                    year: year
                }
            }
        )
    }

}