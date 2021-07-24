import ReportLogic from "@controller/BusinessLogic/Report/report-logic";
import { ReportLogicImpl } from "@controller/BusinessLogic/Report/report-logic-impl";
import { ExamChunkResultCallback } from "@controller/sending/sendFiles";
import { IncidentType } from "@models/Report";
import { randomInt } from "crypto";
import { join } from "path";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

export const report_not_live: ExamChunkResultCallback = async (
    studentId: string,
    examId: string,
    result: string | string[],
    start: number,
    end: number
) => {
    // TODO add to report
    console.log(`report_not_live:`);
    console.debug(result);
    console.debug(`start= ${start}`);
    console.debug(`end= ${end}`);
};

/**
 * call back funcntion for ML file sender that process response and dicide wither it should save it in db or not
 * @param userId
 * @param examId
 * @param res response from ML server either the face match user of not
 * @param chunkStartTime the incident start time in secs relative to video start
 * @param chunkEndTime incident end time in secs
 */
export const report_res_face_auth: ExamChunkResultCallback = async (
    userId: string,
    examId: string,
    res: any,
    chunkStartTime: number,
    chunkEndTime: number
) => {
    const matching = res.matched;
    console.debug(
        `face auth form ${chunkStartTime}s to ${chunkEndTime} result is ${
            matching ? "same face" : "diffrent face"
        } `
    );

    if (!matching) {
        const reportlogic: ReportLogic = new ReportLogicImpl();
        reportlogic
            .addToReport(
                userId,
                examId,
                chunkStartTime,
                chunkEndTime - chunkStartTime,
                IncidentType.different_face
            )
            .then((_) => {
                console.debug(`report saved for user ${userId}`);
            });
    }
};

/**
 * call back funcntion for ML file sender that process response and dicide wither it should save it in db or not
 * @param userId
 * @param examId
 * @param res response from ML server either the face match user of not
 * @param chunkStartTime the incident start time in secs relative to video start
 * @param chunkEndTime incident end time in secs
 */
export const report_res_forbidden_objects: ExamChunkResultCallback = async (
    userId: string,
    examId: string,
    res: any,
    chunkStartTime: number,
    chunkEndTime: number
) => {
    const fo_list = res.forbidden_objects;

    console.debug(
        `forbidden object form ${chunkStartTime}s to ${chunkEndTime} result is ${
            fo_list.length == 0 ? "no forbidden" : "found forbidden object"
        }`
    );

    if (fo_list.length > 0) {
        const report_logic: ReportLogic = new ReportLogicImpl();
        report_logic
            .addToReport(
                userId,
                examId,
                chunkStartTime,
                chunkEndTime - chunkStartTime,
                IncidentType.forbidden_object
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
                console.debug(`conversion end from ${startTime}s to ${startTime + duration}s`);
                resolve(tempPath);
            })
            .on("error", function (err: any) {
                rejects(err);
            })
            .run();
    });
}

let upload_folder =
    process.env["UPLOADED_RECORDING_PATH"] || "/static/recording";

export function get_video_path(userId: string, examId: string) {
    let video_dir = join(upload_folder, examId);
    return join(video_dir, `${userId}.webm`);
}
