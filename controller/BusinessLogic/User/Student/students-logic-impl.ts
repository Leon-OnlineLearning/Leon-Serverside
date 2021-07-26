import Course from "@models/Course";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture/Lecture";
import StudentsExamData from "@models/JoinTables/StudentExam";
import Student from "@models/Users/Student";
import { hashPassword } from "@utils/passwords";
import { getRepository } from "typeorm";
import AdminLogic from "../Admin/admin-logic";
import AdminLogicImpl from "../Admin/admin-logic-impl";
import StudentLogic from "./students-logic";
import { AccountWithSimilarEmailExist } from "@models/Users/User";
import ProfessorLogic from "../Professor/professors-logic";
import ProfessorLogicImpl from "../Professor/professors-logic-impl";
import UserInputError from "@services/utils/UserInputError";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import Embedding from "@models/Users/Embedding";
import EventslogicImpl from "@controller/BusinessLogic/Event/events-logic-impl";
import UserTypes from "@models/Users/UserTypes";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";

export default class StudentLogicImpl implements StudentLogic {
    async setEmbedding(studentId: string, vector: number[]): Promise<void> {
        const student = await getRepository(Student).findOne(studentId);
        if (!student) throw new UserInputError("Invalid student id");
        const embedding = new Embedding();
        const studentnEmbedding = await student.embedding;
        if (studentnEmbedding) embedding.id = studentnEmbedding.id;
        embedding.vector = vector;
        student.embedding = Promise.resolve(embedding);
        await getRepository(Student).save(student);
    }

    async getEmbedding(studentId: string): Promise<Embedding> {
        const student = await getRepository(Student).findOne(studentId, {
            relations: ["embedding"],
        });
        if (!student) throw new UserInputError("Invalid student id");
        return student.embedding;
    }

    async getStudentAttendance(studentId: string): Promise<any> {
        // for each course get the lectures
        const courses = await this.getAllCourses(studentId);

        let res: any = {};
        // TODO room for optimization
        for (let course of courses) {
            const qb = getRepository(Lecture).createQueryBuilder("lec");
            const courseLectures = await course.lectures;

            const attendedLectures = await qb
                .where("lec.courseId = :courseId", { courseId: course.id })
                .andWhere(
                    "lec.id IN" +
                        qb
                            .subQuery()
                            .select('"lectureId"')
                            .from(StudentLectureAttendance, "st_lec_at")
                            .where("st_lec_at.studentId = :studentId", {
                                studentId,
                            })
                            .getQuery()
                )
                .getMany();

            let _res: Array<any> = [];
            const attendedLecturesTitle = attendedLectures.map(
                (al) => al.title
            );

            for (let lec of courseLectures) {
                _res.push({
                    lectureTitle: lec.title,
                    attended: attendedLecturesTitle.indexOf(lec.title) !== -1,
                });
            }
            res = { ...res, [course.name]: _res };
        }
        return res;
    }

    async getAllEvents(
        studentId: string,
        startingFrom: string,
        endingAt: string
    ) {
        return new EventslogicImpl().getAllEvents(
            UserTypes.STUDENT,
            studentId,
            startingFrom,
            endingAt
        );
    }

    async updateStudent(studentId: string, newData: Student): Promise<Student> {
        const student = await this.getStudentById(studentId);
        if (!student) throw new UserInputError("Student doesn't exist");
        student.setValuesFromJSON(newData);
        return await getRepository(Student).save(student);
    }

    getStudentById(studentId: string): Promise<Student | undefined> {
        return getRepository(Student).findOne(studentId);
    }

    getStudentByEmail(email: string): Promise<Student | undefined> {
        return getRepository(Student).findOne({
            where: { email: email },
        });
    }

    async getAllStudents(skip: number, take: number): Promise<Student[]> {
        const _take = take || 10;
        const _skip = skip || 0;
        const [res, _] = await getRepository(Student).findAndCount({
            skip: _skip,
            take: _take,
        });
        return res;
    }

    async getAllLectures(studentId: string): Promise<Lecture[]> {
        const student = await getRepository(Student).findOne(studentId);
        if (student) {
            let lectures: Array<Lecture> = [];
            for (const sla of await student.studentLectureAttendance) {
                lectures.push(await sla.lecture);
            }
            return lectures;
        } else {
            throw new UserInputError("User not found!");
        }
    }

    async getAllCourses(studentId: string): Promise<Course[]> {
        const student = await getRepository(Student).findOne(studentId, {
            relations: ["department"],
        });
        if (student) {
            const coursesQB = getRepository(Course).createQueryBuilder("c");
            const courses = await coursesQB
                .where("c.departmentId = :depId", {
                    depId: student.department.id,
                })
                .andWhere("c.year = :studentYear", {
                    studentYear: student.year,
                })
                .getMany();

            return courses;
        } else {
            throw new UserInputError("User not found!");
        }
    }

    /**
     * Creat new student assume password is no hashed yet
     * @param student
     * @returns resulted student
     */
    async createStudent(student: Student): Promise<Student> {
        const adminLogic: AdminLogic = new AdminLogicImpl();
        const admin = await adminLogic.getAdminByEmail(student.email);
        if (admin) throw new AccountWithSimilarEmailExist();
        const professorLogic: ProfessorLogic = new ProfessorLogicImpl();
        const professor = await professorLogic.getProfessorByEmail(
            student.email
        );
        if (professor) throw new AccountWithSimilarEmailExist();

        const repo = getRepository(Student);

        student.password = await hashPassword(student.password);
        return await repo.save(student);
    }

    async attendLecture(studentId: string, lectureId: string): Promise<void> {
        const student = await getRepository(Student).findOne(studentId, {
            relations: ["department"],
        });
        if (!student) {
            throw new UserInputError("Student is not found");
        }
        const lecture = await getRepository(Lecture).findOne(lectureId);
        if (!lecture) {
            throw new UserInputError("Lecture is not found");
        }

        const studentCourses = await this.getAllCourses(student.id);

        const lectureCourse = await lecture.course;
        if (!studentCourses.length)
            throw new UserInputError(
                "Student hasn't assigned any courses yet!"
            );
        if (!lectureCourse)
            throw new UserInputError(
                "Lecture is not assigned to a course yet!"
            );
        if (
            studentCourses.map((c) => c.name).indexOf(lectureCourse.name) === -1
        )
            throw new UserInputError(
                "Student deson't have access to this course"
            );
        const sla = new StudentLectureAttendance();
        sla.lecture = Promise.resolve(lecture);
        sla.student = Promise.resolve(student);
        (await student.studentLectureAttendance).push(sla);
        await getRepository(StudentLectureAttendance).save(sla);
    }

    async registerExamPath(
        studentId: string,
        examId: string,
        examVideoUrl: string
    ): Promise<StudentsExamData> {
        const studentExam = await new ExamsLogicImpl().getStudentExam(
            studentId,
            examId
        );
        studentExam.videoPath = examVideoUrl;
        return await getRepository(StudentsExamData).save(studentExam);
    }
}
