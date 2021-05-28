import Course from "@models/Course";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import { getRepository } from "typeorm";
import CoursesLogic from "../Course/courses-logic";
import CourseLogicImpl from "../Course/courses-logic-impl";
import ModelLogic from "./models-logic";

export default class ModelLogicImpl implements ModelLogic {
    async addModelInCourse(
        model: TextClassificationModel,
        courseId: string
    ): Promise<TextClassificationModel> {
        try {
            const courseLogic: CoursesLogic = new CourseLogicImpl();
            const course = await courseLogic.getCoursesById(courseId);
            model.course = course;
            const res = getRepository(TextClassificationModel).save(model);
            return res;
        } catch (e) {
            throw e;
        }
    }
}
