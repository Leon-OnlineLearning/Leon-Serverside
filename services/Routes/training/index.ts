import FileLogicImpl from "@controller/BusinessLogic/TextClassification/file-logic-impl";
import TextClassificationFilesLogic from "@controller/BusinessLogic/TextClassification/files-logic";
import {
    ModelsFacade,
    ModelsFacadeImpl,
} from "@controller/BusinessLogic/TextClassification/modelFacade";
import ProfessorLogic from "@controller/BusinessLogic/User/Professor/professors-logic";
import ProfessorLogicImpl from "@controller/BusinessLogic/User/Professor/professors-logic-impl";
import { FileType } from "@models/TextClassification/TextClassificationModelFile";
import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import UserInputError from "@services/utils/UserInputError";
import { Router } from "express";
import multer from "multer";
import { onlyProfessors } from "../User/AuthorizationMiddleware";
import { Response, Request } from "express";
import ModelLogicImpl from "@controller/BusinessLogic/TextClassification/models-logic-impl";
import ModelLogic from "@controller/BusinessLogic/TextClassification/models-logic";
import diskStorageBuilder from "@services/Routes/utils/dataStorageBuilder";
import getExtension from "@utils/extensionExtractor";
import axios from "axios";
import fs from "fs";
import extract from "extract-zip";
import { TestFiles } from "@controller/BusinessLogic/TextClassification/TestingQuerys/TestQueries";

const router = Router();

const relatedFileStorageUploader = diskStorageBuilder(
    process.env["UPLOADED_RELATED_TRAINING_PATH"] ||
        "static/textclassification/related/",
    (file: Express.Multer.File) => {
        return (
            `${file.originalname.replaceAll(" ", "_").split(".")[0]}` +
            "-" +
            "related" +
            Date.now() +
            getExtension(file.originalname)
        );
    }
);

const nonRelatedFileStorageUploader = diskStorageBuilder(
    process.env["UPLOADED_NON_RELATED_TRAINING_PATH"] ||
        "static/textclassification/non_related",
    (file: Express.Multer.File) => {
        return (
            `${file.originalname.replaceAll(" ", "_").split(".")[0]}` +
            "-" +
            "non-related" +
            Date.now() +
            getExtension(file.originalname)
        );
    }
);

const testFileStorageUploader = diskStorageBuilder(
    process.env["TXT_CLASSIFICATION_TEST_PATH"] ||
        "static/textclassification/testing",
    (file: Express.Multer.File) => {
        return (
            `${file.originalname
                .replaceAll(" ", "_")
                .split(".")[0]
                .toLowerCase()}` +
            "-" +
            "related" +
            Date.now() +
            getExtension(file.originalname)
        );
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
                FileType.RELATED
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
                FileType.NON_RELATED
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
                FileType.TEST
            );
        });
    }
);

// expected input /training/files?searchTerm=:searchTerm
router.get("/files", (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        // get the search term from the request
        const searchTerm = req.query["searchTerm"] as string;
        const filesLogic: TextClassificationFilesLogic = new FileLogicImpl();
        return filesLogic.getFilesByName(searchTerm);
    });
});

const existingMiddlewareFactory = (relation: FileType) => {
    return async (req: Request, res: Response) => {
        const professorId = req.body["professorId"];
        console.log("/related/existing professorId", professorId);
        const professorLogic: ProfessorLogic = new ProfessorLogicImpl();

        let modelId: string | undefined;

        try {
            modelId = await professorLogic.getTextClassificationSessionId(
                professorId
            );
        } catch (e) {
            if (e instanceof UserInputError) {
                res.status(400).send({
                    success: false,
                    message: e.message,
                });
            } else throw e;
        }
        if (!modelId) {
            res.status(403).send({
                success: false,
                message: "invalid session state",
            });
            return;
        }
        simpleFinalMWDecorator(res, async () => {
            // get files ids from the use
            const filesIds = req.body["files"];
            // get the class name from the user
            const className = req.body["className"];
            // related the files
            const modelsFacade: ModelsFacade = new ModelsFacadeImpl();
            return await modelsFacade.addExistingFiles(
                filesIds,
                modelId as string,
                relation,
                className
            );
        });
    };
};

router.post("/related/existing", existingMiddlewareFactory(FileType.RELATED));
router.post(
    "/nonrelated/existing",
    existingMiddlewareFactory(FileType.NON_RELATED)
);

router.post("/finish", async (req, res) => {
    const professorLogic: ProfessorLogic = new ProfessorLogicImpl();
    const sessionId = await professorLogic.getTextClassificationSessionId(
        req.body["professorId"]
    );
    if (!sessionId) {
        return res
            .status(403)
            .send({ success: false, message: "Invalid session" });
    }
    await professorLogic.unsetSessionId(req.body["professorId"]);
    // i didn't use the decorator here because
    // i want to access the res object directly
    const modelsFacade: ModelsFacade = new ModelsFacadeImpl();
    modelsFacade
        .sendModelFiles(
            sessionId,
            `${process.env["TEXT_CLASSIFICATION_BASE_URL"]}/train` ??
                "/text_classification/train"
        )
        .then(async (res) => {
            console.log("files received");

            const modelLogic: ModelLogic = new ModelLogicImpl();
            const latestModel = await modelLogic.receiveModelFiles(
                sessionId,
                res
            );
            console.log("latest model is", latestModel);
            if (!latestModel) throw new Error("error in latest model");
            // send test request to the server given the course id
            const modelFacade: ModelsFacade = new ModelsFacadeImpl();
            modelFacade.requestTest(
                new TestFiles(latestModel, req.body["courseId"]),
                `${
                    process.env["TEXT_CLASSIFICATION_BASE_URL"] ??
                    "/text_classification"
                }/test_files`
            );
        })
        .catch((error) => {
            console.error("ML error", error.message);
        });
    // send response to the client
    res.send({ success: true });
});

router.get("/models", (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const modelLogic: ModelLogic = new ModelLogicImpl();
        return modelLogic.getAllModels();
    });
});

export default router;
