import Lecture from "@models/Events/Lecture/Lecture";
import LectureTranscript from "@models/Events/Lecture/LectureTranscript";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import Student from "@models/Users/Student";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import LecturesLogic from "./lectures-logic";
import { promises } from "fs";
import AudioRoom from "@models/Events/AudioRoom";
import axios from "axios";
import { join } from "path";
import CoursesLogic from "@controller/BusinessLogic/Course/courses-logic";
import CourseLogicImpl from "@controller/BusinessLogic/Course/courses-logic-impl";
const mkdir = promises.mkdir;

const writeFile = promises.writeFile;

const fileFormat = "wav";
const record_dir =
    process.env["UPLOADED_LECTURES_PATH"] || "static/recording/lectures";
const remote_server_url =
    process.env["LIVEROOM_SERVER"] || "http://janus-gateway:6111";

export default class LecturesLogicImpl implements LecturesLogic {
    async getLecturesTranscriptByCourseId(
        courseId: string
    ): Promise<LectureTranscript[]> {
        const courseLogic: CoursesLogic = new CourseLogicImpl();
        // get lectures for course
        const lectures = await courseLogic.getLecturesForCourse(courseId);
        const transcriptsPromises = lectures.map(async (lec) => {
            const transcriptP = this.getLectureTranscriptByLectureId(lec.id);
            console.log("transcript is", transcriptP);
            return transcriptP;
        });
        const transcripts = [];
        for (const tscp of transcriptsPromises) {
            const _transcript = await tscp;
            console.log("transcript is");
            if (_transcript) transcripts.push(_transcript);
        }
        return transcripts;
    }
    async getLectureTranscriptByLectureId(
        lectureId: string
    ): Promise<LectureTranscript> {
        const lecture = await getRepository(Lecture).findOne(lectureId, {
            relations: ["transcript"],
        });
        if (!lecture) {
            throw new UserInputError("lecture has no transcript");
        }
        console.log("lecture is", lecture);
        return lecture.transcript;
    }
    async listRemoteRecordings(): Promise<string[]> {
        const res = await axios.get(`${remote_server_url}/lecture/all`);
        return res.data;
    }

    async getRemoteRecording(lectureId: string): Promise<string> {
        const res = await axios.get(
            `${remote_server_url}/lecture/${lectureId}.${fileFormat}`,
            {
                responseType: "arraybuffer",
            }
        );

        const recording_path = getLectureRecordPath(lectureId);

        // make sure folder exist then save the recording
        await mkdir(record_dir, { recursive: true });
        await writeFile(recording_path, res.data);

        return recording_path;
    }
    async clearRemoteRecording(lectureId: string): Promise<void> {
        const res = await axios.delete(
            `${remote_server_url}/lecture/${lectureId}`
        );
        if (res.status != 200) {
            throw new Error("cannot delete file");
        }
    }
    /**
     * download -> delete -> save path to db
     */
    async transferRemoteRecording(
        lectureId: string
    ): Promise<string | undefined> {
        try {
            const lecture = await this.getLectureById(lectureId);

            lecture.recording_path = await this.getRemoteRecording(lectureId);
            console.debug(
                `recording saved successfully at ${lecture.recording_path}`
            );

            await getRepository(Lecture).save(lecture);

            await this.clearRemoteRecording(lectureId);

            return lecture.recording_path;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
    async storeLectureTranscript(
        lectureId: string,
        content: any
    ): Promise<LectureTranscript> {
        const lecture = await getRepository(Lecture).findOne(lectureId);
        if (!lecture) throw new UserInputError("Invalid lecture id");
        const dir =
            process.env["LECTURES_TRANSCRIPT_STORAGE"] ?? "static/lectureText/";
        mkdir(dir, { recursive: true });
        const path = `${dir}${lectureId}.txt`;

        await writeFile(path, content);
        const transcriptFile = new LectureTranscript();
        transcriptFile.filePath = path;
        transcriptFile.lecture = lecture;
        const transcriptRes = await getRepository(LectureTranscript).save(
            transcriptFile
        );
        // TODO create a file from this transcript and link it
        // to model as related
        lecture.transcript = transcriptRes;
        await getRepository(Lecture).save(lecture);
        return transcriptRes;
    }

    async getStudentsForLecture(lectureId: string): Promise<Student[]> {
        const qb = getRepository(StudentLectureAttendance).createQueryBuilder(
            "sla"
        );
        const slas = await qb
            .where("sla.lectureId = :lectureId", { lectureId })
            .getMany();
        if (!slas || slas.length === 0) {
            throw new UserInputError("Lecture doesn't have students");
        }
        const students: Array<Student> = [];
        for (const sla of slas) {
            students.push(await sla.student);
        }
        return students;
    }

    async deleteLectureById(lectureId: string): Promise<void> {
        await getRepository(Lecture).delete(lectureId);
    }

    async updateLecture(lectureId: string, newData: Lecture): Promise<Lecture> {
        const { id, ...newLecData } = newData;
        return await getRepository(Lecture).save({
            id: lectureId,
            ...newLecData,
        });
    }

    async getLectureById(lectureId: string): Promise<Lecture> {
        const res = await getRepository(Lecture).findOne(lectureId);
        if (res) return res;
        else throw new UserInputError("Invalid lecture id");
    }

    /**
     * create a lecture and room skelton for it
     * @param lecture
     * @returns
     */
    async createLecture(lecture: Lecture): Promise<Lecture> {
        const audioRoom = await getRepository(AudioRoom).create();
        lecture.liveRoom = audioRoom;
        return await getRepository(Lecture).save(lecture);
    }

    async getLecturesByCourse(
        courseId: string,
        startingFrom: string,
        endingAt: string
    ) {
        const lecQb = getRepository(Lecture).createQueryBuilder("lec");
        return await lecQb
            .where("lec.courseId = :courseId", { courseId: courseId })
            .andWhere("lec.startTime BETWEEN :start AND :end", {
                start: startingFrom,
                end: endingAt,
            })
            .getMany();
    }
}

export function getLectureRecordPath(lectureId: string) {
    return join(record_dir, `${lectureId}.wav`);
}
