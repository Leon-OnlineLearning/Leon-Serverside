import ExamsLogicImpl from "@controller/BusinessLogic/Event/Exam/exam-logic-impl";
import {
    ModelsFacade,
    ModelsFacadeImpl,
} from "@controller/BusinessLogic/TextClassification/modelFacade";
import ModelLogic from "@controller/BusinessLogic/TextClassification/models-logic";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import {
    TestFiles,
    TestSentence,
    TestExamVideo,
} from "@controller/BusinessLogic/TextClassification/TestingQuerys/TestQueries";
import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import UserInputError from "@services/utils/UserInputError";
import getExtension from "@utils/extensionExtractor";
import { Router } from "express";
import { onlyProfessors } from "../User/AuthorizationMiddleware";
import diskStorageBuilder from "../utils/dataStorageBuilder";

const router = Router();

router.use(BlockedJWTMiddleware);
router.use(accessTokenValidationMiddleware);

const modelFilesStorage = diskStorageBuilder(
    process.env["TEXT_CLASSIFICATION_MODELS_PATH"] ??
        "static/textclassification/related",
    (file) => {
        return `model-${file.originalname}-${Date.now()}.${getExtension(
            file.originalname
        )}`;
    }
);

router.post("/raise", onlyProfessors, (req, res) => {
    // receive mode id
    const modelId = req.body["modelId"];
    // send raise request to the ml server
    const modelFacade: ModelsFacade = new ModelsFacadeImpl();
    modelFacade.requestRaise(
        modelId,
        `${
            process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
            "/text_classification"
        }/raise_accuracy`
        // There for testing
        // `${
        //     process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
        //     "/text_classification"
        // }/raise_accuracy.zip` // TODO IMPORTANT FAST remove the .zip
    );
    // send data files
    // send training* file
    res.send({ success: true });
});

router.post("/test-sentence", (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        // get the latest model
        const latestModel = await new ModelLogicImpl().getTheLatestModel(
            req.body["courseId"]
        );
        if (!latestModel) throw new Error("error in latest model");
        // send test request to the server given the course id
        const modelFacade: ModelsFacade = new ModelsFacadeImpl();
        modelFacade.requestTest(
            req.body["courseId"],
            new TestSentence(latestModel, req.body["sentence"]),
            `${
                process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
                "/text_classification"
            }/test_text`
        );
    });
});

router.post("/test-files", (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        // get the latest model
        const latestModel = await new ModelLogicImpl().getTheLatestModel(
            req.body["courseId"]
        );
        if (!latestModel) throw new Error("error in latest model");
        // send test request to the server given the course id
        const modelFacade: ModelsFacade = new ModelsFacadeImpl();
        await modelFacade.requestTest(
            req.body["courseId"],
            new TestFiles(latestModel),
            `${
                process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
                "/text_classification"
            }/test_files`
        );
    });
});

router.post("/test-exam", (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        // get the latest model
        // get course id for exam
        const courseId = await new ExamsLogicImpl().getCourseId(req.body["examId"])
        const latestModel = await new ModelLogicImpl().getTheLatestModel(
            courseId
        );
        if (!latestModel) throw new Error("error in latest model");
        // send test request to the server given the course id
        const modelFacade: ModelsFacade = new ModelsFacadeImpl();
        await modelFacade.requestTest(
            req.body["courseId"],
            new TestExamVideo(
                latestModel,
                req.body["examId"],
                req.body["studentId"]
            ),
            `${
                process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
                "/text_classification"
            }/test_video`
        );
    });
});
export default router;
