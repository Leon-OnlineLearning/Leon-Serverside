import Exam from "@models/Events/Exam";
import Report from "@models/Report";
import Student from "@models/Users/Student";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import ReportLogic from "./report-logic";

export class ReportLogicImpl implements ReportLogic {
  async addToReport(
    studentId: string,
    examId: string,
    result: string,
    startingFrom: Date,
    endingAt: Date
  ): Promise<Report | void> {
    const student = await getRepository(Student).findOne(studentId);
    if (!student) throw new UserInputError("Invalid user id");

    const exam = await getRepository(Exam).findOne(examId);
    if (!exam) throw new UserInputError("Invalid exam id");

    const report = new Report();
    report.student = student;
    report.exam = exam;
    report.startingFrom = startingFrom;
    report.endingAt = endingAt;
    report.result = result;

    try {
      await getRepository(Report).save(report);
    } catch (e) {
      console.error(e);
    }
  }

  async getReport(studentId: string, examId: string): Promise<Report[] | undefined> {
    try {
      return await getRepository(Report).find({
        where: {
          exam: examId,
          student: studentId,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
}
