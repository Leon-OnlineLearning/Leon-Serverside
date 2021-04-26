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
        startTime: number,
        interval: number
    ): Promise<Report> {
        const student = await getRepository(Student).findOne(studentId);
        if (!student) throw new UserInputError("Invalid user id");

        const exam = await getRepository(Exam).findOne(examId);
        if (!exam) throw new UserInputError("Invalid exam id");

        const prevReport = await getRepository(Report).findOne({
            startingFrom: startTime - interval,
            student: student,
            exam: exam,
        });

        let report;
        if (prevReport) {
            report = prevReport;
        } else {
            report = new Report();
            report.startingFrom = startTime;
            report.student = student;
            report.exam = exam;
        }

        // it will always be assigned to the new ending interval
        report.endingAt = startTime + interval;

        return await getRepository(Report).save(report);
    }

    async getReport(
        studentId: string,
        examId: string
    ): Promise<{ startingFrom: number; endingAt: number }[]> {
        try {
            return (
                await getRepository(Report).find({
                    where: {
                        exam: examId,
                        student: studentId,
                    },
                })
            ).map((report) => {
                return {
                    startingFrom: report.startingFrom,
                    endingAt: report.endingAt,
                };
            });
        } catch (e) {
            throw e;
        }
    }
}
