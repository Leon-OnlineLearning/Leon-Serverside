import { ModelsFacadeImpl } from "@controller/BusinessLogic/TextClassification/modelFacade";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";
import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import { Router } from "express";
import multer from "multer";
import { onlyProfessors } from "../User/AuthorizationMiddleware";

const router = Router();

const diskStorageBuilder = (
    distinction: string,
    fileNameFactory: (file: Express.Multer.File) => string
) => {
    return multer({
        storage: multer.diskStorage({
            destination: (_, __, cb) => {
                cb(null, distinction);
            },
            filename: (_, file, cb) => {
                cb(null, fileNameFactory(file));
            },
        }),
    });
};

const relatedFileStorageUploader = diskStorageBuilder(
    process.env["UPLOADED_RELATED_TRAINING_PATH"] ||
        "textClassificationRelatedFiles/",
    (file) => {
        return `${file.fieldname}` + "-" + "related" + Date.now() + ".pdf";
    }
);

const nonRelatedFileStorageUploader = diskStorageBuilder(
    process.env["UPLOADED_NON_RELATED_TRAINING_PATH"] ||
        "textClassificationNonRelatedFiles/",
    (file) => {
        return `${file.fieldname}` + "-" + "related" + Date.now() + ".pdf";
    }
);

const testFileStorageUploader = diskStorageBuilder(
    process.env["TXT_CLASSIFICATION_TEST_PATH"] ||
        "textClassificationTestingFiles/",
    (file) => {
        return `${file.fieldname}` + "-" + "related" + Date.now() + ".pdf";
    }
);

router.use(BlockedJWTMiddleware);
router.use(accessTokenValidationMiddleware);

// related file uploading
router.post(
    "/related/upload",
    onlyProfessors,
    relatedFileStorageUploader.array("files"),
    (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const modelsFacade = new ModelsFacadeImpl();
            return modelsFacade.uploadFile(
                req.files as Express.Multer.File[],
                req.body["courseId"],
                req.body["className"],
                req.body["professorId"],
                FileType.RELATED,
            );
        });
    }
);

// non-related file uploading
router.post(
    "/nonrelated/upload",
    onlyProfessors,
    nonRelatedFileStorageUploader.array("files"),
    (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const modelsFacade = new ModelsFacadeImpl();
            return modelsFacade.uploadFile(
                req.files as Express.Multer.File[],
                req.body["courseId"],
                req.body["className"],
                req.body["professorId"],
                FileType.NON_RELATED,
            );
        });
    }
);

// testing file uploading
router.post(
    "/testing/upload",
    onlyProfessors,
    testFileStorageUploader.array("files"),
    (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            const modelsFacade = new ModelsFacadeImpl();
            return modelsFacade.uploadFile(
                req.files as Express.Multer.File[],
                req.body["courseId"],
                req.body["className"],
                req.body["professorId"],
                FileType.TEST,
            );
        });
    }
);

export default router;
