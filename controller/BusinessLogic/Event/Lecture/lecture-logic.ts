import Lecture from "@models/Events/Lecture";

export default interface LectureLogic {
    createLecture(lecture: Lecture): Promise<Lecture>;
}