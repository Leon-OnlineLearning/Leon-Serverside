import Course from "@models/Course";
import Department from "@models/Department";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import TestRequestStatus from "@models/TestRequest/testRequestStatus";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import UserInputError from "@services/utils/UserInputError";
import { getConnection, getManager, getRepository } from "typeorm";
import CoursesLogic, { TestResultType } from "./courses-logic";
export default class CourseLogicImpl implements CoursesLogic {
    getLastTestSentenceResult(courseId: string): Promise<any> {
        return this.getLastTestResult(courseId, "Sentence");
    }
    getLastTestFileResult(courseId: string): Promise<any> {
        return this.getLastTestResult(courseId, "File");
    }
    async getCourseAssociatedToModel(modelId: string) {
        const { courseId } = await getManager().query(
            `select "courseId" from text_classification_model
			where id = $1 
		   `,
            [modelId]
        );
        const course = await getRepository(Course).findOne(courseId);
        if (!course) throw new Error("Invalid model/course state");
        return course;
    }

    async storeTestFileResultInCourse(modelId: string, data: any) {
        const course = await this.getCourseAssociatedToModel(modelId);
        course.lastFileTestResults = data;
        await getRepository(Course)
            .save(course)
            .catch((err) => console.error(err));
    }

    async storeTestSentenceResultInCourse(modelId: string, data: any) {
        const course = await this.getCourseAssociatedToModel(modelId);
        course.lastSentenceTestResults = data;
        await getRepository(Course)
            .save(course)
            .catch((err) => console.error(err));
    }

    async setStateForCourseWide(state: TestRequestStatus, courseId: string) {
        await getConnection()
            .createQueryBuilder()
            .update(Course)
            .set({ connectionState: TestRequestStatus.PENDING })
            .where("id = :id", { id: courseId })
            .execute();
    }

    async getLastTestResult(
        courseId: string,
        resultType: TestResultType
    ): Promise<any> {
        const res = await getRepository(Course)
            .createQueryBuilder("course")
            .select(`course."last${resultType}TestResults"`)
            .where(`course.id=:courseId`, { courseId })
            .getRawOne();
        return res[`last${resultType}TestResults`];
    }

    async getCourseByLecture(lectureId: string): Promise<Course> {
        const lecture = await getRepository(Lecture).findOne(lectureId, {
            relations: ["course"],
        });
        if (!lecture) throw new Error("lecture not found");
        return lecture.course;
    }
    async getAllTextClassificationModels(
        courseId: string
    ): Promise<TextClassificationModel[]> {
        return await getRepository(TextClassificationModel)
            .createQueryBuilder("tcm")
            .where("tcm.courseId = :courseId", { courseId })
            .getMany();
    }

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
