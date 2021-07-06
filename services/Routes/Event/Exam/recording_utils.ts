import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";
import { ExamChunkResultCallback } from "@controller/sending/sendFiles";
import { randomInt } from "crypto";
import { join } from "path";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * call back funcntion for ML file sender that process response and dicide wither it should save it in db or not
 * @param userId
 * @param examId
 * @param res response from ML server either the face match user of not
 * @param chunkStartTime the incident start time in secs relative to video start
 * @param chunkEndTime incident end time in secs
 */
export const report_res: ExamChunkResultCallback = async (
    userId: string,
    examId: string,
    res: string,
    chunkStartTime: number,
    chunkEndTime: number
) => {
    const matching = res;
    console.debug(
        `face auth form ${chunkStartTime}s to ${chunkEndTime} result is ${
            matching ? "same face" : "diffrent face"
        } `
    );

    if (!matching) {
        console.log("will save");
        const reportlogic: ReportLogic = new ReportLogicImpl();
        reportlogic
            .addToReport(
                userId,
                examId,
                chunkStartTime,
                chunkEndTime - chunkStartTime
            )
            .then((_) => {
                console.debug(`report saved for user ${userId}`);
            });
    }
};

/**
 * clip video to smaller part
 * @param fullVideo path to full vedio
 * @param startTime required start time
 * @param duration the duration reqired
 * @returns path for cliped video from start plus duration
 */
export async function get_video_portion(
    fullVideo: string,
    startTime: number,
    duration: number
): Promise<string> {
    const randNum = Date.now() + randomInt(10000);
    const tempPath = `/tmp/chunk_${randNum}.mkv`;

    return new Promise<string>((resolve, rejects) => {
        ffmpeg(fullVideo)
            .setStartTime(startTime)
            .setDuration(duration)
            .output(tempPath)
            .videoCodec("copy")
            .audioCodec("copy")
            .on("end", async (stdout: string, stderr: string) => {
                // console.debug(`stdout ${stdout}`);
                // console.debug(`error ${stderr}`);
                console.debug("conversion end");
                resolve(tempPath);
            })
            .on("error", function (err: any) {
                console.log("error: ", err);
                rejects(err);
            })
            .run();
    });
}

let upload_folder = process.env["UPLOADED_RECORDING_PATH"] || "/static/recording";

export function get_video_path(userId: string, examId: string) {
    let video_dir = join(upload_folder, examId);
    return join(video_dir, `${userId}.webm`);
}
