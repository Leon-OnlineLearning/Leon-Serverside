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
    (file: Express.Multer.File) => {
        return `${file.originalname}` + "-" + "related" + Date.now() + ".pdf";
    }
);

const nonRelatedFileStorageUploader = diskStorageBuilder(
    process.env["UPLOADED_NON_RELATED_TRAINING_PATH"] ||
        "textClassificationNonRelatedFiles/",
    (file: Express.Multer.File) => {
        return `${file.originalname}` + "-" + "related" + Date.now() + ".pdf";
    }
);

const testFileStorageUploader = diskStorageBuilder(
    process.env["TXT_CLASSIFICATION_TEST_PATH"] ||
        "textClassificationTestingFiles/",
    (file: Express.Multer.File) => {
        return `${file.originalname}` + "-" + "related" + Date.now() + ".pdf";
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

export default router;
