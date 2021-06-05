import ModelLogic from "@controller/BusinessLogic/TextClassification/models-logic";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
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
        return `model-${file.originalname}-${Date.now()}.zip`;
    }
);

// TODO create the end point that will recive files
// from the tcs
// router.post("/", (req, res) => {
//     simpleFinalMWDecorator(res, async () => {

//     })
// });

router.post("/raise", onlyProfessors, (req, res) => {
    // receive mode id
    const modelId = req.body["modelId"];
    // send raise request to the ml server
    const modelLogic: ModelLogic = new ModelLogicImpl();
    modelLogic.createSubModel(modelId);
    // send data files
    // send training* file
    res.send({ success: true });
});

export default router;
