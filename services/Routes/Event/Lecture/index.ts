import passport, {
    accessTokenValidationMiddleware,
    BlockedJWTMiddleware,
} from "@services/Auth";
import { Router } from "express";
import BodyParserMiddleware from "@services/Routes/BodyParserMiddleware/BodyParserMiddleware";
import LectureParser, {
    LectureRequest,
} from "@services/Routes/BodyParserMiddleware/LectureParser";
import LecturesLogic from "@controller/BusinessLogic/Event/Lecture/lectures-logic";
import LecturesLogicImpl from "@controller/BusinessLogic/Event/Lecture/lectures-logic-impl";
import { onlyProfessors } from "@services/Routes/User/AuthorizationMiddleware";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import multer from "multer";
import Lecture from "@models/Events/Lecture/Lecture";
import UserInputError from "@services/utils/UserInputError";
import { sendLectureVideo } from "@controller/sending/sendFiles";
import fs from "fs/promises";

const router = Router();

const lecturesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env["UPLOADED_LECTURES_PATH"] || "lectures/");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}` + "-" + Date.now() + ".pdf");
    },
});

const uploader = multer({ storage: lecturesStorage });

router.use(BlockedJWTMiddleware);
// router.use(passport.authenticate("access-token", { session: false }));
router.use(accessTokenValidationMiddleware);

const parser: BodyParserMiddleware = new LectureParser();

router.get("/:lectureId", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl();
        const exam = await logic.getLectureById(req.params.lectureId);
        return exam;
    });
});

router.post(
    "/",
    onlyProfessors,
    uploader.single("lectureFile"),
    parser.completeParser,
    async (req, res) => {
        simpleFinalMWDecorator(
            res,
            async () => {
                const logic: LecturesLogic = new LecturesLogicImpl();
                const lectReq = req as LectureRequest;
                const lecture = await logic.createLecture(lectReq.lecture);
                return lecture;
            },
            201
        );
    }
);

router.put("/:lectureId", parser.completeParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl();
        const lectReq = req as LectureRequest;
        const lecture = await logic.updateLecture(
            req.params.lectureId,
            lectReq.lecture
        );
        return lecture;
    });
});

router.patch("/:lectureId", parser.partialParser, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl();
        const lecReq = req as LectureRequest;
        const exam = await logic.updateLecture(
            req.params.lectureId,
            lecReq.lecture
        );
        return exam;
    });
});

router.delete("/:lectureId", async (req, res) => {
    simpleFinalMWDecorator(
        res,
        async () => {
            const logic: LecturesLogic = new LecturesLogicImpl();
            await logic.deleteLectureById(req.params.lectureId);
        },
        204
    );
});

router.get("/:lectureId/students", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl();
        return logic.getStudentsForLecture(req.params.lectureId);
    });
});

// TODO this should be replaced with a proper saving lecture mechanism
router.post("/:lectureId/video", async (req, res) => {
    if (!process.env["TESTING"]) {
        res.status(403).send({
            success: false,
            message: "This is for testing only",
        });
        return;
    }
    console.debug(
        "WARNING: This end point is enabled by the testing flag it is not meant for production"
    );
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl();
        // TODO get lecture from a proper source probably a stream
        fs.readFile(
            `${__dirname}/../../../../static/recording/recording.mp4`
        ).then((file) => {
            sendLectureVideo(
                file,
                req.params["lectureId"],
                async (data) => {
                    await logic.storeLectureTranscript(
                        req.params["lectureId"],
                        data
                    );
                },
                `${process.env["LECTURES_VIDEO_SERVER_BASE_URL"]}/lecture/video` ??
                    "http://text-classification:9000/lecture/video"
            );
        });
        return;
    });
});
export default router;
