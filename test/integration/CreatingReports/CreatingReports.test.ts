import ExamsLogic from "@controller/BusinessLogic/Event/Exam/exam-logic";
import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import Exam from "@models/Events/Exam";
import Student from "@models/Users/Student";
import {
  destructDBMSConnection,
  initializeDBMSConnection,
} from "@utils/database-connection";

describe("Creating reports", () => {
  beforeAll((done) => {
    initializeDBMSConnection()
      .then(() => {
        done();
      })
      .catch((err) => {
        console.error(err);
      });
  });

  afterAll((done) => {
    destructDBMSConnection()
      .then(() => {
        done();
      })
      .catch((err) => {
        console.error(err);
      });
  });

  test("it should send reports correctly", async () => {
    // create student
    const studentLogic: StudentLogic = new StudentLogicImpl();
    try {
      let student = new Student();
      student.firstName = "ahamada";
      student.lastName = "sdadlkjs";
      student.password = "dkasj!@#44234A";
      student.email = "std@gmail.com";
      student = await studentLogic.createStudent(student);
      // create exam
      const examLogic: ExamsLogic = new ExamsLogicImpl();
      let exam = new Exam();
      exam.title = "asdjalkj";
      exam.year = 4;
      exam.startTime = new Date();
      const endTime = new Date(exam.startTime);
      endTime.setHours(endTime.getHours() + 3);
      exam.endTime = endTime;
      exam.mark = 7;
      exam = await examLogic.createExam(exam);
      // create start time and interval
      const interval = 10;
      const [startTime1, startTime2] = [0, interval];
      // create report logic
      const logic: ReportLogic = new ReportLogicImpl();
      // add report to exam and student starting at interval * 0
      await logic.addToReport(student.id, exam.id, startTime1, interval);
      // add report to exam starting at interval * 1
      await logic.addToReport(student.id, exam.id, startTime2, interval);
      // get report and check if the intervals where merged
      const finalReport = await logic.getReport(student.id, exam.id);
      console.log(finalReport);
      
      expect(finalReport[0].startingFrom).toEqual(0);
      expect(finalReport[0].endingAt).toEqual(20);
    } catch (e) {
      console.error(e);
      expect(false).toBeTruthy;
    }
  });
});
