import AudioRoom from "@models/Events/AudioRoom";
import UserTypes from "@models/Users/UserTypes";

export default interface LiveRoomLogic {
    enter_lecture_room(
        lectureId: string,
        userRole: UserTypes
    ): Promise<AudioRoom>;

    getRoomByLectureId(lectureId: string): Promise<AudioRoom>;
}
