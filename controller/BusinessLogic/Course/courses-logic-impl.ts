import Course from "@models/Course";
import Lecture from "@models/Events/Lecture";
import { getRepository } from "typeorm";
import CoursesLogic from "./courses-logic"
export default class CourseLogicImpl implements CoursesLogic {
    async getLecturesStatistics(courseId: string): Promise<{ lectureTitle: string, count: number }[]> {
        const course = await getRepository(Course).findOne(courseId);
        if (!course) {
            throw new Error("Invalid course id");
        }
        const lectures: Lecture[] = await course?.lectures
        if (!lectures) {
            throw new Error("no lectures to be shown")
        }

        let res: { lectureTitle: string, count: number }[] = [];

        lectures.forEach(async lecture => {
            let students = await lecture.students
            res.push({lectureTitle: lecture.title, count: students.length})
        });

        return res;
    }
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