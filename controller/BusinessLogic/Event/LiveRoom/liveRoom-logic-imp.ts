import AudioRoom from "@models/Events/AudioRoom";
import Lecture from "@models/Events/Lecture/Lecture";
import UserTypes from "@models/Users/UserTypes";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import LecturesLogicImpl from "../Lecture/lectures-logic-impl";
import LiveRoomLogic from "./liveRoom-logic";
import { start_janus_room } from "./liveRoom-utils";

const janus_server =
    process.env.janus_server || "http://janus-gateway:8088/janus";

const jansus_reocrd_folder =
    process.env.janus_record_folder || "/www/recording";

export default class LiveRoomLogicImpl implements LiveRoomLogic {
    async enter_lecture_room(
        lectureId: string,
        userRole: UserTypes
    ): Promise<AudioRoom> {
        let lecture = await new LecturesLogicImpl().getLectureById(lectureId);
        let liveRoom = await this.getRoomByLectureId(lectureId);

        if (liveRoom.isAlive) {
            return liveRoom;
        }

        const isLectureTime =
            lecture.startTime < new Date() && lecture.endTime > new Date();
        if (!isLectureTime) {
            console.debug(
                `start: ${lecture.startTime}, end:${lecture.endTime}`
            );
            console.debug(`time now: ${new Date()}`);
            throw new Error("lecture is not now");
        }

        const canStartRoom = userRole == UserTypes.PROFESSOR && isLectureTime;
        if (!canStartRoom) {
            throw new Error("wait the professor to start lecture");
        }

        await start_janus_room(
            liveRoom.roomId,
            janus_server,
            liveRoom.roomSecret,
            "notImplemented",
            _get_janus_file_path(lectureId)
        );

        liveRoom.isAlive = true;
        getRepository(AudioRoom).save(liveRoom);
        return liveRoom;
    }

    async getRoomByLectureId(lectureId: string) {
        const lecture = await getRepository(Lecture).findOne(lectureId, {
            relations: ["liveRoom"],
        });
        if (lecture) return lecture.liveRoom;
        else throw new UserInputError("Invalid lecture id");
    }
}

export function _get_janus_file_path(lectureId: string) {
    return `${jansus_reocrd_folder}/${lectureId}.wav`;
}
