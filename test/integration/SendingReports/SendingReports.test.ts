import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Exam from "@models/Events/Exam";
import Report from "@models/Report";
import Student from "@models/Users/Student";
import {
  destructDBMSConnection,
  initializeDBMSConnection,
} from "@utils/database-connection";

describe("Sending reports to database", () => {
  beforeAll((done) => {
    initializeDBMSConnection()
      .then(() => {
        done();
      })
      .catch((e) => {
        console.error(e);
      });
  });

  afterAll((done) => {
    destructDBMSConnection()
      .then(() => {
        done();
      })
      .catch((e) => console.error(e));
  });

  test("should send and get reports successfully to database", async () => {
    const studentLogic: StudentLogic = new StudentLogicImpl();
    let student = new Student();
    student.firstName = "ahmed";
    student.lastName = "whaever";
    student.email = `dakjdksaj${Date.now()}`;
    student.password = "d@Eqwdsa54878";
    student = await studentLogic.createStudent(student);

    const examLogic: ExamsLogic = new ExamsLogicImpl();
    try {
      let exam = new Exam();
      exam.title = "exam1";
      exam.year = 4;
      exam.mark = 10;
      exam.startTime = new Date();
      const examEndTime = new Date(exam.startTime);
      examEndTime.setHours(examEndTime.getHours() + 3);
      exam.endTime = examEndTime;
      exam = await examLogic.createExam(exam);

      const logic: ReportLogic = new ReportLogicImpl();
      const startingDate = new Date();
      const endingDate = new Date(startingDate);
      endingDate.setSeconds(endingDate.getSeconds() + 10);
      await logic.addToReport(
        student.id,
        exam.id,
        "1",
        startingDate,
        endingDate
      );

      const report = await logic.getReport(student.id, exam.id);
      expect(report).toBeTruthy();
      if (report) expect(report[0].result).toEqual("1");
    } catch (e) {
      console.error(e);
    }
  });
});
