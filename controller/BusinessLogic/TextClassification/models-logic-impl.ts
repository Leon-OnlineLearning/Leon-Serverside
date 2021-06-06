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
    getAllModelsByCourseId(
        courseId: string
    ): Promise<TextClassificationModel[]> {
        console.log("course ID is", courseId);
        const course = getRepository(Course).findOne(courseId);
        if (!courseId) throw new UserInputError("invalid course id");
        return getRepository(TextClassificationModel)
            .createQueryBuilder("tcm")
            .where("tcm.courseId = :courseId", { courseId })
            .getMany();
    }

    async createSubModel(modelId: string): Promise<TextClassificationModel> {
        const textClassificationRepo = getRepository(TextClassificationModel);
        const superModel = await textClassificationRepo.findOne(modelId);
        if (!superModel) throw new UserInputError("Invalid model id");
        const _subModel = new TextClassificationModel();
        _subModel.superModel = superModel;
        _subModel.dataClassificationModelPath =
            superModel.dataClassificationModelPath;
        _subModel.dataLanguageModelPath = superModel.dataLanguageModelPath;
        _subModel.state = { ...superModel.state, accuracy: -1 };
        _subModel.name = `sub_module_for_${modelId}`;
        const subModel = await getRepository(TextClassificationModel).save(
            _subModel
        );
        await textClassificationRepo.save(superModel);
        return subModel;
    }

    async receiveModelFiles(
        modelId: string,
        zipFile: any
    ): Promise<TextClassificationModel> {
        // save the zip file
        // add it to tmp to be removed whenever server fault
        console.log("files received");

        console.log("dirname", __dirname);

        const zipPath = `${__dirname}/../../../static/textclassification/tempzip/${modelId}.zip`;
        const extractionDir = `${__dirname}/../../../${
            process.env["MODELS_PATH"] ?? "static/textclassification"
        }`;
        const baseUrl = process.env["BASE_URL"] ?? "https://localhost/backend/";
        console.log("the file is", zipFile);
        await fs.writeFile(zipPath, zipFile);
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
        const model = await getRepository(TextClassificationModel).findOne(
            modelId
        );
        if (!model) throw new UserInputError("invalid model id");
        // add the paths to our model
        const pathPrefix = `${baseUrl}static/textclassification/models/${modelId}`;
        model.trainingModelPath = `${pathPrefix}/models/training_model_${modelId}.pth`;
        model.dataClassificationModelPath = `${pathPrefix}/data_classification_model_${modelId}.pkl`;
        model.dataLanguageModelPath = `${pathPrefix}/data_language_model_${modelId}.pkl`;
        model.predictionModelPath = `${pathPrefix}/prediction_model_${modelId}.pkl`;
        model.stateFilePath = `${pathPrefix}/state_${modelId}.json`;
        // for accuracy read the json file and get the accuracy
        // for class mapper
        const filesPrefix = `${extractionDir}/models/${modelId}`;
        let state: any = await fs.readFile(
            `${filesPrefix}/state_${modelId}.json`,
            {
                encoding: "utf-8",
            }
        );
        state = JSON.parse(state);
        model.accuracy = state.accuracy;
        model.state = state;
        await getRepository(TextClassificationModel).save(model);
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
