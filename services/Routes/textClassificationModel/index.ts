import {
    ModelsFacade,
    ModelsFacadeImpl,
} from "@controller/BusinessLogic/TextClassification/modelFacade";
import ModelLogic from "@controller/BusinessLogic/TextClassification/models-logic";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
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
        }/raise_accuracy.zip` 
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

export default router;
