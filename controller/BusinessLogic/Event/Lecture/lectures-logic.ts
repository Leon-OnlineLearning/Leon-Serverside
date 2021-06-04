import Lecture from "@models/Events/Lecture/Lecture";
import Student from "@models/Users/Student";
import LectureTranscript from "@models/Events/Lecture/LectureTranscript";

export default interface LecturesLogic {
    getStudentsForLecture(lectureId: string): Promise<Student[]>;
    createLecture(lecture: Lecture): Promise<Lecture>;
    deleteLectureById(lectureId: string): Promise<void>;
    updateLecture(lectureId: string, newData: Lecture): Promise<Lecture>;
    getLectureById(lectureId: string): Promise<Lecture>;
    storeLectureTranscript(
        lectureId: string,
        lectureContent: any,
    ): Promise<LectureTranscript>;
}
