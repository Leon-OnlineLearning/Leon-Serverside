import Lecture from "@models/Events/Lecture";

export default interface LecturesLogic {
    createLecture(lecture: Lecture): Promise<Lecture>;
    deleteLectureById(lectureId: string): Promise<void>;
    updateLecture(lectureId: string, newData: Lecture): Promise<Lecture>;
    getLectureById(lectureId: string): Promise<Lecture>;
}