import Course from "@models/Course";
import TextClassificationModel from "@models/TextClassification/TextClassificationModel";
import UserInputError from "@services/utils/UserInputError";
import { promises } from "fs";
import { getManager, getRepository } from "typeorm";
import CoursesLogic from "../Course/courses-logic";
import CourseLogicImpl from "../Course/courses-logic-impl";
import ModelLogic from "./models-logic";
import extract from "extract-zip";

const unlink = promises.unlink;
const readFile = promises.readFile;
const writeFile = promises.writeFile;

export default class ModelLogicImpl implements ModelLogic {
    async getTheLatestModel(
        courseId: string
    ): Promise<TextClassificationModel | undefined> {
        const course = await getRepository(Course).findOne(courseId);
        if (!course) throw new UserInputError("invalid course id");
        const subQuery = getManager()
            .createQueryBuilder(TextClassificationModel, "t")
            .select('MAX(t."createdAt")')
            .where('t."courseId" = :courseId', { courseId })
            .getQuery();
        console.log("sub query is", subQuery);
        const res = await getManager()
            .createQueryBuilder(TextClassificationModel, "tcm")
            .where(`tcm.\"createdAt\" = (${subQuery})`)
            .andWhere('tcm."courseId" = :courseId', { courseId })
            .getOne();
        console.log("latest query is", res);
        return res;
    }
    async getSuperModelId(modelId: string) {
        const resContent = await getManager().query(
            `select "superModelId" from text_classification_model
            where id = $1`,
            [modelId]
        );

        console.log("super model id content", resContent);
        const { superModelId } = resContent[0];
        return superModelId;
    }

    async isSuperModel(modelId: string): Promise<boolean> {
        const superModelId = await this.getSuperModelId(modelId);
        if (superModelId) return true;
        else return false;
    }

    async getSuperModel(
        subModelId: string
    ): Promise<TextClassificationModel | undefined> {
        const superModelId = await this.getSuperModelId(subModelId);
        // If you call findOne with null value typeorm just give you a one instance 🤷‍♂️
        if (!superModelId) return undefined;
        const superModel = await getRepository(TextClassificationModel).findOne(
            superModelId
        );
        console.log("super model", superModel);
        return superModel;
    }

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
        _subModel.primeModelId = superModel.primeModelId ?? superModel.id;
        _subModel.course = superModel.course;
        _subModel.superModel = superModel;
        _subModel.dataClassificationModelPath =
            superModel.dataClassificationModelPath;
        _subModel.dataLanguageModelPath = superModel.dataLanguageModelPath;
        _subModel.state = { ...superModel.state, accuracy: -1 };
        _subModel.name = `sub_module_for_${modelId}`;
        _subModel.trainingModelPath = superModel.trainingModelPath;
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

        const zipPath = `${__dirname}/../../../static/textclassification/tempzip/${modelId}.zip`;
        const extractionDir = `${__dirname}/../../../${
            process.env["MODELS_PATH"] ?? "static/textclassification"
        }`;
        console.log(
            "dirname",
            __dirname,
            "zip path",
            zipPath,
            "extract",
            extractionDir
        );
        const baseUrl = process.env["BASE_URL"] ?? "https://localhost/backend/";
        await writeFile(zipPath, zipFile);
        // extract the zip file to static folder
        try {
            await extract(zipPath, {
                dir: extractionDir,
            });
        } catch (e) {
            console.error(e);
        }
        // delete the zip file
        await unlink(zipPath);
        // create the model
        const model = await getRepository(TextClassificationModel).findOne(
            modelId
        );
        if (!model) throw new UserInputError("invalid model id");
        // add the paths to our model
        const filesPrefix = `${extractionDir}/models/${modelId}`;
        const modelLogic: ModelLogic = new ModelLogicImpl();
        const superModel = await modelLogic.getSuperModel(modelId);
        const pathPrefix = `${baseUrl}static/textclassification/models/${modelId}`;
        // if it doesn't have a super model take the files from the zip
        // else take them from the super model
        let state: any = await readFile(
            `${filesPrefix}/state_${modelId}.json`,
            {
                encoding: "utf-8",
            }
        );
        state = JSON.parse(state);
        console.log("new state is:", state, "super model", superModel);
        if (!superModel) {
            console.log("no super model");
            model.dataClassificationModelPath = `${pathPrefix}/data_classification_model_${modelId}.pkl`;
            model.dataLanguageModelPath = `${pathPrefix}/data_language_model_${modelId}.pkl`;
            model.state = state;
        } else {
            model.dataClassificationModelPath =
                superModel.dataClassificationModelPath;
            model.dataLanguageModelPath = superModel.dataLanguageModelPath;
            model.state = {
                accuracy: state.accuracy,
                model_id: state.model_name,
                Classes: superModel?.state.Classes,
            };
        }
        model.trainingModelPath = `${pathPrefix}/models/training_model_${modelId}.pth`;
        model.predictionModelPath = `${pathPrefix}/prediction_model_${modelId}.pkl`;
        model.stateFilePath = `${pathPrefix}/state_${modelId}.json`;
        console.log("model is?", model);

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
            console.log("input model", model);

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
