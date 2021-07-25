import {
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
import {
    onlyProfessors,
    onlyStudentOrProfessor,
} from "@services/Routes/User/AuthorizationMiddleware";
import simpleFinalMWDecorator from "@services/utils/RequestDecorator";
import multer from "multer";
import { sendLectureVideo } from "@controller/sending/sendFiles";
import { promises } from "fs";
import { userTockenData } from "../event.routes";
import LiveRoomLogicImpl from "@controller/BusinessLogic/Event/LiveRoom/liveRoom-logic-imp";
import UserTypes from "@models/Users/UserTypes";
import StudentLogicImpl from "@controller/BusinessLogic/User/Student/students-logic-impl";
import StudentLogic from "@controller/BusinessLogic/User/Student/students-logic";

const readFile = promises.readFile;
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

router.get("/enter/:lectureId", onlyStudentOrProfessor, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const user = req.user as userTockenData;

        const audioRoom = await new LiveRoomLogicImpl().enter_lecture_room(
            req.params.lectureId,
            user.role as UserTypes.STUDENT | UserTypes.PROFESSOR
        );
        console.debug(`sending live room with id ${audioRoom.roomId}`);
        // attend lecture
        if (user.role === UserTypes.STUDENT) {
            const studentLogic: StudentLogic = new StudentLogicImpl();
            await studentLogic.attendLecture(user.id, req.params.lectureId);
        }

        return audioRoom;
    });
});

router.get("/end/:lectureId", onlyProfessors, async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const lectureLogic = new LecturesLogicImpl();
        const lectureId = req.params.lectureId;

        try {
            await new LiveRoomLogicImpl().close_lecture_room(lectureId);
        } catch (error) {
            console.debug(error);
            throw new Error("cannot close room");
        }
        //REVIEW it may be required to wait a little until the recording is saved
        lectureLogic
            .transferRemoteRecording(lectureId)
            .then(async (filePath) => {
                try {
                    if (!filePath) {
                        throw new Error("lecture recoding not available");
                    }
                    sendLectureVideo(
                        await readFile(filePath),
                        req.params["lectureId"],
                        async (data) => {
                            await new LecturesLogicImpl().storeLectureTranscript(
                                req.params["lectureId"],
                                data
                            );
                        },
                        `${process.env["LECTURES_VIDEO_SERVER_BASE_URL"]}/lecture/video` ??
                            "http://text-classification:9000/lecture/video"
                    );
                } catch (error) {
                    console.error(error);
                }
            });

        return "OK";
    });
});
router.get("/:lectureId", async (req, res) => {
    simpleFinalMWDecorator(res, async () => {
        const logic: LecturesLogic = new LecturesLogicImpl();
        const lecture = await logic.getLectureById(req.params.lectureId);
        return lecture;
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
        readFile(
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
