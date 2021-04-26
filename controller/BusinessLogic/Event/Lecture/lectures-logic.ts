import Lecture from "@models/Events/Lecture";
import Student from "@models/Users/Student";

export default interface LecturesLogic {
    getStudentsForLecture(lectureId: string): Promise<Student[]>;
    createLecture(lecture: Lecture): Promise<Lecture>;
    deleteLectureById(lectureId: string): Promise<void>;
    updateLecture(lectureId: string, newData: Lecture): Promise<Lecture>;
    getLectureById(lectureId: string): Promise<Lecture>;
}
