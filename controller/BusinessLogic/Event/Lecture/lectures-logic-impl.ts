import Lecture from "@models/Events/Lecture/Lecture";
import LectureTranscript from "@models/Events/Lecture/LectureTranscript";
import StudentLectureAttendance from "@models/JoinTables/StudentLectureAttended";
import Student from "@models/Users/Student";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import LecturesLogic from "./lectures-logic";
import { promises } from "fs";
import AudioRoom from "@models/Events/AudioRoom";

const writeFile = promises.writeFile;

export default class LecturesLogicImpl implements LecturesLogic {
    async storeLectureTranscript(
        lectureId: string,
        content: any
    ): Promise<LectureTranscript> {
        const lecture = await getRepository(Lecture).findOne(lectureId);
        if (!lecture) throw new UserInputError("Invalid lecture id");
        const path = `${
            process.env["LECTURES_TRANSCRIPT_STORAGE"] ?? "static/lectureText/"
        }${lectureId}.txt`;

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
