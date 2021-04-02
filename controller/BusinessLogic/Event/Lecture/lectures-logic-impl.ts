import Lecture from "@models/Events/Lecture";
import UserInputError from "@services/utils/UserInputError";
import { getRepository } from "typeorm";
import LecturesLogic from "./lectures-logic";

export default class LecturesLogicImpl implements LecturesLogic {
    async deleteLectureById(lectureId: string): Promise<void> {
        await getRepository(Lecture).delete(lectureId)
    }

    async updateLecture(lectureId: string, newData: Lecture): Promise<Lecture> {
        const { id, ...newLecData } = newData;
        return await getRepository(Lecture).save(
            {
                id: lectureId,
                ...newLecData
            }
        )
    }

    async getLectureById(lectureId: string): Promise<Lecture> {
        const res = await getRepository(Lecture).findOne(lectureId)
        if (res) return res
        else throw new UserInputError("Invalid lecture id");
    }

    async createLecture(lecture: Lecture): Promise<Lecture> {
        return await getRepository(Lecture).save(lecture);
    }

}