import { Router } from "express";
import diskStorageBuilder from "../utils/dataStorageBuilder";

const router = Router();

const modelFilesStorage = diskStorageBuilder(
    process.env["TEXT_CLASSIFICATION_MODELS_PATH"] ??
        "static/textclassification/related",
    (file) => {
        return `model-${file.originalname}-${Date.now()}.zip`;
    }
);

// TODO create the end point that will recive files
// from the tcs
router.post("/", modelFilesStorage.single("model_files"), (req, res) => {

});

export default router;
