import Course from "@models/Course";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import UserInputError from "@services/utils/UserInputError";
import fs from "fs/promises";
import { getRepository } from "typeorm";
import CoursesLogic from "../Course/courses-logic";
import CourseLogicImpl from "../Course/courses-logic-impl";
import ModelLogic from "./models-logic";
import extract from "extract-zip";

export default class ModelLogicImpl implements ModelLogic {
    async receiveModelFiles(
        modelId: string,
        zipFile: any
    ): Promise<TextClassificationModel> {
        // save the zip file
        // add it to tmp to be removed whenever server fault
        const zipPath = `/tmp/${modelId}.zip`;
        const extractionDir =
            process.env["MODELS_PATH"] ?? "static/textclassification";
        const baseUrl = process.env["BASE_URL"] ?? "https://localhost/backend/";
        await fs.writeFile(zipFile, zipPath);
        // extract the zip file to static folder
        try {
            await extract(zipPath, {
                dir: extractionDir,
            });
        } catch (e) {
            console.error(e);
        }
        // delete the zip file
        await fs.unlink(zipPath);
        // create the model
        const model = new TextClassificationModel();
        // add the paths to our model
        const pathPrefix = `${baseUrl}${extractionDir}/models/${modelId}`;
        model.trainingModelPath = `${pathPrefix}/models/training_model_${modelId}.pth`;
        model.dataClassificationModelPath = `${pathPrefix}/data_classification_model_${modelId}.pkl`;
        model.dataLanguageModelPath = `${pathPrefix}/data_language_model_${modelId}.pkl`;
        model.predictionModelPath = `${pathPrefix}/prediction_model_${modelId}.pkl`;
        model.stateFilePath = `${pathPrefix}/state_${modelId}.json`;
        // for accuracy read the json file and get the accuracy
        // for class mapper
        let state: any = await fs.readFile(
            `${pathPrefix}/state_${modelId}.json`,
            {
                encoding: "utf-8",
            }
        );
        state = JSON.parse(state);
        model.accuracy = state.accuracy;
        return model;
    }
    getAllModels(): Promise<TextClassificationModel[]> {
        return getRepository(TextClassificationModel).find();
    }

    async getModelById(modeId: string): Promise<TextClassificationModel> {
        const model = await getRepository(TextClassificationModel).findOne(
            modeId
        );
        if (!model) throw new UserInputError("invalid model id");
        return model;
    }
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
