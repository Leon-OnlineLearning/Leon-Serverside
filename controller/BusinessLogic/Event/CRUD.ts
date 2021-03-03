import Event from "@models/Events/Event";
import Exam from "@models/Events/Exam";
import Lecture from "@models/Events/Lecture";
import { getRepository } from "typeorm";

export async function createLecture(lecture:Lecture) {
    await getRepository(Lecture).save(lecture)
}

export async function createExam(exam: Exam) {
    await getRepository(Exam).save(exam)
}

export async function getLectureById(lectureId: string) {
    await getRepository(Lecture).findOne(lectureId)
}

export async function getExamById(examId: string) {
    await getRepository(Exam).findOne(examId)
}