import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";
import { ExamChunkResultCallback } from "@controller/sending/sendFiles";

export const report_res: ExamChunkResultCallback = async (
    userId: string,
    examId: string,
    res: string,
    chunkStartTime: number,
    chunkEndTime: number
) => {
    const matching = res;
    console.log(matching);

    if (!matching) {
        // TODO save database
        console.log("will save");
        const reportlogic: ReportLogic = new ReportLogicImpl();
        reportlogic.addToReport(
            userId,
            examId,
            chunkStartTime,
            chunkEndTime - chunkStartTime
        );
        console.log(chunkStartTime);
        console.log(res);
    }
};
