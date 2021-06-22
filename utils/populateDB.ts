import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic";
import Student from "@models/Users/Student";
import Admin from "@models/Users/Admin";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import Exam from "@models/Events/Exam";
import test_exam from "./db";
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic";
import ProfessorLogicIml from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import Professor from "@models/Users/Professor";
import Course from "@models/Course";

import ExamQuestion from "@models/Events/ExamQuestions";
import Department from "@models/Department";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl";
import User from "@models/Users/User";
import Lecture from "@models/Events/Lecture";
import LecturesLogicImpl from "@controller/BusinessLogic/Event/Lecture/lectures-logic-impl";

function _createUser(baseUser: User, name: string, password = "1234") {
    baseUser.email = `${name}@test.com`;
    baseUser.password = password;
    baseUser.firstName = `base ${name} fn`;
    baseUser.lastName = `base ${name} ln`;
    baseUser.thirdPartyAccount = false;
    return baseUser;
}

export default async function populateDB() {
    // create admin account
    let sample_admin = _createUser(new Admin(), "admin");
    const created_admin = await new AdminLogicImpl().createAdmin(sample_admin);
    console.debug(`created admin  ${created_admin.id}`);

    // create pofessor account
    // prerequests department , course
    let sample_department = new Department();
    sample_department.name = "the dummy department";
    sample_department = await new DepartmentsLogicImpl().createDepartment(
        sample_department
    );
    console.debug(`created department ${sample_department.id}`);

    let sample_course = new Course();
    sample_course.name = "dummy course";
    sample_course.year = 2021;
    sample_course = await new CourseLogicImpl().createCourse(sample_course);
    console.debug(`created course ${sample_course.id}`);

    const professorlogic: ProfessorLogic = new ProfessorLogicIml();
    let sample_professor = _createUser(
        new Professor(),
        "professor"
    ) as Professor;
    sample_professor = await professorlogic.createProfessor(sample_professor);
    console.debug(`created professor ${sample_professor.id}`);

    await new DepartmentsLogicImpl().addProfessorToDepartment(
        sample_department.id,
        sample_professor.id
    );
    await new DepartmentsLogicImpl().addCourseToDepartment(
        sample_department.id,
        sample_course.id
    );
    console.debug(`department attached to course and professor`);

    new ProfessorLogicIml().assignCourseToProfessor(
        sample_professor.id,
        sample_course.id
    );
    console.debug(`professor assigned to course ${sample_course.id}`);

    // create student at same depatment
    let sample_student = _createUser(new Student(), "student") as Student;
    sample_student.year = 2021;
    sample_student.department = sample_department;
    sample_student = await new StudentLogicImpl().createStudent(sample_student);
    console.debug(`created student ${sample_student.id}`);

    // create exam
    const baseExam = new Exam();

    baseExam.title = test_exam.title;
    baseExam.year = parseInt(test_exam.year);
    baseExam.startTime = new Date();
    const exam_open_time = 30; //minutes
    baseExam.endTime = _time_after_now(exam_open_time);
    baseExam.mark = 120;
    baseExam.course = sample_course;

    baseExam.professor = sample_professor;

    const sample_question = (test_exam.questions as unknown) as ExamQuestion[];
    baseExam.questions = sample_question;

    const created_exam = await new ExamsLogicImpl().createExam(baseExam);
    console.debug(`created exam ${created_exam.id}`);

    const lecture = new Lecture();
    lecture.course = sample_course;
    lecture.professor = sample_professor;
    lecture.startTime = _time_after_now(1);
    lecture.endTime = _time_after_now(30);
    lecture.path = "/test.pdf"; // test file available by front end
    lecture.title = "amazing lecture";
    lecture.year = 2021;
    const sample_lecture = await new LecturesLogicImpl().createLecture(lecture);
    console.debug(`created lecture ${sample_lecture.id}`);

    new ProfessorLogicIml().assignLectureToProfessor(
        sample_professor.id,
        sample_lecture.id
    );
    console.debug(`attaching professor ${sample_professor.id} to lecture `);
}

/**
 *
 * @param minutes minutes to add from now
 * @returns data time of now + minutes
 */
function _time_after_now(minutes: number) {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
}
