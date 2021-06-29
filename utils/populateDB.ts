import Student from "@models/Users/Student";
import Admin from "@models/Users/Admin";
import AdminLogicImpl from "@controller/BusinessLogic/User/Admin/admin-logic-impl";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import Exam from "@models/Events/Exam";
import test_exam from "./db";
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic";
import ProfessorLogicImpl from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import Professor from "@models/Users/Professor";
import Course from "@models/Course";

import ExamQuestion from "@models/Events/ExamQuestions";
import Department from "@models/Department";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
import DepartmentsLogicImpl from "@controller/BusinessLogic/Department/departments-logic-impl";
import User from "@models/Users/User";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import { promises } from "fs";
import TextClassificationFile from "@models/TextClassification/TextClassificationFile";
import TextClassificationFilesLogic from "@controller/BusinessLogic/TextClassification/files-logic";
import FileLogicImpl from "@controller/BusinessLogic/TextClassification/file-logic-impl";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";
import StudentExam from "@models/JoinTables/StudentExam";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import LecturesLogicImpl from "@controller/BusinessLogic/Event/Lecture/lectures-logic-impl";
import Lecture from "@models/Events/Lecture/Lecture";

const readFile = promises.readFile;
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

    const professorlogic: ProfessorLogic = new ProfessorLogicImpl();
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

    new ProfessorLogicImpl().assignCourseToProfessor(
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

    const videoPath = `${process.env["BASE_URL"]}static/recording/recording.mp4`;
    const studentLogic: StudentLogic = new StudentLogicImpl();
    const resultStudentExam = await studentLogic.attendExam(
        sample_student.id,
        baseExam.id,
        videoPath
    );
    console.debug(`student + exam relation created ${resultStudentExam.id}`);

    // create fake models (not suitable for machine learning)
    const fakeTCModel = new TextClassificationModel();
    fakeTCModel.name = "fake tc model";
    fakeTCModel.id = "8c1d6508-3d53-4024-877d-f4aa5cc9537c";
    if (!process.env["BASE_URL"])
        throw new Error("BASE_URL env var is not found");
    const baseTextClassificationPath = `${process.env["BASE_URL"]}static/textclassification/`;
    const modelBaseURL = `${baseTextClassificationPath}models/`;
    fakeTCModel.trainingModelPath = `${modelBaseURL}${fakeTCModel.id}/models/training_model_${fakeTCModel.id}.pth`;
    fakeTCModel.dataClassificationModelPath = `${modelBaseURL}${fakeTCModel.id}/data_classification_model_${fakeTCModel.id}.pkl`;
    fakeTCModel.dataLanguageModelPath = `${modelBaseURL}${fakeTCModel.id}/data_language_model_${fakeTCModel.id}.pkl`;
    fakeTCModel.predictionModelPath = `${modelBaseURL}${fakeTCModel.id}/prediction_model_${fakeTCModel.id}.pkl`;

    let state: any = await readFile(
        `${__dirname}/../static/textclassification/models/8c1d6508-3d53-4024-877d-f4aa5cc9537c/state_8c1d6508-3d53-4024-877d-f4aa5cc9537c.json`,
        {
            encoding: "utf-8",
        }
    );
    state = JSON.parse(state);
    console.log("state is", state);
    fakeTCModel.state = state;
    const createdFakeTCModel = await new ModelLogicImpl().addModelInCourse(
        fakeTCModel,
        sample_course.id
    );
    console.debug(`created text classification model ${createdFakeTCModel.id}`);

    const tcLogic: TextClassificationFilesLogic = new FileLogicImpl();
    const textClassifierFiles = [
        new TextClassificationFile(),
        new TextClassificationFile(),
    ];
    textClassifierFiles[0].filePath = `${baseTextClassificationPath}testing/movies_(1).txt-related1622946144869.txt`;
    const _file0 = await tcLogic.createFile(textClassifierFiles[0]);
    tcLogic.linkFileToModel(
        _file0.id,
        fakeTCModel.id,
        FileType.NON_RELATED,
        "hamada"
    );
    console.debug(`created test file linked to the model`, _file0.id);

    textClassifierFiles[1].filePath = `${baseTextClassificationPath}related/hello_world.pdf-related1622485489250.pdf`;
    const _file1 = await tcLogic.createFile(textClassifierFiles[1]);
    tcLogic.linkFileToModel(
        _file1.id,
        fakeTCModel.id,
        FileType.RELATED,
        "a relevant class"
    );
    console.debug(`created test file linked to the model`, _file1.id);

    // create sub model
    const fakeSubModel = new TextClassificationModel();
    fakeSubModel.id = "064730c1-c17f-42fc-bebd-010d7b0257db";
    fakeSubModel.predictionModelPath = `${modelBaseURL}${fakeSubModel.id}/prediction_model_${fakeSubModel.id}.pkl`;
    fakeSubModel.trainingModelPath = `${modelBaseURL}${fakeSubModel.id}/models/training_model_${fakeSubModel.id}.pth`;

    let subState: any = await readFile(
        `${__dirname}/../static/textclassification/models/064730c1-c17f-42fc-bebd-010d7b0257db/state_064730c1-c17f-42fc-bebd-010d7b0257db.json`,
        {
            encoding: "utf-8",
        }
    );
    subState = JSON.parse(subState); // that's why i didn't use the normal create subModule function (the state is already ready)
    subState.Classes = state.Classes;
    fakeSubModel.state = subState;
    fakeSubModel.superModel = fakeTCModel;
    fakeSubModel.primeModelId = fakeTCModel.id;
    fakeSubModel.name = "sub module for" + fakeTCModel.name;
    fakeSubModel.dataClassificationModelPath =
        fakeTCModel.dataClassificationModelPath;
    fakeSubModel.dataLanguageModelPath = fakeTCModel.dataLanguageModelPath;
    fakeSubModel.state = fakeTCModel.state;
    const createdFakeSubModule = await new ModelLogicImpl().addModelInCourse(
        fakeSubModel,
        sample_course.id
    );
    console.debug(`created fake sub module ${createdFakeSubModule.id}`);

    const fakeLecture = new Lecture();
    fakeLecture.course = sample_course;
    fakeLecture.title = "blah blah";
    fakeLecture.year = 1;
    const startDate = new Date();
    fakeLecture.startTime = startDate;
    const newDate = new Date();
    newDate.setHours(newDate.getHours() + 3);
    fakeLecture.endTime = newDate;
    fakeLecture.startTime = _time_after_now(1);
    fakeLecture.endTime = _time_after_now(30);
    fakeLecture.path = "/test.pdf"; // test file available by front end

    const lecture = await new LecturesLogicImpl().createLecture(fakeLecture);
    console.debug(`created lecture ${lecture.id}`);
    new ProfessorLogicImpl().assignLectureToProfessor(
        sample_professor.id,
        fakeLecture.id
    );
    /**
     *
     * @param minutes minutes to add from now
     * @returns data time of now + minutes
     */
    function _time_after_now(minutes: number) {
        const now = new Date();
        return new Date(now.getTime() + minutes * 60000);
    }
    console.debug(`attaching professor ${sample_professor.id} to lecture `);
}
