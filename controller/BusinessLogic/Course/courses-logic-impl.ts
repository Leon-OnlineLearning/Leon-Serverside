import Course from "@models/Course";
import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import CoursesLogic from "./courses-logic";
export default class CourseLogicImpl implements CoursesLogic {
    async getAllCourses(): Promise<Course[]> {
        return getRepository(Course)
            .createQueryBuilder("course")
            .select("course.id", "id")
            .addSelect("course.name", "name")
            .addSelect("course.departmentId", "department")
            .addSelect("course.year", "year")
            .getRawMany();
    }

    async getAllExamsByCourse(courseId: string) {
        const course = await getRepository(Course).findOne(courseId);
        if (!course) throw new UserInputError("Invalid course id");
        return await course.exams;
    }

    async addExamToCourse(courseId: string, examId: any) {
        const courseRepo = getRepository(Course);
        const course = await courseRepo.findOne(courseId);
        if (!course) throw new UserInputError("Invalid course id");
        const exam = await getRepository(Exam).findOne(examId);
        if (!exam) throw new UserInputError("Invalid exam id");
        (await course.exams).push(exam);
        courseRepo.save(course);
    }

    async getLecturesForCourse(courseId: string) {
        const course = await getRepository(Course).findOne(courseId, {
            relations: ["lectures"],
        });
        if (!course) {
            throw new UserInputError("invalid course id");
        }
        return course.lectures;
    }

    async addLectureToCourse(courseId: string, lectureId: any) {
        const course = await getRepository(Course).findOne(courseId);
        if (!course) throw new UserInputError("Invalid course id");
        const lecture = await getRepository(Lecture).findOne(lectureId);
        if (!lecture) throw new UserInputError("Invalid lecture id");
        (await course.lectures).push(lecture);
        getRepository(Course).save(course);
    }

    async getLecturesStatistics(
        courseId: string
    ): Promise<{ lectureTitle: string; count: number }[]> {
        const course = await getRepository(Course).findOne(courseId);
        if (!course) {
            throw new UserInputError("Invalid course id");
        }
        const lectures: Lecture[] = await course.lectures;
        if (!lectures) {
            throw new UserInputError("no lectures to be shown");
        }
        let res: any = {};
        for (let lecture of lectures) {
            let students = (await lecture.studentLectureAttendance).map(
                (sla) => sla.student
            );
            res[lecture.title] = students.length;
        }
        return res;
    }

    async createCourse(course: Course): Promise<Course> {
        const department = getRepository(Department).findOne(course.department);
        return await getRepository(Course).save(course);
    }

    async deleteCourseById(courseId: string): Promise<void> {
        await getRepository(Course).delete(courseId);
        return;
    }
    async updateCourse(courseId: string, newData: Course): Promise<Course> {
        const { id, ...newDataWithoutId } = newData; // Hack for upsert and update by id yet return the new object
        return await getRepository(Course).save({
            id: courseId,
            ...newDataWithoutId,
        });
    }
    async getCoursesById(courseId: string): Promise<Course> {
        const course = await getRepository(Course).findOne(courseId);
        if (course) return course;
        else throw new UserInputError("Invalid course id");
    }

    async getCoursesByYear(year: number): Promise<Course[]> {
        return await getRepository(Course).find({
            where: {
                year: year,
            },
        });
    }
}
