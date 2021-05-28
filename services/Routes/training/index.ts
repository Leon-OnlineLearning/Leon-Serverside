import {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import { Router } from "express";
import multer from "multer";
import { onlyProfessors } from "../User/AuthorizationMiddleware";

const router = Router();

const textClassificationRelatedFilesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(
            null,
            process.env["UPLOADED_LECTURES_PATH"] ||
                "textClassificationRelatedFiles/"
        );
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}` + "-" + "related" + Date.now() + ".pdf");
    },
});

const uploader = multer({ storage: textClassificationRelatedFilesStorage });

router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

// related file uploading
router.post(
    "/related/upload",
    onlyProfessors,
    uploader.array("files"),
    (req, res) => {
        simpleFinalMWDecorator(res, async () => {
            // TODO complete this after controller lectures
        });
    }
);
