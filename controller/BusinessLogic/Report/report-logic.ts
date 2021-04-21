import { ExamChunkResultCallback } from "@controller/sending/sendFiles";
import Report from "@models/Report";

export default interface ReportLogic {
  addToReport: ExamChunkResultCallback;
  getReport(studentId: string, examId: string): Promise<Report[] | undefined>;
}
