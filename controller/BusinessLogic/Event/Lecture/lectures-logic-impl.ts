import Lecture from "@models/Events/Lecture";
import { getRepository } from "typeorm";
import LecturesLogic from "./lectures-logic";

export default class LecturesLogicImpl implements LecturesLogic {
    deleteLectureById(lectureId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    updateLecture(lectureId: string, newData: Lecture): Promise<Lecture> {
        throw new Error("Method not implemented.");
    }
    getLectureById(lectureId: string): Promise<Lecture> {
        throw new Error("Method not implemented.");
    }
    async createLecture(lecture: Lecture): Promise<Lecture> {
        return await getRepository(Lecture).save(lecture);
    }

}