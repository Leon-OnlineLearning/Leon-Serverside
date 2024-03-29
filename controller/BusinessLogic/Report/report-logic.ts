import Report, { IncidentType } from "@models/Report";

export default interface ReportLogic {
    addToReport(
        studentId: string,
        examId: string,
        startTime: number,
        interval: number,
        incidentType: IncidentType
    ): Promise<Report>;
    getReport(
        studentId: string,
        examId: string
    ): Promise<{ startingFrom: number; endingAt: number }[]>;
}
